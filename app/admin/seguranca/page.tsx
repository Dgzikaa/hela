'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/app/components/Card'
import { 
  Shield, 
  Activity, 
  Users, 
  Lock, 
  Key, 
  AlertTriangle,
  Clock,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

interface AuditLog {
  id: number
  usuarioNome: string
  acao: string
  entidade: string
  entidadeId: number | null
  descricao: string
  createdAt: string
  ip: string | null
}

interface Stats {
  totalLogs: number
  ultimasHoras: number
  ultimosDias: number
}

export default function SecurityDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<Stats>({ totalLogs: 0, ultimasHoras: 0, ultimosDias: 0 })
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    acao: '',
    entidade: '',
    page: 1
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      carregarLogs()
    }
  }, [status, router, filtros])

  const carregarLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: filtros.page.toString(),
        limit: '20',
        ...(filtros.acao && { acao: filtros.acao }),
        ...(filtros.entidade && { entidade: filtros.entidade })
      })

      const res = await fetch(`/api/audit-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAcaoBadgeColor = (acao: string) => {
    switch (acao) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getAcaoIcon = (acao: string) => {
    switch (acao) {
      case 'CREATE':
        return '➕'
      case 'UPDATE':
        return '✏️'
      case 'DELETE':
        return '🗑️'
      case 'LOGIN':
        return '🔓'
      case 'LOGOUT':
        return '🔒'
      default:
        return '📝'
    }
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
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Dashboard de Segurança
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Logs de auditoria e monitoramento de atividades
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Logs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLogs.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Últimas 24h</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ultimasHoras}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Últimos 7 dias</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ultimosDias}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ação
              </label>
              <select
                value={filtros.acao}
                onChange={(e) => setFiltros({ ...filtros, acao: e.target.value, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todas as ações</option>
                <option value="CREATE">Criação</option>
                <option value="UPDATE">Atualização</option>
                <option value="DELETE">Exclusão</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Entidade
              </label>
              <select
                value={filtros.entidade}
                onChange={(e) => setFiltros({ ...filtros, entidade: e.target.value, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todas as entidades</option>
                <option value="Cliente">Cliente</option>
                <option value="Pedido">Pedido</option>
                <option value="Jogador">Jogador</option>
                <option value="Usuario">Usuário</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={carregarLogs}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>
            </div>
          </div>
        </Card>

        {/* Logs Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {log.usuarioNome[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.usuarioNome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getAcaoBadgeColor(log.acao)}`}>
                        <span>{getAcaoIcon(log.acao)}</span>
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">
                      {log.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.ip || '-'}
                    </td>
                  </tr>
                ))}

                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">Nenhum log encontrado</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Página {filtros.page}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiltros({ ...filtros, page: filtros.page - 1 })}
                  disabled={filtros.page === 1}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setFiltros({ ...filtros, page: filtros.page + 1 })}
                  disabled={logs.length < 20}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

