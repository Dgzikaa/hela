'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Densidade = 'compacto' | 'confortavel' | 'espaçoso'
export type Theme = 'light' | 'dark' | 'auto'

interface Preferences {
  theme: Theme
  densidade: Densidade
  notificacoesAtivas: boolean
  somAtivo: boolean
  idioma: string
  moedaPadrao: string
  formatoData: string
  fusoHorario: string
}

interface PreferencesContextType {
  preferences: Preferences
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  resetPreferences: () => void
  loading: boolean
}

const defaultPreferences: Preferences = {
  theme: 'auto',
  densidade: 'confortavel',
  notificacoesAtivas: true,
  somAtivo: true,
  idioma: 'pt-BR',
  moedaPadrao: 'BRL',
  formatoData: 'dd/MM/yyyy',
  fusoHorario: 'America/Sao_Paulo'
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
  const [loading, setLoading] = useState(true)

  // Carregar preferências do localStorage ao montar
  useEffect(() => {
    const stored = localStorage.getItem('user_preferences')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPreferences({ ...defaultPreferences, ...parsed })
      } catch (error) {
        console.error('Erro ao carregar preferências:', error)
      }
    }

    // Aplicar tema
    applyTheme(preferences.theme)
    
    setLoading(false)
  }, [])

  // Salvar preferências sempre que mudarem
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('user_preferences', JSON.stringify(preferences))
      
      // Aplicar tema quando mudar
      if (preferences.theme) {
        applyTheme(preferences.theme)
      }
      
      // Aplicar densidade
      document.documentElement.setAttribute('data-density', preferences.densidade)
    }
  }, [preferences, loading])

  const applyTheme = (theme: Theme) => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }

  const updatePreference = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
    localStorage.removeItem('user_preferences')
  }

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences,
        loading
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}

