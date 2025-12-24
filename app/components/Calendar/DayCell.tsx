'use client'

import { ReactNode } from 'react'
import { CalendarEvent } from './CalendarView'

interface DayCellProps {
  date: Date
  events: CalendarEvent[]
  isCurrentMonth: boolean
  isToday: boolean
  onClick?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: () => void
  children?: ReactNode
}

export function DayCell({
  date,
  events,
  isCurrentMonth,
  isToday,
  onClick,
  onDragOver,
  onDrop,
  children
}: DayCellProps) {
  const dayNumber = date.getDate()
  const hasEvents = events.length > 0

  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`
        min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all
        ${isCurrentMonth 
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
          : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-50'
        }
        ${isToday 
          ? 'ring-2 ring-purple-500 dark:ring-purple-400' 
          : ''
        }
        ${hasEvents 
          ? 'hover:bg-gray-50 dark:hover:bg-gray-750' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`
            text-sm font-semibold
            ${isToday 
              ? 'text-purple-600 dark:text-purple-400' 
              : isCurrentMonth
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-400 dark:text-gray-600'
            }
          `}
        >
          {dayNumber}
        </span>
        {hasEvents && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {events.length}
          </span>
        )}
      </div>

      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}

