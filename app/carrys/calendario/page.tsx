'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CalendarView, CalendarEvent } from '@/app/components/Calendar/CalendarView'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import { useToast } from '@/app/hooks/useToast'
import { Clock, Users, DollarSign, X } from 'lucide-react'

interface Pedido {
  id: number
  nomeCliente: string
  valorTotal: number
  status: string
  dataAgendada: string | null
  horario?: string | null
  pacoteCompleto: boolean
  participacoes?: {
    jogador: {
      nick: string
    }
  }[]
  itens: {
    boss: {
      nome: string
    }
  }[]
}

export default function CalendarioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const { success, error } = useToast()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      carregarPedidos()
    }
  }, [status, router])

  const carregarPedidos = async () => {
    try {
      const res = await fetch('/api/pedidos')
      if (res.ok) {
        const data = await res.json()
        setPedidos(data.filter((p: Pedido) => p.status !== 'CANCELADO'))
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      error('Erro ao carregar carrys')
    } finally {
      setLoading(false)
    }
  }

  // Converter pedidos para eventos do calendário
  const events: CalendarEvent[] = pedidos
    .filter(p => p.dataAgendada)
    .map(p => {
      // FIX: Forçar data local (não UTC) para evitar deslocamento de timezone
      const dataStr = p.dataAgendada!.split('T')[0] // "2025-12-24"
      const [ano, mes, dia] = dataStr.split('-').map(Number)
      const dataAgendada = new Date(ano, mes - 1, dia, 12, 0, 0) // Meio-dia para evitar DST
      
      // Usar horário real do pedido, se disponível
      let startTime = '12:00'
      if (p.horario && typeof p.horario === 'string') {
        // Extrair apenas HH:MM do horário (pode vir como "HH:MM:SS")
        startTime = p.horario.substring(0, 5)
      }
      
      // Determinar tipo de carry
      let type: 'HELA' | 'CARRY_PAGO' | 'CARRY_GRATIS' = 'CARRY_PAGO'
      if (p.pacoteCompleto) {
        type = 'HELA'
      }
      
      // Bosses
      const bosses = p.itens.map(i => i.boss.nome)
      
      // Jogadores
      const players = p.participacoes?.map(part => part.jogador.nick) || []
      
      return {
        id: p.id,
        title: p.nomeCliente,
        date: dataAgendada,
        startTime,
        type,
        status: p.status as any,
        client: p.nomeCliente,
        players,
        value: p.valorTotal,
        bosses
      }
    })

  const handleEventClick = (event: CalendarEvent) => {
    const pedido = pedidos.find(p => p.id === event.id)
    if (pedido) {
      setPedidoSelecionado(pedido)
    }
  }

  const handleEventDrop = async (eventId: number, newDate: Date) => {
    try {
      const res = await fetch(`/api/pedidos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: eventId,
          dataAgendada: newDate.toISOString()
        })
      })

      if (res.ok) {
        success('Carry reagendado com sucesso!')
        await carregarPedidos()
      } else {
        error('Erro ao reagendar carry')
      }
    } catch (err) {
      console.error('Erro ao reagendar:', err)
      error('Erro ao reagendar carry')
    }
  }

  const handleDateClick = (date: Date) => {
    // Futuramente: abrir modal para criar novo carry nesta data
    console.log('Data clicada:', date)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando calendário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📅 Calendário de Carrys
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize, gerencie e reagende todos os carrys
          </p>
        </div>

        {/* Calendário */}
        <CalendarView
          events={events}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          onEventDrop={handleEventDrop}
        />

        {/* Modal de Detalhes */}
        {pedidoSelecionado && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setPedidoSelecionado(null)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header com gradiente */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Detalhes do Carry
                    </h2>
                    <p className="text-purple-100 text-sm">Pedido #{pedidoSelecionado.id}</p>
                  </div>
                  <button
                    onClick={() => setPedidoSelecionado(null)}
                    className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-6">
                {/* Cliente e Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Cliente
                      </h3>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {pedidoSelecionado.nomeCliente}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Status
                      </h3>
                    </div>
                    <Badge variant={
                      pedidoSelecionado.status === 'PENDENTE' ? 'warning' :
                      pedidoSelecionado.status === 'APROVADO' ? 'info' :
                      pedidoSelecionado.status === 'AGENDADO' ? 'info' :
                      pedidoSelecionado.status === 'CONCLUIDO' ? 'success' : 'default'
                    }>
                      {pedidoSelecionado.status}
                    </Badge>
                  </div>
                </div>

                {/* Data e Hora */}
                {pedidoSelecionado.dataAgendada && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Data e Hora do Carry
                      </h3>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(pedidoSelecionado.dataAgendada).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}

                {/* Bosses */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                    Bosses ({pedidoSelecionado.itens.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {pedidoSelecionado.itens.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg font-medium text-gray-900 dark:text-white text-center"
                      >
                        {item.boss.nome}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Jogadores */}
                {pedidoSelecionado.participacoes && pedidoSelecionado.participacoes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                      Time ({pedidoSelecionado.participacoes.length} jogadores)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {pedidoSelecionado.participacoes.map((part, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {part.jogador.nick}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valor */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Valor Total
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {pedidoSelecionado.valorTotal}kk
                  </p>
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      router.push(`/carrys/agendamento`)
                      setPedidoSelecionado(null)
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    Ver Todos os Pedidos
                  </button>
                  <button
                    onClick={() => setPedidoSelecionado(null)}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

