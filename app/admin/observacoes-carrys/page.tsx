'use client'

import { useEffect, useState } from 'react'
import { Calendar, Save, Edit2, X, Check, DollarSign, User, Clock } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import { Button } from '@/app/components/Button'
import { ToolsLayout } from '@/app/components/ToolsLayout'
import { useToast } from '@/app/hooks/useToast'
import { ToastContainer } from '@/app/components/Toast'

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

export default function ObservacoesCarrysPage() {
  const toast = useToast()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [observacoesTemp, setObservacoesTemp] = useState<Record<number, string>>({})
  const [salvandoId, setSalvandoId] = useState<number | null>(null)

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    try {
      const res = await fetch('/api/pedidos')
      if (res.ok) {
        const data = await res.json()
        // Filtrar apenas pedidos agendados ou em andamento
        const pedidosAtivos = data
          .filter((p: Pedido) => ['AGENDADO', 'EM_ANDAMENTO'].includes(p.status))
          .sort((a: Pedido, b: Pedido) => {
            if (!a.dataAgendada && !b.dataAgendada) return 0
            if (!a.dataAgendada) return 1
            if (!b.dataAgendada) return -1
            return new Date(a.dataAgendada).getTime() - new Date(b.dataAgendada).getTime()
          })
        setPedidos(pedidosAtivos)
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      toast.error('Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const iniciarEdicao = (pedido: Pedido) => {
    setEditandoId(pedido.id)
    setObservacoesTemp({
      ...observacoesTemp,
      [pedido.id]: pedido.observacoes || ''
    })
  }

  const cancelarEdicao = (pedidoId: number) => {
    setEditandoId(null)
    const temp = { ...observacoesTemp }
    delete temp[pedidoId]
    setObservacoesTemp(temp)
  }

  const salvarObservacoes = async (pedido: Pedido) => {
    setSalvandoId(pedido.id)
    try {
      const novasObservacoes = observacoesTemp[pedido.id] || ''
      
      const res = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pedido.id,
          observacoes: novasObservacoes
        })
      })

      if (res.ok) {
        toast.success('Observações salvas com sucesso!')
        setEditandoId(null)
        
        // Atualizar localmente
        setPedidos(pedidos.map(p => 
          p.id === pedido.id 
            ? { ...p, observacoes: novasObservacoes }
            : p
        ))
        
        // Limpar temp
        const temp = { ...observacoesTemp }
        delete temp[pedido.id]
        setObservacoesTemp(temp)
      } else {
        toast.error('Erro ao salvar observações')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar observações')
    } finally {
      setSalvandoId(null)
    }
  }

  const formatarData = (dataStr: string | null) => {
    if (!dataStr) return 'Sem data'
    const data = new Date(dataStr)
    return data.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatarHorario = (horario: string | null | undefined) => {
    if (!horario) return '21:00'
    try {
      const horarioStr = typeof horario === 'string' ? horario : String(horario)
      return horarioStr.substring(0, 5)
    } catch (e) {
      return '21:00'
    }
  }

  const getStatusPagamentoBadge = (status: string | undefined) => {
    if (status === 'PAGO') {
      return <Badge variant="success" className="font-semibold">✅ PAGO</Badge>
    } else if (status === 'SINAL') {
      return <Badge variant="warning" className="font-semibold">🟡 SINAL (2b)</Badge>
    }
    return <Badge variant="danger" className="font-semibold">🔴 NÃO PAGO</Badge>
  }

  // Agrupar por data
  const pedidosAgrupados: Record<string, Pedido[]> = {}
  pedidos.forEach(pedido => {
    if (pedido.dataAgendada) {
      const data = pedido.dataAgendada.split('T')[0]
      if (!pedidosAgrupados[data]) {
        pedidosAgrupados[data] = []
      }
      pedidosAgrupados[data].push(pedido)
    }
  })

  const datasOrdenadas = Object.keys(pedidosAgrupados).sort()

  if (loading) {
    return (
      <ToolsLayout title="📝 Gerenciar Observações">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </ToolsLayout>
    )
  }

  return (
    <ToolsLayout title="📝 Gerenciar Observações dos Carrys">
      <ToastContainer toasts={toast.toasts} onClose={toast.dismiss} />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Observações dos Carrys</h2>
          <p className="text-gray-600">
            Gerencie informações extras como Discord, sacolas de zeny, e outras notas importantes
          </p>
        </div>

        {/* Dicas */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2">Dicas para Observações:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Discord:</strong> Nome do usuário no Discord (ex: "Discord: juninho")</li>
                <li>• <strong>Sacolas:</strong> Nome da conta que recebeu o sinal (ex: "Sacolas: MKTCACETE")</li>
                <li>• <strong>Status:</strong> Confirmações ou pendências (ex: "A CONFIRMAR", "Confirmado")</li>
                <li>• <strong>Extras:</strong> Qualquer informação relevante sobre o cliente</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-center">
              <p className="text-sm text-purple-600 font-semibold mb-1">Total de Carrys</p>
              <p className="text-4xl font-bold text-purple-700">{pedidos.length}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-center">
              <p className="text-sm text-green-600 font-semibold mb-1">Com Observações</p>
              <p className="text-4xl font-bold text-green-700">
                {pedidos.filter(p => p.observacoes && p.observacoes.trim() !== '').length}
              </p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="text-center">
              <p className="text-sm text-orange-600 font-semibold mb-1">Sem Observações</p>
              <p className="text-4xl font-bold text-orange-700">
                {pedidos.filter(p => !p.observacoes || p.observacoes.trim() === '').length}
              </p>
            </div>
          </Card>
        </div>

        {/* Lista de Pedidos Agrupados por Data */}
        <div className="space-y-6">
          {datasOrdenadas.map(data => {
            const carrys = pedidosAgrupados[data]
            const dataFormatada = formatarData(data)

            return (
              <Card key={data} className="border-2 border-gray-200">
                {/* Header da Data */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-900">{dataFormatada}</h3>
                    <Badge variant="primary">{carrys.length} carry{carrys.length > 1 ? 's' : ''}</Badge>
                  </div>
                </div>

                {/* Lista de Carrys */}
                <div className="space-y-3">
                  {carrys.map((pedido, index) => {
                    const estaEditando = editandoId === pedido.id
                    const estaSalvando = salvandoId === pedido.id
                    const observacoesAtual = estaEditando 
                      ? observacoesTemp[pedido.id] || ''
                      : pedido.observacoes || ''

                    return (
                      <div 
                        key={pedido.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-all"
                      >
                        <div className="space-y-3">
                          {/* Header do Carry */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xl font-bold text-purple-600">#{index + 1}</span>
                                <h4 className="text-lg font-bold text-gray-900">{pedido.nomeCliente}</h4>
                                {getStatusPagamentoBadge(pedido.statusPagamento)}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {formatarHorario(pedido.horario)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  {pedido.contatoCliente}
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  {pedido.valorFinal >= 1000000000 
                                    ? `${(pedido.valorFinal / 1000000000).toFixed(2)}b` 
                                    : `${(pedido.valorFinal / 1000000).toFixed(0)}kk`}
                                </div>
                              </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex gap-2">
                              {!estaEditando ? (
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={() => iniciarEdicao(pedido)}
                                >
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Editar
                                </Button>
                              ) : (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="success"
                                    onClick={() => salvarObservacoes(pedido)}
                                    disabled={estaSalvando}
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    {estaSalvando ? 'Salvando...' : 'Salvar'}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="danger"
                                    onClick={() => cancelarEdicao(pedido.id)}
                                    disabled={estaSalvando}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Campo de Observações */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              📝 Observações
                            </label>
                            {estaEditando ? (
                              <textarea
                                value={observacoesAtual}
                                onChange={(e) => setObservacoesTemp({
                                  ...observacoesTemp,
                                  [pedido.id]: e.target.value
                                })}
                                className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                                rows={3}
                                placeholder="Ex: Discord: juninho - Sacolas: MKTCACETE - sinal OK"
                                disabled={estaSalvando}
                              />
                            ) : (
                              <div className={`px-4 py-3 rounded-lg ${
                                observacoesAtual 
                                  ? 'bg-blue-50 border-2 border-blue-200 text-blue-900' 
                                  : 'bg-gray-100 border-2 border-gray-200 text-gray-500 italic'
                              }`}>
                                {observacoesAtual || 'Nenhuma observação cadastrada'}
                              </div>
                            )}
                          </div>

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
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {datasOrdenadas.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Nenhum carry agendado
              </h3>
              <p className="text-gray-500">
                Os carrys agendados aparecerão aqui
              </p>
            </div>
          </Card>
        )}
      </div>
    </ToolsLayout>
  )
}
