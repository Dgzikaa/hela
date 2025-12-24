'use client'

import { useState, useEffect } from 'react'
import { Settings, Bell, Moon, Sun, Globe, Volume2, Smartphone } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Button } from '@/app/components/Button'

export default function ConfiguracoesPage() {
  const [notificacoesEmail, setNotificacoesEmail] = useState(true)
  const [notificacoesDiscord, setNotificacoesDiscord] = useState(true)
  const [somNotificacoes, setSomNotificacoes] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [idioma, setIdioma] = useState('pt-BR')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme === 'dark')
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleSalvar = () => {
    // TODO: Salvar configurações no backend
    console.log('Salvando configurações:', {
      notificacoesEmail,
      notificacoesDiscord,
      somNotificacoes,
      isDarkMode,
      idioma
    })
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Configurações</h1>
          <p className="text-gray-600">Personalize sua experiência no sistema</p>
        </div>

        {/* Aparência */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Aparência
          </h2>
          
          <div className="space-y-4">
            {/* Modo Escuro */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-purple-600" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">Modo Escuro</p>
                  <p className="text-sm text-gray-600">
                    {isDarkMode ? 'Ativado - tema escuro' : 'Desativado - tema claro'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Idioma */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Idioma</p>
                  <p className="text-sm text-gray-600">Selecione seu idioma preferido</p>
                </div>
              </div>
              <select
                value={idioma}
                onChange={(e) => setIdioma(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="pt-BR">Português (BR)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Notificações */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </h2>
          
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Notificações por Email</p>
                <p className="text-sm text-gray-600">Receba avisos de carrys por email</p>
              </div>
              <button
                onClick={() => setNotificacoesEmail(!notificacoesEmail)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  notificacoesEmail ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    notificacoesEmail ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Discord */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Notificações Discord</p>
                <p className="text-sm text-gray-600">Receba avisos via Discord DM</p>
              </div>
              <button
                onClick={() => setNotificacoesDiscord(!notificacoesDiscord)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  notificacoesDiscord ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    notificacoesDiscord ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Som */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-gray-900">Som de Notificações</p>
                  <p className="text-sm text-gray-600">Ativar alertas sonoros</p>
                </div>
              </div>
              <button
                onClick={() => setSomNotificacoes(!somNotificacoes)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  somNotificacoes ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    somNotificacoes ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Preferências de Carry */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Preferências de Carry
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Horários Preferidos
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Manhã (6h-12h)', 'Tarde (12h-18h)', 'Noite (18h-24h)', 'Madrugada (0h-6h)'].map(horario => (
                  <label key={horario} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input type="checkbox" className="w-4 h-4" defaultChecked={horario === 'Noite (18h-24h)'} />
                    <span className="text-sm text-gray-700">{horario}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dias Disponíveis
              </label>
              <div className="grid grid-cols-7 gap-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                  <label key={dia} className="flex items-center justify-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input type="checkbox" className="sr-only" defaultChecked={!['Dom', 'Seg'].includes(dia)} />
                    <span className="text-sm font-semibold text-gray-700">{dia}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Botão Salvar */}
        <div className="flex gap-3">
          <Button onClick={handleSalvar}>
            Salvar Configurações
          </Button>
          <Button variant="secondary">
            Restaurar Padrões
          </Button>
        </div>
      </div>
    </div>
  )
}

