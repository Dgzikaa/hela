'use client'

import { Calendar, Clock, Users, DollarSign, Edit2, Trash2, CheckCircle, Ban } from 'lucide-react'
import { Card } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'

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
  valorReserva: number
  reservaPaga: boolean
  pacoteCompleto: boolean
  observacoes?: string | null
  itens: {
    id: number
    preco: number
    boss: Boss
  }[]
}

interface Props {
  data: string // Data no formato YYYY-MM-DD
  carrys: Pedido[]
  onEdit: (pedido: Pedido) => void
  onDelete: (pedido: Pedido) => void
  onUpdateStatus: (pedidoId: number, status: string) => void
  onAgendar: (pedido: Pedido) => void
  onCancelar: (pedido: Pedido) => void
  onConcluir: (pedido: Pedido) => void
  onConcluirTodos?: (carrys: Pedido[]) => void
}

export function CarryAgrupado({ 
  data, 
  carrys, 
  onEdit, 
  onDelete, 
  onUpdateStatus,
  onAgendar,
  onCancelar,
  onConcluir,
  onConcluirTodos
}: Props) {
  // Só agrupa se tiver 2+ carrys
  const isAgrupado = carrys.length >= 2
  
  // Calcular totais quando agrupado
  const valorTotalAgrupado = isAgrupado 
    ? carrys.reduce((sum, c) => sum + c.valorFinal, 0)
    : carrys[0]?.valorFinal || 0
  
  const numJogadores = 11 // Sempre 11 jogadores (Pablo ainda está recebendo)
  const valorPorJogador = Math.floor(valorTotalAgrupado / numJogadores)

  // Data formatada
  const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  // Status geral (se todos forem AGENDADO, mostrar AGENDADO, etc)
  const statusComum = carrys.every(c => c.status === carrys[0].status) 
    ? carrys[0].status 
    : 'MISTO'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'warning'
      case 'APROVADO': return 'info'
      case 'AGENDADO': return 'primary'
      case 'EM_ANDAMENTO': return 'primary'
      case 'CONCLUIDO': return 'success'
      case 'CANCELADO': return 'danger'
      default: return 'default'
    }
  }

  const getPaymentBadge = (statusPagamento: string, valorReserva: number, valorTotal: number) => {
    if (statusPagamento === 'PAGO') {
      return <Badge variant="success">✅ Pago Completo</Badge>
    } else if (statusPagamento === 'SINAL') {
      const restante = valorTotal - valorReserva
      const formatVal = (v: number) => v >= 100000 ? `${(v / 100000).toFixed(2)}b` : `${v}kk`
      return (
        <Badge variant="warning">
          💰 Sinal {formatVal(valorReserva)} | Falta {formatVal(restante)}
        </Badge>
      )
    }
    return <Badge variant="danger">❌ Não Pago</Badge>
  }

  if (!isAgrupado) {
    // Renderizar carry único (layout normal)
    const carry = carrys[0]
    if (!carry) return null

    return (
      <Card className="hover:border-purple-500 transition-all">
        <div className="flex items-start justify-between gap-4">
          {/* Informações */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900">{carry.nomeCliente}</h3>
              <Badge variant={getStatusColor(carry.status) as any}>
                {carry.status}
              </Badge>
              {carry.statusPagamento && getPaymentBadge(carry.statusPagamento, carry.valorReserva, carry.valorFinal)}
              {carry.pacoteCompleto && (
                <Badge variant="success">Pacote Completo</Badge>
              )}
            </div>

            {/* Data e Horário */}
            {carry.dataAgendada && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {dataFormatada}
                </div>
                {carry.horario && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {(() => {
                      try {
                        const horarioStr = typeof carry.horario === 'string' 
                          ? carry.horario 
                          : String(carry.horario)
                        return horarioStr.substring(0, 5) // Pegar apenas HH:MM
                      } catch (e) {
                        return '21:00'
                      }
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Valor */}
            <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
              <DollarSign className="w-5 h-5" />
              {carry.valorFinal >= 100000 ? `${(carry.valorFinal / 100000).toFixed(2)}b` : `${carry.valorFinal}kk`}
              <span className="text-sm text-gray-600">
                • {valorPorJogador}kk/jogador
              </span>
            </div>

            {/* Bosses */}
            <div className="flex gap-2 flex-wrap">
              {carry.itens.map(item => (
                <Badge 
                  key={item.id} 
                  variant={item.preco === 0 ? 'success' : 'info'}
                >
                  {item.boss.nome} ({item.preco === 0 ? 'Grátis' : `${item.preco}kk`})
                </Badge>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="secondary" onClick={() => onEdit(carry)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(carry)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Renderizar carrys agrupados
  return (
    <Card className="border-2 border-purple-500 bg-white">
      {/* Header do Agrupamento */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                {dataFormatada}
              </h3>
              <Badge variant="warning" className="text-lg px-3 py-1">
                🔥 {carrys.length} CARRYS
              </Badge>
            </div>

            <div className="flex items-center gap-6 text-sm">
              {/* Horários */}
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                {(() => {
                  // Pegar apenas horários únicos
                  const horariosUnicos = Array.from(new Set(
                    carrys.map(c => {
                      if (!c.horario) return '21:00'
                      try {
                        const horarioStr = typeof c.horario === 'string' 
                          ? c.horario 
                          : String(c.horario)
                        return horarioStr.substring(0, 5) // Pegar apenas HH:MM
                      } catch (e) {
                        return '21:00'
                      }
                    })
                  ))
                  return horariosUnicos.join(', ')
                })()}
              </div>

              {/* Jogadores */}
              <div className="flex items-center gap-2 text-purple-600 font-semibold">
                <Users className="w-4 h-4" />
                {numJogadores} jogadores
              </div>
            </div>
          </div>

          {/* Valor Total */}
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Valor Total</div>
            <div className="text-3xl font-bold text-green-600">
              {valorTotalAgrupado >= 100000 ? `${(valorTotalAgrupado / 100000).toFixed(2)}b` : `${valorTotalAgrupado}kk`}
            </div>
            <div className="text-sm text-gray-600">
              {valorPorJogador}kk por jogador
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Carrys */}
      <div className="space-y-3">
        {carrys.map((carry, index) => (
          <div 
            key={carry.id}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border border-gray-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-purple-600">#{index + 1}</span>
                  <h4 className="text-lg font-bold text-gray-900">{carry.nomeCliente}</h4>
                  <Badge variant={getStatusColor(carry.status) as any}>
                    {carry.status}
                  </Badge>
                  {carry.statusPagamento && getPaymentBadge(carry.statusPagamento, carry.valorReserva, carry.valorFinal)}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {carry.horario && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {(() => {
                        try {
                          const horarioStr = typeof carry.horario === 'string' 
                            ? carry.horario 
                            : String(carry.horario)
                          return horarioStr.substring(0, 5) // Pegar apenas HH:MM
                        } catch (e) {
                          return '21:00'
                        }
                      })()}
                    </div>
                  )}
                  <div className="text-green-600 font-semibold">
                    {carry.valorFinal >= 100000 ? `${(carry.valorFinal / 100000).toFixed(2)}b` : `${carry.valorFinal}kk`}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {carry.itens.map(item => (
                    <Badge 
                      key={item.id} 
                      variant={item.preco === 0 ? 'success' : 'info'}
                      className="text-xs"
                    >
                      {item.boss.nome}
                    </Badge>
                  ))}
                </div>

                {/* Observações (Sacolinhas, etc) */}
                {carry.observacoes && (
                  <div className="text-xs text-gray-500 italic">
                    📝 {carry.observacoes}
                  </div>
                )}
              </div>

              {/* Ações individuais */}
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => onEdit(carry)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(carry)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ações do Grupo */}
      {statusComum !== 'MISTO' && ['AGENDADO', 'EM_ANDAMENTO'].includes(statusComum) && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
          <Button
            variant="success"
            onClick={() => {
              if (onConcluirTodos) {
                onConcluirTodos(carrys)
              } else {
                // Fallback: concluir um por um (abrindo modal)
                carrys.forEach(c => onConcluir(c))
              }
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Concluir Todos
          </Button>
        </div>
      )}
    </Card>
  )
}

