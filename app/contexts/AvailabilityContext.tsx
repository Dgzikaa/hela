'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface TimeSlot {
  id: string
  dayOfWeek: number // 0-6 (domingo a sábado)
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  available: boolean
}

interface SpecialDate {
  id: string
  date: string // YYYY-MM-DD
  available: boolean
  note?: string
}

interface AvailabilityContextType {
  weeklySchedule: TimeSlot[]
  specialDates: SpecialDate[]
  updateTimeSlot: (id: string, updates: Partial<TimeSlot>) => void
  addSpecialDate: (date: SpecialDate) => void
  removeSpecialDate: (id: string) => void
  isAvailableAt: (date: Date) => boolean
  loading: boolean
}

const AvailabilityContext = createContext<AvailabilityContextType | undefined>(undefined)

const AVAILABILITY_KEY = 'hela_availability'

// Horário padrão: disponível das 19h às 23h todos os dias
const defaultWeeklySchedule: TimeSlot[] = [
  { id: 'dom', dayOfWeek: 0, startTime: '19:00', endTime: '23:00', available: true },
  { id: 'seg', dayOfWeek: 1, startTime: '19:00', endTime: '23:00', available: true },
  { id: 'ter', dayOfWeek: 2, startTime: '19:00', endTime: '23:00', available: true },
  { id: 'qua', dayOfWeek: 3, startTime: '19:00', endTime: '23:00', available: true },
  { id: 'qui', dayOfWeek: 4, startTime: '19:00', endTime: '23:00', available: true },
  { id: 'sex', dayOfWeek: 5, startTime: '19:00', endTime: '23:00', available: true },
  { id: 'sab', dayOfWeek: 6, startTime: '19:00', endTime: '23:00', available: true },
]

export function AvailabilityProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [weeklySchedule, setWeeklySchedule] = useState<TimeSlot[]>(defaultWeeklySchedule)
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      loadAvailability()
    } else {
      setLoading(false)
    }
  }, [session])

  const loadAvailability = () => {
    const stored = localStorage.getItem(AVAILABILITY_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setWeeklySchedule(parsed.weeklySchedule || defaultWeeklySchedule)
        setSpecialDates(parsed.specialDates || [])
      } catch (error) {
        console.error('Erro ao carregar disponibilidade:', error)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!loading && session) {
      localStorage.setItem(AVAILABILITY_KEY, JSON.stringify({
        weeklySchedule,
        specialDates
      }))
    }
  }, [weeklySchedule, specialDates, loading, session])

  const updateTimeSlot = (id: string, updates: Partial<TimeSlot>) => {
    setWeeklySchedule(prev =>
      prev.map(slot => slot.id === id ? { ...slot, ...updates } : slot)
    )
  }

  const addSpecialDate = (date: SpecialDate) => {
    setSpecialDates(prev => {
      const filtered = prev.filter(d => d.date !== date.date)
      return [...filtered, date]
    })
  }

  const removeSpecialDate = (id: string) => {
    setSpecialDates(prev => prev.filter(d => d.id !== id))
  }

  const isAvailableAt = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0]
    
    // Verificar datas especiais primeiro
    const special = specialDates.find(d => d.date === dateStr)
    if (special) {
      return special.available
    }

    // Verificar horário semanal
    const dayOfWeek = date.getDay()
    const timeStr = date.toTimeString().slice(0, 5) // HH:mm
    
    const slot = weeklySchedule.find(s => s.dayOfWeek === dayOfWeek)
    if (!slot || !slot.available) {
      return false
    }

    return timeStr >= slot.startTime && timeStr <= slot.endTime
  }

  return (
    <AvailabilityContext.Provider
      value={{
        weeklySchedule,
        specialDates,
        updateTimeSlot,
        addSpecialDate,
        removeSpecialDate,
        isAvailableAt,
        loading
      }}
    >
      {children}
    </AvailabilityContext.Provider>
  )
}

export function useAvailability() {
  const context = useContext(AvailabilityContext)
  if (context === undefined) {
    throw new Error('useAvailability must be used within an AvailabilityProvider')
  }
  return context
}

