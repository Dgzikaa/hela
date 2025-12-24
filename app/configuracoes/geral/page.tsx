'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card } from '@/app/components/Card'
import { usePreferences } from '@/app/contexts/PreferencesContext'
import { 
  Settings, 
  Monitor, 
  Sun, 
  Moon, 
  Bell, 
  Volume2, 
  Globe, 
  Calendar,
  Clock,
  DollarSign,
  RotateCcw,
  Palette,
  Maximize2,
  Minimize2,
  Smartphone
} from 'lucide-react'

export default function ConfiguracoesGeraisPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { preferences, updatePreference, resetPreferences, loading } = usePreferences()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Configurações Gerais
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Personalize sua experiência no sistema
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Aparência */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aparência</h2>
            </div>

            {/* Tema */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tema
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => updatePreference('theme', 'light')}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${preferences.theme === 'light'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Sun className="w-6 h-6 text-gray-900 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Claro</span>
                </button>

                <button
                  onClick={() => updatePreference('theme', 'dark')}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${preferences.theme === 'dark'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Moon className="w-6 h-6 text-gray-900 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Escuro</span>
                </button>

                <button
                  onClick={() => updatePreference('theme', 'auto')}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${preferences.theme === 'auto'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Monitor className="w-6 h-6 text-gray-900 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Auto</span>
                </button>
              </div>
            </div>

            {/* Densidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Densidade de Informação
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => updatePreference('densidade', 'compacto')}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${preferences.densidade === 'compacto'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Minimize2 className="w-6 h-6 text-gray-900 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Compacto</span>
                </button>

                <button
                  onClick={() => updatePreference('densidade', 'confortavel')}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${preferences.densidade === 'confortavel'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Smartphone className="w-6 h-6 text-gray-900 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Confortável</span>
                </button>

                <button
                  onClick={() => updatePreference('densidade', 'espaçoso')}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${preferences.densidade === 'espaçoso'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Maximize2 className="w-6 h-6 text-gray-900 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Espaçoso</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Notificações e Sons */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notificações</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Notificações Ativas</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receber notificações do sistema
                  </p>
                </div>
                <button
                  onClick={() => updatePreference('notificacoesAtivas', !preferences.notificacoesAtivas)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${preferences.notificacoesAtivas ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${preferences.notificacoesAtivas ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Som</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reproduzir sons de notificação
                  </p>
                </div>
                <button
                  onClick={() => updatePreference('somAtivo', !preferences.somAtivo)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${preferences.somAtivo ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${preferences.somAtivo ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Regional */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Regional</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Idioma
                </label>
                <select
                  value={preferences.idioma}
                  onChange={(e) => updatePreference('idioma', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formato de Data
                </label>
                <select
                  value={preferences.formatoData}
                  onChange={(e) => updatePreference('formatoData', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                  <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuso Horário
                </label>
                <select
                  value={preferences.fusoHorario}
                  onChange={(e) => updatePreference('fusoHorario', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="Europe/London">Londres (GMT+0)</option>
                  <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moeda
                </label>
                <select
                  value={preferences.moedaPadrao}
                  onChange={(e) => updatePreference('moedaPadrao', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Resetar */}
          <Card className="p-6 border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                  Resetar Preferências
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Restaurar todas as configurações para os valores padrão
                </p>
              </div>
              <button
                onClick={resetPreferences}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Resetar
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
