'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Wallet
} from 'lucide-react'

interface EstatisticaJogador {
  jogador: {
    id: number
    nick: string
    essencial: boolean
  }
  carrysConcluidos: number
  carrysFuturos: number
  totalCarrys: number
  valorRecebido: number
  valorAReceber: number
  valorTotal: number
}

interface Recebimentos {
  estatisticas: EstatisticaJogador[]
  totais: {
    totalCarrysConcluidos: number
    totalCarrysFuturos: number
    totalCarrys: number
    valorTotalRecebido: number
    valorTotalAReceber: number
    valorTotalGeral: number
  }
}

// Removido - não precisamos mais da API de análise de demanda

export default function ResumoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recebimentos, setRecebimentos] = useState<Recebimentos | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      carregarDados()
    }
  }, [status, router])

  const carregarDados = async () => {
    try {
      const resRecebimentos = await fetch('/api/analytics/recebimentos')
      
      if (resRecebimentos.ok) {
        const data = await resRecebimentos.json()
        setRecebimentos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarValor = (valor: number) => {
    if (valor >= 100000) {
      return `${(valor / 100000).toFixed(2)}b`
    }
    return `${valor}kk`
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (!recebimentos) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Erro ao carregar dados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Resumo e Análise de Carrys
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Recebimentos, estatísticas e previsões do time
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Totais Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Já Recebido
              </h3>
            </div>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">
              {formatarValor(recebimentos.totais.valorTotalRecebido)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {recebimentos.totais.totalCarrysConcluidos} carrys concluídos
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                A Receber
              </h3>
            </div>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-1">
              {formatarValor(recebimentos.totais.valorTotalAReceber)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {recebimentos.totais.totalCarrysFuturos} carrys agendados
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Geral
              </h3>
            </div>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-1">
              {formatarValor(recebimentos.totais.valorTotalGeral)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {recebimentos.totais.totalCarrys} carrys no total
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Próximos 30 Dias
              </h3>
            </div>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-400 mb-1">
              {recebimentos.totais.totalCarrysFuturos}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              carrys agendados
            </p>
          </Card>
        </div>

        {/* Tabela de Jogadores */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6" />
              Recebimentos por Jogador (Time Principal)
            </h2>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-sm px-3 py-1">
              11 Jogadores
            </Badge>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Jogador</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Concluídos</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Futuros</th>
                  <th className="text-right py-3 px-4 font-semibold text-green-700 dark:text-green-400">Recebido</th>
                  <th className="text-right py-3 px-4 font-semibold text-blue-700 dark:text-blue-400">A Receber</th>
                  <th className="text-right py-3 px-4 font-semibold text-purple-700 dark:text-purple-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {recebimentos.estatisticas.map((stat, index) => (
                  <tr 
                    key={stat.jogador.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm
                        ${index < 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-400 dark:bg-gray-600'}
                      `}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {stat.jogador.nick}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="success">{stat.carrysConcluidos}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="info">{stat.carrysFuturos}</Badge>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-green-700 dark:text-green-400">
                      {formatarValor(stat.valorRecebido)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-blue-700 dark:text-blue-400">
                      {formatarValor(stat.valorAReceber)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-lg text-purple-700 dark:text-purple-400">
                      {formatarValor(stat.valorTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-bold bg-gray-50 dark:bg-gray-800/50">
                  <td colSpan={2} className="py-4 px-4 text-gray-900 dark:text-white">TOTAL GERAL</td>
                  <td className="py-4 px-4 text-center text-gray-900 dark:text-white">{recebimentos.totais.totalCarrysConcluidos}</td>
                  <td className="py-4 px-4 text-center text-gray-900 dark:text-white">{recebimentos.totais.totalCarrysFuturos}</td>
                  <td className="py-4 px-4 text-right text-green-700 dark:text-green-400">{formatarValor(recebimentos.totais.valorTotalRecebido)}</td>
                  <td className="py-4 px-4 text-right text-blue-700 dark:text-blue-400">{formatarValor(recebimentos.totais.valorTotalAReceber)}</td>
                  <td className="py-4 px-4 text-right text-lg text-purple-700 dark:text-purple-400">{formatarValor(recebimentos.totais.valorTotalGeral)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
