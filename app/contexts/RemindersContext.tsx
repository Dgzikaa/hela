'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNotifications } from './NotificationsContext'

interface Reminder {
  id: string
  title: string
  message: string
  triggerAt: Date
  triggered: boolean
  entityType?: 'pedido' | 'meta' | 'custom'
  entityId?: number
  recurring?: 'daily' | 'weekly' | 'monthly'
}

interface RemindersContextType {
  reminders: Reminder[]
  addReminder: (reminder: Omit<Reminder, 'id' | 'triggered'>) => void
  removeReminder: (id: string) => void
  checkReminders: () => void
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined)

const REMINDERS_KEY = 'hela_reminders'

export function RemindersProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const { addNotification } = useNotifications()

  useEffect(() => {
    const stored = localStorage.getItem(REMINDERS_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setReminders(parsed.map((r: any) => ({
          ...r,
          triggerAt: new Date(r.triggerAt)
        })))
      } catch (error) {
        console.error('Erro ao carregar lembretes:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (reminders.length > 0) {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders))
    }
  }, [reminders])

  // Verificar lembretes a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders()
    }, 60000) // 1 minuto

    // Verificar imediatamente ao montar
    checkReminders()

    return () => clearInterval(interval)
  }, [reminders])

  const addReminder = (reminder: Omit<Reminder, 'id' | 'triggered'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      triggered: false
    }
    setReminders(prev => [...prev, newReminder])
  }

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const checkReminders = () => {
    const now = new Date()
    
    setReminders(prev => {
      const updated = prev.map(reminder => {
        if (!reminder.triggered && reminder.triggerAt <= now) {
          // Disparar notificação
          addNotification({
            type: 'info',
            title: `🔔 ${reminder.title}`,
            message: reminder.message,
            actionUrl: reminder.entityType && reminder.entityId 
              ? `/${reminder.entityType}s/${reminder.entityId}`
              : undefined
          })

          // Se for recorrente, reagendar
          if (reminder.recurring) {
            const nextTrigger = new Date(reminder.triggerAt)
            switch (reminder.recurring) {
              case 'daily':
                nextTrigger.setDate(nextTrigger.getDate() + 1)
                break
              case 'weekly':
                nextTrigger.setDate(nextTrigger.getDate() + 7)
                break
              case 'monthly':
                nextTrigger.setMonth(nextTrigger.getMonth() + 1)
                break
            }
            return { ...reminder, triggerAt: nextTrigger, triggered: false }
          }

          return { ...reminder, triggered: true }
        }
        return reminder
      })

      // Remover lembretes disparados que não são recorrentes e têm mais de 1 dia
      return updated.filter(r => 
        !r.triggered || 
        r.recurring ||
        (now.getTime() - r.triggerAt.getTime()) < 24 * 60 * 60 * 1000
      )
    })
  }

  return (
    <RemindersContext.Provider
      value={{
        reminders,
        addReminder,
        removeReminder,
        checkReminders
      }}
    >
      {children}
    </RemindersContext.Provider>
  )
}

export function useReminders() {
  const context = useContext(RemindersContext)
  if (context === undefined) {
    throw new Error('useReminders must be used within a RemindersProvider')
  }
  return context
}

// Função helper para criar lembretes de carrys
export function createCarryReminders(
  pedidoId: number,
  clientName: string,
  dataAgendada: Date,
  addReminder: (reminder: Omit<Reminder, 'id' | 'triggered'>) => void
) {
  const oneHourBefore = new Date(dataAgendada.getTime() - 60 * 60 * 1000)
  const oneDayBefore = new Date(dataAgendada.getTime() - 24 * 60 * 60 * 1000)

  // Lembrete 1 dia antes
  if (oneDayBefore > new Date()) {
    addReminder({
      title: 'Carry Amanhã',
      message: `Carry com ${clientName} agendado para amanhã às ${dataAgendada.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      triggerAt: oneDayBefore,
      entityType: 'pedido',
      entityId: pedidoId
    })
  }

  // Lembrete 1 hora antes
  if (oneHourBefore > new Date()) {
    addReminder({
      title: 'Carry em 1 hora!',
      message: `Carry com ${clientName} começa em 1 hora!`,
      triggerAt: oneHourBefore,
      entityType: 'pedido',
      entityId: pedidoId
    })
  }
}

