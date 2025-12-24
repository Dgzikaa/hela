'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { Card } from '@/app/components/Card'
import { DayCell } from './DayCell'
import { EventCard } from './EventCard'

export interface CalendarEvent {
  id: number
  title: string
  date: Date
  startTime?: string
  endTime?: string
  type: 'HELA' | 'CARRY_PAGO' | 'CARRY_GRATIS'
  status: 'PENDENTE' | 'APROVADO' | 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  client?: string
  players?: string[]
  value?: number
  bosses?: string[]
  color?: string
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  onEventDrop?: (eventId: number, newDate: Date) => void
  view?: 'month' | 'week' | 'day'
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const getEventColor = (type: string) => {
  switch (type) {
    case 'HELA':
      return 'bg-purple-500 border-purple-600'
    case 'CARRY_PAGO':
      return 'bg-blue-500 border-blue-600'
    case 'CARRY_GRATIS':
      return 'bg-green-500 border-green-600'
    default:
      return 'bg-gray-500 border-gray-600'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDENTE':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'APROVADO':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'AGENDADO':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    case 'EM_ANDAMENTO':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    case 'CONCLUIDO':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'CANCELADO':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }
}

export function CalendarView({ 
  events, 
  onEventClick, 
  onDateClick, 
  onEventDrop,
  view: initialView = 'month' 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>(initialView)
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null)

  // Navegação
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Gerar dias do mês
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: (Date | null)[] = []
    
    // Dias do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -(startingDayOfWeek - i - 1))
      days.push(prevDate)
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    // Dias do próximo mês para completar as semanas
    const remainingDays = 42 - days.length // 6 semanas x 7 dias
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }
    
    return days
  }, [currentDate])

  // Filtrar eventos por data
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  // Calcular estatísticas
  const stats = useMemo(() => {
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
    })
    
    const totalCarrys = monthEvents.length
    const totalValue = monthEvents.reduce((sum, event) => sum + (event.value || 0), 0)
    const completedCarrys = monthEvents.filter(e => e.status === 'CONCLUIDO').length
    const scheduledCarrys = monthEvents.filter(e => e.status === 'AGENDADO').length
    
    // Taxa de ocupação (% de dias com pelo menos 1 carry)
    const daysWithCarrys = new Set(
      monthEvents.map(e => new Date(e.date).toDateString())
    ).size
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const occupationRate = (daysWithCarrys / totalDaysInMonth) * 100
    
    return {
      totalCarrys,
      totalValue,
      completedCarrys,
      scheduledCarrys,
      occupationRate: Math.round(occupationRate)
    }
  }, [events, currentDate])

  // Drag & Drop handlers
  const handleDragStart = (event: CalendarEvent) => {
    setDraggedEvent(event)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (date: Date) => {
    if (draggedEvent && onEventDrop) {
      onEventDrop(draggedEvent.id, date)
      setDraggedEvent(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Carrys</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCarrys}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receita</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalValue >= 1000 
                  ? `${(stats.totalValue / 1000).toFixed(1)}b` 
                  : `${stats.totalValue}kk`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Agendados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduledCarrys}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Taxa Ocupação</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.occupationRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controles do Calendário */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {view === 'month' && `${MESES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {view === 'week' && `Semana de ${currentDate.toLocaleDateString('pt-BR')}`}
              {view === 'day' && currentDate.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            
            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Hoje
            </button>
            
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  view === 'month'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  view === 'week'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  view === 'day'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Dia
              </button>
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Hela</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Carry Pago</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Carry Grátis</span>
          </div>
        </div>

        {/* Visualização Mensal */}
        {view === 'month' && (
          <div>
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DIAS_SEMANA.map(dia => (
                <div
                  key={dia}
                  className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((date, index) => {
                if (!date) return null
                const dayEvents = getEventsForDate(date)
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const isToday = date.toDateString() === new Date().toDateString()

                return (
                  <DayCell
                    key={index}
                    date={date}
                    events={dayEvents}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday}
                    onClick={() => onDateClick?.(date)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(date)}
                  >
                    {dayEvents.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick?.(event)}
                        onDragStart={() => handleDragStart(event)}
                        compact
                      />
                    ))}
                  </DayCell>
                )
              })}
            </div>
          </div>
        )}

        {/* TODO: Implementar visualizações de Semana e Dia */}
        {(view === 'week' || view === 'day') && (
          <div className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              Visualização de {view === 'week' ? 'semana' : 'dia'} em desenvolvimento
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

