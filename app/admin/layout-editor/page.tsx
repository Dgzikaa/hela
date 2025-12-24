'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import { useLayout } from '@/app/contexts/LayoutContext'
import {
  Layout,
  Grid,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Check,
  Move,
  Settings
} from 'lucide-react'

export default function LayoutEditorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { widgets, updateWidget, resetLayout, saveLayout } = useLayout()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  const handleSave = () => {
    saveLayout()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    if (window.confirm('⚠️ Isso irá resetar o layout para o padrão. Continuar?')) {
      resetLayout()
    }
  }

  if (status === 'loading') {
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Editor de Layout
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Personalize a disposição dos widgets no dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Resetar
              </button>
              <button
                onClick={handleSave}
                disabled={saved}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-green-600 transition-colors flex items-center gap-2"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Layout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Grid className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Como funciona:</strong> Use os controles abaixo para mostrar/ocultar widgets. 
              Em produção, você pode arrastar widgets para reorganizá-los. 
              Suas alterações são salvas automaticamente.
            </div>
          </div>
        </Card>

        {/* Grid de Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <Card
              key={widget.id}
              className={`p-6 transition-all ${
                widget.visible
                  ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'opacity-60 border-2 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    widget.visible
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <Grid className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {widget.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {widget.w}x{widget.h} grid units
                    </p>
                  </div>
                </div>
                <Badge variant={widget.visible ? 'success' : 'default'}>
                  {widget.visible ? 'Visível' : 'Oculto'}
                </Badge>
              </div>

              <div className="space-y-3">
                {/* Posição */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Move className="w-4 h-4" />
                  <span>Posição: X={widget.x}, Y={widget.y}</span>
                </div>

                {/* Controles */}
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => updateWidget(widget.id, { visible: !widget.visible })}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      widget.visible
                        ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {widget.visible ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Mostrar
                      </>
                    )}
                  </button>

                  <button
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Configurações (em breve)"
                  >
                    <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Preview do Layout */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview do Dashboard
          </h2>
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[300px]">
            <div className="grid grid-cols-12 gap-2">
              {widgets
                .filter(w => w.visible)
                .sort((a, b) => a.y - b.y || a.x - b.x)
                .map((widget) => (
                  <div
                    key={widget.id}
                    className="bg-white dark:bg-gray-900 rounded-lg p-3 border-2 border-purple-200 dark:border-purple-800 flex items-center justify-center"
                    style={{
                      gridColumn: `span ${widget.w}`,
                      gridRow: `span ${Math.ceil(widget.h / 2)}`
                    }}
                  >
                    <div className="text-center">
                      <Grid className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {widget.title}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 <strong>Dica:</strong> O layout é salvo automaticamente. 
              Para uma experiência drag & drop completa em produção, utilize a biblioteca react-grid-layout.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

