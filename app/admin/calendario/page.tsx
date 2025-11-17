'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'

interface Pedido {
  id: number
  nomeCliente: string
  valorTotal: number
  status: string
  dataAgendada: string | null
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
  const [currentDate, setCurrentDate] = useState(new Date())
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
        setPedidos(data.filter((p: Pedido) => p.dataAgendada && p.status !== 'CANCELADO'))
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getPedidosPorDia = (day: number) => {
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0]

    return pedidos.filter(p => 
      p.dataAgendada && p.dataAgendada.startsWith(targetDate)
    )
  }

  const isSexta = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return date.getDay() === 5 // 5 = sexta-feira
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1))
  }

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

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
              📅 Calendário de Carrys
            </h1>
            <p className="text-slate-600">
              Bosses 1-6 nas sextas-feiras • Hela em qualquer dia
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            ← Voltar
          </button>
        </div>

        <Card className="p-6">
          {/* Navegação do Mês */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-slate-900 capitalize">
              {monthName}
            </h2>
            
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center font-bold text-slate-600 text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de Dias */}
          <div className="grid grid-cols-7 gap-2">
            {/* Espaços vazios antes do primeiro dia */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Dias do mês */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const pedidosDia = getPedidosPorDia(day)
              const sexta = isSexta(day)
              const hoje = new Date().toDateString() === new Date(year, month, day).toDateString()

              return (
                <div
                  key={day}
                  className={`aspect-square p-2 border rounded-lg ${
                    hoje ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200'
                  } ${sexta ? 'bg-green-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${
                      hoje ? 'text-blue-600' : 'text-slate-900'
                    }`}>
                      {day}
                    </span>
                    {sexta && <span className="text-xs">🎯</span>}
                  </div>

                  {pedidosDia.length > 0 && (
                    <div className="space-y-1">
                      {pedidosDia.slice(0, 2).map(pedido => (
                        <div
                          key={pedido.id}
                          className="text-xs p-1 bg-slate-900 text-white rounded truncate"
                          title={pedido.nomeCliente}
                        >
                          {pedido.nomeCliente}
                        </div>
                      ))}
                      {pedidosDia.length > 2 && (
                        <div className="text-xs text-slate-500 text-center">
                          +{pedidosDia.length - 2} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legenda */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">Legenda:</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
                <span className="text-sm text-slate-600">Hoje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 border border-slate-200 rounded"></div>
                <span className="text-sm text-slate-600">Sexta-feira (Bosses 1-6)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-900 rounded"></div>
                <span className="text-sm text-slate-600">Carry agendado</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Lista de Próximos Carrys */}
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            📋 Próximos Carrys Agendados
          </h2>
          
          <div className="space-y-3">
            {pedidos
              .filter(p => p.dataAgendada && new Date(p.dataAgendada) >= new Date())
              .sort((a, b) => new Date(a.dataAgendada!).getTime() - new Date(b.dataAgendada!).getTime())
              .slice(0, 10)
              .map(pedido => (
                <div
                  key={pedido.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-bold text-slate-900">{pedido.nomeCliente}</p>
                    <p className="text-sm text-slate-600">
                      {pedido.itens.map(i => i.boss.nome).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(pedido.dataAgendada!).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-slate-600">{pedido.valorTotal}KK</p>
                  </div>
                </div>
              ))}

            {pedidos.filter(p => p.dataAgendada).length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Nenhum carry agendado ainda
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

