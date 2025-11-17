'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Crown, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react'
import Card from '@/app/components/Card'
import Badge from '@/app/components/Badge'

interface Cliente {
  id: number
  discordUsername: string
  tier: string
  totalCompras: number
  totalGasto: number
  primeiraCompra: string | null
  ultimaCompra: string | null
  _count?: {
    pedidos: number
  }
}

export default function ClientesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      carregarClientes()
    }
  }, [status, router])

  const carregarClientes = async () => {
    try {
      const res = await fetch('/api/clientes')
      if (res.ok) {
        const data = await res.json()
        setClientes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      BRONZE: 'bg-orange-100 text-orange-800 border-orange-200',
      PRATA: 'bg-gray-100 text-gray-800 border-gray-300',
      OURO: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      PLATINA: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      DIAMANTE: 'bg-blue-100 text-blue-800 border-blue-300'
    }
    return colors[tier] || 'bg-gray-100 text-gray-800'
  }

  const getTierIcon = (tier: string) => {
    const icons: Record<string, string> = {
      BRONZE: '🥉',
      PRATA: '🥈',
      OURO: '🥇',
      PLATINA: '💎',
      DIAMANTE: '💠'
    }
    return icons[tier] || '•'
  }

  const stats = {
    totalClientes: clientes.length,
    vips: clientes.filter(c => ['OURO', 'PLATINA', 'DIAMANTE'].includes(c.tier)).length,
    totalGasto: clientes.reduce((acc, c) => acc + c.totalGasto, 0),
    mediaCompras: clientes.length > 0 
      ? (clientes.reduce((acc, c) => acc + c.totalCompras, 0) / clientes.length).toFixed(1)
      : 0
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-600">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              👑 Clientes VIP
            </h1>
            <p className="text-slate-600">
              Sistema de fidelidade e histórico de compras
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            ← Voltar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Total Clientes</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalClientes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Clientes VIP</p>
                <p className="text-2xl font-bold text-slate-900">{stats.vips}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Total Faturado</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalGasto}KK</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Média Compras</p>
                <p className="text-2xl font-bold text-slate-900">{stats.mediaCompras}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabela de Clientes */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Ranking de Clientes
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-sm font-bold text-slate-700">#</th>
                  <th className="text-left py-3 px-2 text-sm font-bold text-slate-700">Cliente</th>
                  <th className="text-left py-3 px-2 text-sm font-bold text-slate-700">Tier</th>
                  <th className="text-center py-3 px-2 text-sm font-bold text-slate-700">Compras</th>
                  <th className="text-center py-3 px-2 text-sm font-bold text-slate-700">Total Gasto</th>
                  <th className="text-center py-3 px-2 text-sm font-bold text-slate-700">Primeira</th>
                  <th className="text-center py-3 px-2 text-sm font-bold text-slate-700">Última</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente, idx) => (
                  <tr key={cliente.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 text-sm text-slate-600">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-slate-900">{cliente.discordUsername}</p>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getTierColor(cliente.tier)}`}>
                        {getTierIcon(cliente.tier)} {cliente.tier}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-sm font-bold text-slate-900">
                      {cliente.totalCompras}
                    </td>
                    <td className="py-3 px-2 text-center text-sm font-bold text-green-600">
                      {cliente.totalGasto}KK
                    </td>
                    <td className="py-3 px-2 text-center text-xs text-slate-600">
                      {cliente.primeiraCompra 
                        ? new Date(cliente.primeiraCompra).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td className="py-3 px-2 text-center text-xs text-slate-600">
                      {cliente.ultimaCompra 
                        ? new Date(cliente.ultimaCompra).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {clientes.length === 0 && (
              <div className="text-center py-12">
                <Crown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Nenhum cliente ainda</p>
              </div>
            )}
          </div>
        </Card>

        {/* Sistema de Tiers */}
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            📊 Sistema de Fidelidade
          </h2>
          
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-3xl mb-2">🥉</p>
              <p className="font-bold text-orange-800">Bronze</p>
              <p className="text-xs text-orange-600 mt-1">0-2 compras</p>
              <p className="text-sm font-bold text-orange-800 mt-2">5% desconto</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-300">
              <p className="text-3xl mb-2">🥈</p>
              <p className="font-bold text-gray-800">Prata</p>
              <p className="text-xs text-gray-600 mt-1">3-5 compras</p>
              <p className="text-sm font-bold text-gray-800 mt-2">5% desconto</p>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-300">
              <p className="text-3xl mb-2">🥇</p>
              <p className="font-bold text-yellow-800">Ouro</p>
              <p className="text-xs text-yellow-600 mt-1">6-10 compras</p>
              <p className="text-sm font-bold text-yellow-800 mt-2">10% desconto</p>
            </div>

            <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-300">
              <p className="text-3xl mb-2">💎</p>
              <p className="font-bold text-cyan-800">Platina</p>
              <p className="text-xs text-cyan-600 mt-1">11-20 compras</p>
              <p className="text-sm font-bold text-cyan-800 mt-2">15% desconto</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-300">
              <p className="text-3xl mb-2">💠</p>
              <p className="font-bold text-blue-800">Diamante</p>
              <p className="text-xs text-blue-600 mt-1">21+ compras</p>
              <p className="text-sm font-bold text-blue-800 mt-2">20% desconto</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

