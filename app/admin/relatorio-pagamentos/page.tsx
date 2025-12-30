'use client'

import { useEffect, useState } from 'react'
import { DollarSign, Calendar, User, AlertCircle, CheckCircle, Clock, TrendingUp, Download } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import { Button } from '@/app/components/Button'
import { ToolsLayout } from '@/app/components/ToolsLayout'

interface Boss {
  id: number
  nome: string
  preco: number
  ordem: number
}

interface Pedido {
  id: number
  nomeCliente: string
  contatoCliente: string
  status: string
  statusPagamento?: string
  dataAgendada: string | null
  horario?: string | null
  valorTotal: number
  valorFinal: number
  observacoes?: string | null
  itens: {
    id: number
    preco: number
    boss: Boss
  }[]
}

export default function RelatorioPagamentosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'TODOS' | 'NAO_PAGO' | 'SINAL'>('TODOS')

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    try {
      const res = await fetch('/api/pedidos')
      if (res.ok) {
        const data = await res.json()
        // Filtrar apenas pedidos agendados ou em andamento (não concluídos/cancelados)
        const pedidosAtivos = data.filter((p: Pedido) => 
          ['AGENDADO', 'EM_ANDAMENTO', 'PENDENTE'].includes(p.status)
        )
        setPedidos(pedidosAtivos)
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'TODOS') return p.statusPagamento !== 'PAGO'
    return p.statusPagamento === filtro
  })

  // Ordenar por data (mais próximo primeiro)
  const pedidosOrdenados = pedidosFiltrados.sort((a, b) => {
    if (!a.dataAgendada && !b.dataAgendada) return 0
    if (!a.dataAgendada) return 1
    if (!b.dataAgendada) return -1
    return new Date(a.dataAgendada).getTime() - new Date(b.dataAgendada).getTime()
  })

  // Estatísticas
  const stats = {
    totalPendente: pedidos.filter(p => p.statusPagamento !== 'PAGO').length,
    naoPago: pedidos.filter(p => p.statusPagamento === 'NAO_PAGO').length,
    sinal: pedidos.filter(p => p.statusPagamento === 'SINAL').length,
    valorTotal: pedidos
      .filter(p => p.statusPagamento !== 'PAGO')
      .reduce((sum, p) => sum + p.valorTotal, 0),
    valorRecebido: pedidos
      .filter(p => p.statusPagamento === 'SINAL')
      .reduce((sum, p) => sum + 2000000000, 0), // 2b por sinal
    valorFaltando: pedidos
      .filter(p => p.statusPagamento === 'SINAL')
      .reduce((sum, p) => sum + 1500000000, 0) + // 1.5b por sinal
      pedidos
        .filter(p => p.statusPagamento === 'NAO_PAGO')
        .reduce((sum, p) => sum + p.valorTotal, 0)
  }

  const formatarValor = (valor: number) => {
    if (valor >= 1000000000) {
      return `${(valor / 1000000000).toFixed(2)}b`
    }
    return `${(valor / 1000000).toFixed(0)}kk`
  }

  const formatarData = (dataStr: string | null) => {
    if (!dataStr) return 'Sem data'
    const data = new Date(dataStr)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusPagamentoBadge = (status: string | undefined) => {
    if (status === 'PAGO') {
      return <Badge variant="success">✅ Pago</Badge>
    } else if (status === 'SINAL') {
      return <Badge variant="warning">🟡 Sinal (2b)</Badge>
    }
    return <Badge variant="danger">🔴 Não Pago</Badge>
  }

  const exportarCSV = () => {
    const headers = ['Cliente', 'Contato', 'Data', 'Valor Total', 'Status Pagamento', 'Faltando', 'Observações']
    const rows = pedidosOrdenados.map(p => [
      p.nomeCliente,
      p.contatoCliente,
      formatarData(p.dataAgendada),
      formatarValor(p.valorTotal),
      p.statusPagamento || 'NAO_PAGO',
      p.statusPagamento === 'SINAL' ? '1.5b' : formatarValor(p.valorTotal),
      p.observacoes || ''
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-pagamentos-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <ToolsLayout title="💰 Relatório de Pagamentos">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </ToolsLayout>
    )
  }

  return (
    <ToolsLayout title="💰 Relatório de Pagamentos">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header com Ações */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pagamentos Pendentes</h2>
            <p className="text-gray-600">Acompanhe os pagamentos em aberto</p>
          </div>
          <Button onClick={exportarCSV} variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-semibold mb-1">Não Pagos</p>
                <p className="text-3xl font-bold text-red-700">{stats.naoPago}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-semibold mb-1">Sinais Pagos</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.sinal}</p>
                <p className="text-xs text-yellow-600">Faltando 1.5b cada</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-400" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-semibold mb-1">Valor Recebido</p>
                <p className="text-2xl font-bold text-blue-700">{formatarValor(stats.valorRecebido)}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-semibold mb-1">Valor Faltando</p>
                <p className="text-2xl font-bold text-purple-700">{formatarValor(stats.valorFaltando)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('TODOS')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtro === 'TODOS'
                ? 'bg-gray-700 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Todos ({stats.totalPendente})
          </button>
          <button
            onClick={() => setFiltro('NAO_PAGO')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtro === 'NAO_PAGO'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🔴 Não Pagos ({stats.naoPago})
          </button>
          <button
            onClick={() => setFiltro('SINAL')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtro === 'SINAL'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🟡 Sinais ({stats.sinal})
          </button>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-3">
          {pedidosOrdenados.length > 0 ? (
            pedidosOrdenados.map(pedido => {
              const valorFaltando = pedido.statusPagamento === 'SINAL' 
                ? 1500000000 
                : pedido.valorTotal
              
              const isUrgente = pedido.dataAgendada && 
                new Date(pedido.dataAgendada) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

              return (
                <Card 
                  key={pedido.id}
                  className={`hover:shadow-lg transition-all ${
                    isUrgente ? 'border-l-4 border-l-red-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900">{pedido.nomeCliente}</h3>
                        {getStatusPagamentoBadge(pedido.statusPagamento)}
                        {isUrgente && (
                          <Badge variant="danger" className="animate-pulse">
                            ⚠️ URGENTE
                          </Badge>
                        )}
                      </div>

                      {/* Informações */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            <strong>Data:</strong> {formatarData(pedido.dataAgendada)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span>
                            <strong>Contato:</strong> {pedido.contatoCliente}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            <strong>Valor Total:</strong> {formatarValor(pedido.valorTotal)}
                          </span>
                        </div>
                      </div>

                      {/* Valor Faltando */}
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                          <span className="text-sm text-red-600 font-semibold">
                            Faltando: <span className="text-lg">{formatarValor(valorFaltando)}</span>
                          </span>
                        </div>
                        {pedido.statusPagamento === 'SINAL' && (
                          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-sm text-green-600 font-semibold">
                              Recebido: <span className="text-lg">2.0b</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Observações */}
                      {pedido.observacoes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>📝 Observações:</strong> {pedido.observacoes}
                          </p>
                        </div>
                      )}

                      {/* Bosses */}
                      <div className="flex gap-2 flex-wrap">
                        {pedido.itens.map(item => (
                          <Badge key={item.id} variant="info" className="text-xs">
                            {item.boss.nome}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card>
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Nenhum pagamento pendente!
                </h3>
                <p className="text-gray-500">
                  Todos os carrys estão com pagamento em dia
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Resumo Final */}
        {pedidosOrdenados.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Resumo Financeiro</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    <strong>Total a Receber:</strong> {formatarValor(stats.valorFaltando)}
                  </p>
                  <p className="text-gray-700">
                    <strong>Já Recebido (Sinais):</strong> {formatarValor(stats.valorRecebido)}
                  </p>
                  <p className="text-gray-700">
                    <strong>Valor Total dos Carrys:</strong> {formatarValor(stats.valorTotal)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Progresso de Pagamento</p>
                <p className="text-4xl font-bold text-purple-600">
                  {((stats.valorRecebido / stats.valorTotal) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </ToolsLayout>
  )
}
