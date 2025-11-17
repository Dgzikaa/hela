'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  ShoppingCart, 
  Users, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'

interface Pedido {
  id: number
  nomeCliente: string
  contatoCliente: string
  status: string
  valorTotal: number
  conquistaSemMorrer: boolean
  pacoteCompleto: boolean
  createdAt: string
  itens: {
    boss: {
      nome: string
      imagemUrl: string
    }
  }[]
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      carregarPedidos()
    }
  }, [status, router])

  const carregarPedidos = async () => {
    try {
      const res = await fetch('/api/pedidos')
      if (res.ok) {
        const data = await res.json()
        setPedidos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const aprovarPedido = async (pedidoId: number) => {
    try {
      const res = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pedidoId,
          status: 'APROVADO',
          aprovadoPor: parseInt(session?.user?.id || '0')
        })
      })

      if (res.ok) {
        carregarPedidos()
      }
    } catch (error) {
      console.error('Erro ao aprovar pedido:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDENTE: 'warning',
      APROVADO: 'info',
      AGENDADO: 'info',
      EM_ANDAMENTO: 'default',
      CONCLUIDO: 'success',
      CANCELADO: 'danger'
    }
    return variants[status] || 'default'
  }

  const pedidosPendentes = pedidos.filter(p => p.status === 'PENDENTE').length
  const pedidosHoje = pedidos.filter(p => {
    const hoje = new Date().toDateString()
    return new Date(p.createdAt).toDateString() === hoje
  }).length
  const valorTotal = pedidos
    .filter(p => p.status !== 'CANCELADO')
    .reduce((acc, p) => acc + p.valorTotal, 0)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-600">Carregando...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-400">
            Bem-vindo, <strong className="text-white">{session.user.name}</strong>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Pendentes</p>
                <p className="text-2xl font-bold text-slate-900">{pedidosPendentes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Hoje</p>
                <p className="text-2xl font-bold text-slate-900">{pedidosHoje}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{pedidos.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Valor Total</p>
                <p className="text-2xl font-bold text-slate-900">{valorTotal}KK</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Pedidos */}
        <Card>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Pedidos Recentes
          </h2>

          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">
                      {pedido.nomeCliente}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {pedido.contatoCliente}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(pedido.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusBadge(pedido.status)}>
                      {pedido.status}
                    </Badge>
                    <p className="text-lg font-bold text-slate-900 mt-2">
                      {pedido.valorTotal}KK
                    </p>
                  </div>
                </div>

                {/* Bosses */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {pedido.itens.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg"
                    >
                      <img
                        src={item.boss.imagemUrl}
                        alt={item.boss.nome}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-xs font-medium text-slate-700">
                        {item.boss.nome}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Extras */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {pedido.pacoteCompleto && (
                    <Badge variant="success">🎁 Pacote Completo</Badge>
                  )}
                  {pedido.conquistaSemMorrer && (
                    <Badge variant="info">⭐ Sem Morrer</Badge>
                  )}
                </div>

                {/* Ações */}
                {pedido.status === 'PENDENTE' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => aprovarPedido(pedido.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprovar
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {pedidos.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Nenhum pedido ainda</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

