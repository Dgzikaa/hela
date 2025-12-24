'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  BarChart3,
  Target,
  Trophy,
  Clock
} from 'lucide-react'

interface Participacao {
  id: number
  valorRecebido: number
  pedido: {
    id: number
    nomeCliente: string
    valorTotal: number
    createdAt: string
    dataAgendada: string | null
    itens: Array<{
      boss: {
        nome: string
      }
    }>
  }
}

interface Meta {
  id: string
  nome: string
  descricao: string
  valorAlvo: number
  prazo: Date
  progresso: number
  concluida: boolean
}

export default function MeusGanhosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [participacoes, setParticipacoes] = useState<Participacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroMes, setFiltroMes] = useState<string>('todos')
  const [filtroBoss, setFiltroBoss] = useState<string>('todos')
  
  // Metas pessoais
  const [metas, setMetas] = useState<Meta[]>([
    {
      id: 'meta-1',
      nome: '🎯 100kk em 30 dias',
      descricao: 'Ganhar 100kk em um mês',
      valorAlvo: 100,
      prazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progresso: 0,
      concluida: false
    },
    {
      id: 'meta-2',
      nome: '🏆 500kk Total',
      descricao: 'Alcançar 500kk em ganhos totais',
      valorAlvo: 500,
      prazo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      progresso: 0,
      concluida: false
    },
    {
      id: 'meta-3',
      nome: '💎 1b Milestone',
      descricao: 'Chegar a 1 bilhão em ganhos',
      valorAlvo: 1000,
      prazo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      progresso: 0,
      concluida: false
    }
  ])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      carregarParticipacoes()
    }
  }, [status, router])

  const carregarParticipacoes = async () => {
    try {
      // TODO: Buscar participações do jogador logado
      // Por enquanto, buscar todas e filtrar pelo nome do usuário
      const res = await fetch('/api/jogadores')
      if (res.ok) {
        const jogadores = await res.json()
        const jogadorAtual = jogadores.find((j: any) => 
          j.discord?.toLowerCase() === session?.user?.name?.toLowerCase()
        )
        
        if (jogadorAtual) {
          // Buscar participações
          // TODO: Implementar endpoint específico
          setParticipacoes([])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar participações:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular totais
  const totalGanho = participacoes.reduce((sum, p) => sum + p.valorRecebido, 0)
  const totalCarrys = participacoes.length
  const mediaCarry = totalCarrys > 0 ? totalGanho / totalCarrys : 0

  // Ganhos por mês
  const ganhosPorMes: Record<string, number> = {}
  participacoes.forEach(p => {
    const mes = new Date(p.pedido.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    ganhosPorMes[mes] = (ganhosPorMes[mes] || 0) + p.valorRecebido
  })

  // Atualizar progresso das metas
  useEffect(() => {
    if (totalGanho > 0) {
      setMetas(prev => prev.map(meta => ({
        ...meta,
        progresso: Math.min(totalGanho, meta.valorAlvo),
        concluida: totalGanho >= meta.valorAlvo
      })))
    }
  }, [totalGanho])

  // Filtros
  const participacoesFiltradas = participacoes.filter(p => {
    const matchMes = filtroMes === 'todos' || 
      new Date(p.pedido.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) === filtroMes
    const matchBoss = filtroBoss === 'todos' || 
      p.pedido.itens.some(item => item.boss.nome.toLowerCase().includes(filtroBoss.toLowerCase()))
    return matchMes && matchBoss
  })

  const totalFiltrado = participacoesFiltradas.reduce((sum, p) => sum + p.valorRecebido, 0)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando ganhos...</p>
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Meus Ganhos
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Acompanhe seu histórico e metas financeiras
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Ganho
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalGanho}kk
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Carrys
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalCarrys}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Média/Carry
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {Math.round(mediaCarry)}kk
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Este Mês
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {ganhosPorMes[new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })] || 0}kk
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Histórico */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  📝 Histórico de Ganhos
                </h2>
                <div className="flex gap-3">
                  <select
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="todos">Todos os meses</option>
                    {Object.keys(ganhosPorMes).map(mes => (
                      <option key={mes} value={mes}>{mes}</option>
                    ))}
                  </select>
                  <select
                    value={filtroBoss}
                    onChange={(e) => setFiltroBoss(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="todos">Todos os bosses</option>
                    <option value="hela">Hela</option>
                    <option value="saturne">Saturne</option>
                  </select>
                </div>
              </div>

              {participacoesFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum ganho registrado ainda
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Total Filtrado:</strong> {totalFiltrado}kk em {participacoesFiltradas.length} carrys
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {participacoesFiltradas.map((part) => (
                      <div
                        key={part.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Carry #{part.pedido.id} - {part.pedido.nomeCliente}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {part.pedido.itens.map(i => i.boss.nome).join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              +{part.valorRecebido}kk
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(part.pedido.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Metas Pessoais */}
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Metas Pessoais
                </h2>
              </div>

              <div className="space-y-4">
                {metas.map((meta) => (
                  <div
                    key={meta.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${meta.concluida
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {meta.nome}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {meta.descricao}
                        </p>
                      </div>
                      {meta.concluida && (
                        <Badge variant="success">✓</Badge>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${meta.concluida ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${Math.min((meta.progresso / meta.valorAlvo) * 100, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {meta.progresso}kk / {meta.valorAlvo}kk
                      </span>
                      <span className="text-gray-500 dark:text-gray-500 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.ceil((meta.prazo.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} dias
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
