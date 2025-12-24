'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ToolsLayout } from './components/ToolsLayout'
import { DashboardMetrics } from './components/Dashboard/DashboardMetrics'
import { CarrysChart } from './components/Dashboard/CarrysChart'
import { AtividadesRecentes } from './components/Dashboard/AtividadesRecentes'
import { TopJogadores } from './components/Dashboard/TopJogadores'
import { MetasProgress } from './components/Dashboard/MetasProgress'
import { AcoesRapidas } from './components/Dashboard/AcoesRapidas'


export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isLoggedIn = status === 'authenticated'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Dados mockados (TODO: buscar do backend)
  const dadosGrafico = [
    { mes: 'Jul', carrys: 15, receita: 1.2 },
    { mes: 'Ago', carrys: 22, receita: 1.8 },
    { mes: 'Set', carrys: 28, receita: 2.3 },
    { mes: 'Out', carrys: 32, receita: 2.7 },
    { mes: 'Nov', carrys: 38, receita: 3.2 },
    { mes: 'Dez', carrys: 42, receita: 3.6 },
  ]

  const atividades = [
    {
      id: 1,
      tipo: 'concluido' as const,
      titulo: 'Carry Hela concluído',
      descricao: 'Cliente: João Silva',
      tempo: '2h atrás',
      valor: 850
    },
    {
      id: 2,
      tipo: 'carry' as const,
      titulo: 'Novo carry agendado',
      descricao: 'Bosses 1-6 para amanhã às 20h',
      tempo: '5h atrás'
    },
    {
      id: 3,
      tipo: 'pagamento' as const,
      titulo: 'Pagamento processado',
      descricao: '12 jogadores receberam',
      tempo: '1 dia atrás',
      valor: 1020
    },
    {
      id: 4,
      tipo: 'jogador' as const,
      titulo: 'Novo membro adicionado',
      descricao: 'PlayerX entrou no time CARRYS',
      tempo: '2 dias atrás'
    },
  ]

  const topJogadores = [
    { id: 1, nome: 'Supaturk', carrys: 12, ganhos: 1020, posicao: 1 },
    { id: 2, nome: 'Isami', carrys: 12, ganhos: 1020, posicao: 2 },
    { id: 3, nome: 'PlayerX', carrys: 10, ganhos: 850, posicao: 3 },
    { id: 4, nome: 'PlayerY', carrys: 8, ganhos: 680, posicao: 4 },
    { id: 5, nome: 'PlayerZ', carrys: 7, ganhos: 595, posicao: 5 },
  ]

  const metas = [
    { id: 1, titulo: 'Carrys do Mês', atual: 42, objetivo: 50, unidade: 'carrys', cor: 'purple' as const },
    { id: 2, titulo: 'Receita Mensal', atual: 3.6, objetivo: 4.0, unidade: 'b', cor: 'green' as const },
    { id: 3, titulo: 'Novos Clientes', atual: 18, objetivo: 20, unidade: 'clientes', cor: 'blue' as const },
    { id: 4, titulo: 'Taxa de Conclusão', atual: 95, objetivo: 100, unidade: '%', cor: 'orange' as const },
  ]

  useEffect(() => {
    // TODO: Buscar dados reais do backend
    setLoading(false)
  }, [])

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

  if (!session) {
    return null
  }

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {isLoggedIn ? '👋 Bem-vindo de volta!' : '🎮 Hela Carrys'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isLoggedIn ? 'Confira o resumo de hoje' : 'Sistema de Gestão de Carrys RagnaTales'}
            </p>
          </div>

          {/* Métricas Principais */}
          <DashboardMetrics
            totalCarrys={42}
            totalReceita={3600}
            jogadoresAtivos={14}
            proximosCarrys={8}
            changes={{
              carrys: 12,
              receita: 8,
              jogadores: 0
            }}
          />

          {/* Ações Rápidas */}
          {isLoggedIn && <AcoesRapidas />}

          {/* Grid Principal */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              <CarrysChart data={dadosGrafico} />
              <AtividadesRecentes atividades={atividades} />
            </div>

            {/* Coluna Direita - 1/3 */}
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
