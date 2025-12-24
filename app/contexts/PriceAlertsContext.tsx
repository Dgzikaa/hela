'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNotifications } from './NotificationsContext'

interface PriceAlert {
  id: string
  itemName: string
  targetPrice: number
  condition: 'above' | 'below'
  active: boolean
  createdAt: Date
}

interface Favorite {
  itemName: string
  addedAt: Date
}

interface PriceAlertsContextType {
  alerts: PriceAlert[]
  favorites: string[]
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void
  removeAlert: (id: string) => void
  toggleAlert: (id: string) => void
  addFavorite: (itemName: string) => void
  removeFavorite: (itemName: string) => void
  checkPriceAlerts: (itemName: string, currentPrice: number) => void
}

const PriceAlertsContext = createContext<PriceAlertsContextType | undefined>(undefined)

const ALERTS_KEY = 'hela_price_alerts'
const FAVORITES_KEY = 'hela_price_favorites'

export function PriceAlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const { addNotification } = useNotifications()

  useEffect(() => {
    const storedAlerts = localStorage.getItem(ALERTS_KEY)
    const storedFavorites = localStorage.getItem(FAVORITES_KEY)
    
    if (storedAlerts) {
      try {
        const parsed = JSON.parse(storedAlerts)
        setAlerts(parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt)
        })))
      } catch (error) {
        console.error('Erro ao carregar alertas:', error)
      }
    }
    
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
    }
  }, [alerts])

  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    }
  }, [favorites])

  const addAlert = (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    }
    setAlerts(prev => [...prev, newAlert])
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    ))
  }

  const addFavorite = (itemName: string) => {
    if (!favorites.includes(itemName)) {
      setFavorites(prev => [...prev, itemName])
    }
  }

  const removeFavorite = (itemName: string) => {
    setFavorites(prev => prev.filter(f => f !== itemName))
  }

  const checkPriceAlerts = (itemName: string, currentPrice: number) => {
    const relevantAlerts = alerts.filter(a => 
      a.active && a.itemName === itemName
    )

    relevantAlerts.forEach(alert => {
      let shouldAlert = false

      if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
        shouldAlert = true
      } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
        shouldAlert = true
      }

      if (shouldAlert) {
        addNotification({
          type: 'success',
          title: '🎯 Alerta de Preço!',
          message: `${itemName} está ${alert.condition === 'above' ? 'acima' : 'abaixo'} de ${alert.targetPrice}kk! Preço atual: ${currentPrice}kk`,
          actionUrl: '/ferramentas/precos'
        })
        
        // Desativar alerta após disparo (opcional)
        toggleAlert(alert.id)
      }
    })
  }

  return (
    <PriceAlertsContext.Provider
      value={{
        alerts,
        favorites,
        addAlert,
        removeAlert,
        toggleAlert,
        addFavorite,
        removeFavorite,
        checkPriceAlerts
      }}
    >
      {children}
    </PriceAlertsContext.Provider>
  )
}

export function usePriceAlerts() {
  const context = useContext(PriceAlertsContext)
  if (context === undefined) {
    throw new Error('usePriceAlerts must be used within a PriceAlertsProvider')
  }
  return context
}

