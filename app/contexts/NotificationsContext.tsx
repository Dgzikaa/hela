'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  icon?: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

const NOTIFICATIONS_KEY = 'hela_notifications'
const MAX_NOTIFICATIONS = 50

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Carregar notificações do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Converter timestamps de volta para Date
        const withDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
        setNotifications(withDates)
      } catch (error) {
        console.error('Erro ao carregar notificações:', error)
      }
    }
  }, [])

  // Salvar notificações no localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
    }
  }, [notifications])

  // Polling para novas notificações do servidor
  useEffect(() => {
    if (!session) return

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const serverNotifications = await res.json()
          // Mesclar com notificações locais
          serverNotifications.forEach((notif: any) => {
            if (!notifications.find(n => n.id === notif.id)) {
              addNotification({
                type: notif.type,
                title: notif.title,
                message: notif.message,
                actionUrl: notif.actionUrl,
                icon: notif.icon
              })
            }
          })
        }
      } catch (error) {
        console.error('Erro ao buscar notificações:', error)
      }
    }

    // Buscar a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000)
    fetchNotifications() // Buscar imediatamente

    return () => clearInterval(interval)
  }, [session])

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS)
      return updated
    })

    // Mostrar notificação do navegador se permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      })
    }
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    localStorage.removeItem(NOTIFICATIONS_KEY)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}

