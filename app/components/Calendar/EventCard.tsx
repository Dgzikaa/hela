'use client'

import { Clock, Users, DollarSign } from 'lucide-react'
import { CalendarEvent } from './CalendarView'

interface EventCardProps {
  event: CalendarEvent
  onClick?: () => void
  onDragStart?: () => void
  compact?: boolean
}

const getEventColor = (type: string) => {
  switch (type) {
    case 'HELA':
      return 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300'
    case 'CARRY_PAGO':
      return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
    case 'CARRY_GRATIS':
      return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-900/30 dark:border-gray-700 dark:text-gray-300'
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDENTE':
      return '🕐'
    case 'APROVADO':
      return '✓'
    case 'AGENDADO':
      return '📅'
    case 'EM_ANDAMENTO':
      return '▶️'
    case 'CONCLUIDO':
      return '✅'
    case 'CANCELADO':
      return '❌'
    default:
      return ''
  }
}

export function EventCard({ event, onClick, onDragStart, compact = false }: EventCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={`
        ${getEventColor(event.type)}
        border rounded px-2 py-1 cursor-move hover:shadow-md transition-all
        ${compact ? 'text-xs' : 'text-sm'}
      `}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="text-[10px]">{getStatusBadge(event.status)}</span>
          <span className="font-semibold truncate">{event.title}</span>
        </div>
        {event.startTime && (
          <div className="flex items-center gap-1 text-[10px] opacity-75">
            <Clock className="w-3 h-3" />
            <span>{event.startTime}</span>
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-1 space-y-1">
          {event.client && (
            <div className="text-xs opacity-75 truncate">
              Cliente: {event.client}
            </div>
          )}
          
          {event.players && event.players.length > 0 && (
            <div className="flex items-center gap-1 text-xs opacity-75">
              <Users className="w-3 h-3" />
              <span>{event.players.length} jogadores</span>
            </div>
          )}
          
          {event.value && (
            <div className="flex items-center gap-1 text-xs font-semibold">
              <DollarSign className="w-3 h-3" />
              <span>{event.value}kk</span>
            </div>
          )}
          
          {event.bosses && event.bosses.length > 0 && (
            <div className="text-xs opacity-75">
              Bosses: {event.bosses.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

