'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ToolsLayout } from '../components/ToolsLayout'
import { DashboardMetrics } from '../components/Dashboard/DashboardMetrics'
import { CarrysChart } from '../components/Dashboard/CarrysChart'
import { AtividadesRecentes } from '../components/Dashboard/AtividadesRecentes'
import { TopJogadores } from '../components/Dashboard/TopJogadores'
import { MetasProgress } from '../components/Dashboard/MetasProgress'
import { AcoesRapidas } from '../components/Dashboard/AcoesRapidas'

interface DashboardData {
  metricas: {
    totalCarrys: number
    receitaTotal: number
    totalClientes: number
    taxaConclusao: number
    variacaoCarrys: number
    variacaoReceita: number
  }
  dadosGrafico: Array<{
    mes: string
    carrys: number
    receita: number
  }>
  atividades: Array<{
    id: number
    tipo: 'concluido' | 'carry' | 'pagamento' | 'jogador'
    titulo: string
    descricao: string
    tempo: string
    valor?: number
  }>
  topJogadores: Array<{
    id: number
    nome: string
    carrys: number
    ganhos: number
    posicao: number
  }>
  metas: Array<{
    id: number
    titulo: string
    atual: number
    objetivo: number
    unidade: string
    cor: 'purple' | 'green' | 'blue' | 'orange'
  }>
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        console.error('Erro ao buscar dados do dashboard')
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <ToolsLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </ToolsLayout>
    )
  }

  if (!session || !dashboardData) {
    return null
  }

  const { metricas, dadosGrafico, atividades, topJogadores, metas } = dashboardData

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              👋 Bem-vindo de volta, {session.user?.name || 'Usuário'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Confira o resumo de hoje
            </p>
          </div>

          <DashboardMetrics
            totalCarrys={metricas.totalCarrys}
            totalReceita={metricas.receitaTotal * 1000}
            jogadoresAtivos={topJogadores.length}
            proximosCarrys={metricas.totalClientes}
            changes={{
              carrys: metricas.variacaoCarrys,
              receita: metricas.variacaoReceita,
              jogadores: 0
            }}
          />

          <AcoesRapidas />

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CarrysChart data={dadosGrafico} />
              <AtividadesRecentes atividades={atividades} />
            </div>

            <div className="space-y-6">
              <TopJogadores jogadores={topJogadores} periodo="mes" />
              <MetasProgress metas={metas} />
            </div>
          </div>
        </div>
      </div>
    </ToolsLayout>
  )
}

