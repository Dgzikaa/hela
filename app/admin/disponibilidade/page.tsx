'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import { useAvailability } from '@/app/contexts/AvailabilityContext'
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  Save
} from 'lucide-react'

const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function DisponibilidadePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const {
    weeklySchedule,
    specialDates,
    updateTimeSlot,
    addSpecialDate,
    removeSpecialDate,
    loading
  } = useAvailability()

  const [novaDataEspecial, setNovaDataEspecial] = useState('')
  const [notaDataEspecial, setNotaDataEspecial] = useState('')
  const [disponivelDataEspecial, setDisponivelDataEspecial] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  const handleAddSpecialDate = () => {
    if (!novaDataEspecial) return

    addSpecialDate({
      id: `special-${Date.now()}`,
      date: novaDataEspecial,
      available: disponivelDataEspecial,
      note: notaDataEspecial || undefined
    })

    setNovaDataEspecial('')
    setNotaDataEspecial('')
    setDisponivelDataEspecial(false)
    
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Minha Disponibilidade
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure seus horários disponíveis para carrys
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem de Sucesso */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-300 font-medium">
              Disponibilidade atualizada com sucesso!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Horário Semanal */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Horário Semanal Padrão
                </h2>
              </div>

              <div className="space-y-4">
                {weeklySchedule.map((slot, index) => (
                  <div
                    key={slot.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {diasSemana[slot.dayOfWeek]}
                      </h3>
                      <button
                        onClick={() => updateTimeSlot(slot.id, { available: !slot.available })}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${slot.available ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${slot.available ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>

                    {slot.available && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Início
                          </label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(slot.id, { startTime: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Fim
                          </label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(slot.id, { endTime: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    {!slot.available && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Indisponível neste dia
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Datas Especiais */}
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Datas Especiais
                </h2>
              </div>

              {/* Adicionar Nova Data */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                  Adicionar Exceção
                </h3>
                
                <div className="space-y-3">
                  <input
                    type="date"
                    value={novaDataEspecial}
                    onChange={(e) => setNovaDataEspecial(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  
                  <input
                    type="text"
                    placeholder="Motivo (opcional)"
                    value={notaDataEspecial}
                    onChange={(e) => setNotaDataEspecial(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="disponivel"
                      checked={disponivelDataEspecial}
                      onChange={(e) => setDisponivelDataEspecial(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="disponivel" className="text-sm text-gray-700 dark:text-gray-300">
                      Disponível nesta data
                    </label>
                  </div>

                  <button
                    onClick={handleAddSpecialDate}
                    disabled={!novaDataEspecial}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de Datas Especiais */}
              <div className="space-y-2">
                {specialDates
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((date) => (
                    <div
                      key={date.id}
                      className={`
                        p-3 rounded-lg border-2 flex items-start justify-between
                        ${date.available
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }
                      `}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {new Date(date.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        {date.note && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {date.note}
                          </p>
                        )}
                        <Badge
                          variant={date.available ? 'success' : 'danger'}
                          className="mt-2 text-xs"
                        >
                          {date.available ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Disponível
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3 mr-1" />
                              Indisponível
                            </>
                          )}
                        </Badge>
                      </div>
                      <button
                        onClick={() => removeSpecialDate(date.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  ))}

                {specialDates.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nenhuma data especial cadastrada
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Info Box */}
        <Card className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                💡 Como funciona?
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• <strong>Horário Semanal:</strong> Define sua disponibilidade padrão para cada dia da semana</li>
                <li>• <strong>Datas Especiais:</strong> Sobrescreve o horário padrão para datas específicas (férias, feriados, etc)</li>
                <li>• <strong>Sincronização:</strong> Suas configurações são salvas automaticamente</li>
                <li>• <strong>Visibilidade:</strong> O time pode ver sua disponibilidade ao agendar carrys</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

