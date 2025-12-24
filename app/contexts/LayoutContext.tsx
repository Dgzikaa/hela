'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Widget {
  id: string
  type: string
  title: string
  x: number
  y: number
  w: number
  h: number
  visible: boolean
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'metrics', type: 'metrics', title: 'Métricas Gerais', x: 0, y: 0, w: 12, h: 2, visible: true },
  { id: 'chart', type: 'chart', title: 'Gráfico de Carrys', x: 0, y: 2, w: 8, h: 4, visible: true },
  { id: 'activities', type: 'activities', title: 'Atividades Recentes', x: 8, y: 2, w: 4, h: 4, visible: true },
  { id: 'top-players', type: 'top-players', title: 'Top Jogadores', x: 0, y: 6, w: 6, h: 3, visible: true },
  { id: 'goals', type: 'goals', title: 'Metas', x: 6, y: 6, w: 6, h: 3, visible: true },
]

interface LayoutContextType {
  widgets: Widget[]
  updateWidget: (id: string, updates: Partial<Widget>) => void
  resetLayout: () => void
  saveLayout: () => void
  loading: boolean
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLayout()
  }, [])

  const loadLayout = () => {
    const stored = localStorage.getItem('dashboard_layout')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setWidgets(parsed)
      } catch (error) {
        console.error('Erro ao carregar layout:', error)
      }
    }
    setLoading(false)
  }

  const saveLayout = () => {
    localStorage.setItem('dashboard_layout', JSON.stringify(widgets))
  }

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(prev =>
      prev.map(w => w.id === id ? { ...w, ...updates } : w)
    )
  }

  const resetLayout = () => {
    setWidgets(DEFAULT_WIDGETS)
    localStorage.removeItem('dashboard_layout')
  }

  // Auto-save ao mudar
  useEffect(() => {
    if (!loading) {
      saveLayout()
    }
  }, [widgets, loading])

  return (
    <LayoutContext.Provider
      value={{
        widgets,
        updateWidget,
        resetLayout,
        saveLayout,
        loading
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}

