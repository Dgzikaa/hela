'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Target,
  Users,
  DollarSign,
  AlertCircle,
  Lightbulb,
  Activity
} from 'lucide-react'

interface AnaliseDemanda {
  demandaPorBoss: Record<string, {
    total: number
    tendencia: 'crescente' | 'estavel' | 'decrescente'
    mediaUltimos7Dias: number
    mediaUltimos30Dias: number
  }>
  horariosPico: number[]
  diaComMaisDemanda: {
    dia: string
    quantidade: number
  }
  previsaoProximos7Dias: number
  totalPedidosUltimos90Dias: number
  mediaDiaria: string
}

export default function ResumoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analise, setAnalise] = useState<AnaliseDemanda | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      carregarAnalise()
    }
  }, [status, router])

  const carregarAnalise = async () => {
    try {
      const res = await fetch('/api/analytics/demanda')
      if (res.ok) {
        const data = await res.json()
        setAnalise(data)
      }
    } catch (error) {
      console.error('Erro ao carregar análise:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'decrescente':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'decrescente':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Analisando demanda...</p>
        </div>
      </div>
    )
  }

  if (!analise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Erro ao carregar análise</p>
        </div>
      </div>
    )
  }

  const topBosses = Object.entries(analise.demandaPorBoss)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Análise Preditiva de Demanda
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Insights inteligentes sobre tendências de carrys
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Previsão 7 Dias
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analise.previsaoProximos7Dias}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              carrys estimados
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Média Diária
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analise.mediaDiaria}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              carrys/dia (90d)
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Melhor Dia
              </h3>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              {analise.diaComMaisDemanda.dia}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {analise.diaComMaisDemanda.quantidade} carrys
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Horários de Pico
              </h3>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {analise.horariosPico.map(h => `${h}h`).join(', ')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              maior demanda
            </p>
          </Card>
        </div>

        {/* Insights Inteligentes */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                💡 Insights Inteligentes
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>
                  • <strong>Melhor momento:</strong> A demanda é maior às{' '}
                  {analise.horariosPico[0]}h, considere ter mais jogadores disponíveis neste horário.
                </li>
                <li>
                  • <strong>Planejamento semanal:</strong> {analise.diaComMaisDemanda.dia} é o dia com maior demanda.
                  Organize o time para estar disponível.
                </li>
                <li>
                  • <strong>Tendência geral:</strong> Esperamos cerca de{' '}
                  {analise.previsaoProximos7Dias} carrys nos próximos 7 dias.
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Demanda por Boss */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            📊 Demanda por Boss (Top 10)
          </h2>
          
          <div className="space-y-4">
            {topBosses.map(([bossNome, dados], index) => (
              <div
                key={bossNome}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm
                  ${index < 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-500'}
                `}>
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {bossNome}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{dados.total} carrys (90d)</span>
                    <span>•</span>
                    <span>{dados.mediaUltimos7Dias.toFixed(1)}/dia (7d)</span>
                    <span>•</span>
                    <span>{dados.mediaUltimos30Dias.toFixed(1)}/dia (30d)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getTendenciaIcon(dados.tendencia)}
                  <Badge className={getTendenciaColor(dados.tendencia)}>
                    {dados.tendencia}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
