'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import {
  Users,
  Trophy,
  TrendingUp,
  Calendar,
  Star,
  Award,
  Target,
  DollarSign,
  BarChart3,
  Clock,
  Crown,
  Medal,
  Zap,
  Filter,
  Search
} from 'lucide-react'

interface Jogador {
  id: number
  nick: string
  categorias: string
  essencial: boolean
  totalCarrys: number
  totalGanho: number
  ativo: boolean
}

interface Conquista {
  id: string
  nome: string
  descricao: string
  icone: string
  progresso: number
  meta: number
  concluida: boolean
}

export default function MembrosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [loading, setLoading] = useState(true)
  const [jogadorSelecionado, setJogadorSelecionado] = useState<Jogador | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      carregarJogadores()
    }
  }, [status, router])

  const carregarJogadores = async () => {
    try {
      const res = await fetch('/api/jogadores')
      if (res.ok) {
        const data = await res.json()
        setJogadores(data)
      }
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sistema de Conquistas
  const calcularConquistas = (jogador: Jogador): Conquista[] => {
    return [
      {
        id: 'first-carry',
        nome: 'Primeiro Carry',
        descricao: 'Participe do seu primeiro carry',
        icone: '🎯',
        progresso: Math.min(jogador.totalCarrys, 1),
        meta: 1,
        concluida: jogador.totalCarrys >= 1
      },
      {
        id: 'carry-10',
        nome: 'Veterano',
        descricao: 'Participe de 10 carrys',
        icone: '⭐',
        progresso: Math.min(jogador.totalCarrys, 10),
        meta: 10,
        concluida: jogador.totalCarrys >= 10
      },
      {
        id: 'carry-50',
        nome: 'Expert',
        descricao: 'Participe de 50 carrys',
        icone: '💎',
        progresso: Math.min(jogador.totalCarrys, 50),
        meta: 50,
        concluida: jogador.totalCarrys >= 50
      },
      {
        id: 'carry-100',
        nome: 'Lenda',
        descricao: 'Participe de 100 carrys',
        icone: '👑',
        progresso: Math.min(jogador.totalCarrys, 100),
        meta: 100,
        concluida: jogador.totalCarrys >= 100
      },
      {
        id: 'ganho-100m',
        nome: 'Milionário',
        descricao: 'Ganhe 100kk',
        icone: '💰',
        progresso: Math.min(jogador.totalGanho, 100),
        meta: 100,
        concluida: jogador.totalGanho >= 100
      },
      {
        id: 'ganho-500m',
        nome: 'Rico',
        descricao: 'Ganhe 500kk',
        icone: '💸',
        progresso: Math.min(jogador.totalGanho, 500),
        meta: 500,
        concluida: jogador.totalGanho >= 500
      },
      {
        id: 'ganho-1b',
        nome: 'Bilionário',
        descricao: 'Ganhe 1.000kk (1b)',
        icone: '🏆',
        progresso: Math.min(jogador.totalGanho, 1000),
        meta: 1000,
        concluida: jogador.totalGanho >= 1000
      }
    ]
  }

  const jogadoresFiltrados = jogadores.filter(jogador => {
    const matchBusca = jogador.nick.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = filtroCategoria === 'todos' || 
                          jogador.categorias.includes(filtroCategoria.toUpperCase())
    return matchBusca && matchCategoria
  })

  // Ranking
  const ranking = [...jogadores]
    .sort((a, b) => b.totalGanho - a.totalGanho)
    .slice(0, 10)

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
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Sistema de Jogadores
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Estatísticas, conquistas e ranking da equipe
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas Globais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{jogadores.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ativos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {jogadores.filter(j => j.ativo).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Carrys</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {jogadores.reduce((sum, j) => sum + j.totalCarrys, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ganhos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {jogadores.reduce((sum, j) => sum + j.totalGanho, 0)}kk
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Jogadores */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Membros da Equipe
                </h2>
              </div>

              {/* Filtros */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar jogador..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="todos">Todas</option>
                  <option value="hela">Hela</option>
                  <option value="carrys">Carrys</option>
                  <option value="suplente">Suplente</option>
                </select>
              </div>

              <div className="space-y-3">
                {jogadoresFiltrados.map((jogador) => {
                  const conquistas = calcularConquistas(jogador)
                  const conquistasConcluidas = conquistas.filter(c => c.concluida).length
                  
                  return (
                    <button
                      key={jogador.id}
                      onClick={() => setJogadorSelecionado(jogador)}
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {jogador.nick[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {jogador.nick}
                              </h3>
                              {jogador.essencial && (
                                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                              )}
                              {jogador.categorias.includes('HELA') && (
                                <Crown className="w-4 h-4 text-purple-500" fill="currentColor" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span>{jogador.totalCarrys} carrys</span>
                              <span>•</span>
                              <span>{jogador.totalGanho}kk ganho</span>
                              <span>•</span>
                              <span>{conquistasConcluidas}/7 conquistas</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={jogador.ativo ? 'success' : 'default'}>
                            {jogador.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Ranking */}
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Top 10
                </h2>
              </div>

              <div className="space-y-3">
                {ranking.map((jogador, index) => (
                  <div
                    key={jogador.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg
                      ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'bg-gray-50 dark:bg-gray-800'}
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-500'}
                    `}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {jogador.nick}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {jogador.totalGanho}kk • {jogador.totalCarrys} carrys
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Modal de Detalhes do Jogador */}
        {jogadorSelecionado && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setJogadorSelecionado(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-purple-600">
                      {jogadorSelecionado.nick[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1">
                        {jogadorSelecionado.nick}
                      </h2>
                      <div className="flex items-center gap-2">
                        {jogadorSelecionado.essencial && (
                          <Badge variant="warning">⭐ Essencial</Badge>
                        )}
                        {jogadorSelecionado.categorias.includes('HELA') && (
                          <Badge variant="info">👑 Hela</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setJogadorSelecionado(null)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              </div>

              {/* Conquistas */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Conquistas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {calcularConquistas(jogadorSelecionado).map((conquista) => (
                    <div
                      key={conquista.id}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${conquista.concluida
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-500'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{conquista.icone}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {conquista.nome}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {conquista.descricao}
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${conquista.concluida ? 'bg-green-500' : 'bg-purple-500'}`}
                              style={{ width: `${(conquista.progresso / conquista.meta) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {conquista.progresso} / {conquista.meta}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
