'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Wallet, TrendingUp, Calendar, DollarSign, Clock } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'

interface CarryParticipacao {
  id: number
  pedido: {
    id: number
    nomeCliente: string
    dataAgendada: string
    status: string
  }
  valorRecebido: number
  pago: boolean
  createdAt: string
}

export default function MeusGanhosPage() {
  const { data: session } = useSession()
  const [participacoes, setParticipacoes] = useState<CarryParticipacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Buscar participações do jogador logado
    // Por enquanto, dados mockados
    setLoading(false)
  }, [])

  // Cálculos
  const totalGanho = 850 // KK
  const totalPendente = 320 // KK
  const totalCarrys = 12
  const carrysPendentes = 3

  const formatarValor = (valor: number): string => {
    if (valor >= 1000) {
      return `${(valor / 1000).toFixed(1)}b`
    }
    return `${valor}kk`
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Meus Ganhos</h1>
          <p className="text-gray-600">Acompanhe seus ganhos e participações em carrys</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Recebido</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatarValor(totalGanho)}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">A Receber</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatarValor(totalPendente)}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Carrys Feitos</div>
                <div className="text-2xl font-bold text-purple-600">
                  {totalCarrys}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Agendados</div>
                <div className="text-2xl font-bold text-orange-600">
                  {carrysPendentes}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Histórico de Ganhos */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Histórico de Participações</h2>
            <p className="text-sm text-gray-600 mt-1">Seus últimos carrys e pagamentos</p>
          </div>

          {/* Lista de Participações */}
          <div className="space-y-3">
            {/* Exemplo 1 - Pago */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">Cliente: João Silva</h3>
                  <Badge variant="success">✅ Pago</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  🗓️ Realizado em 20/12/2025 • Carry Hela
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">85kk</div>
                <div className="text-xs text-gray-500">Recebido</div>
              </div>
            </div>

            {/* Exemplo 2 - Pago */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">Cliente: Maria Santos</h3>
                  <Badge variant="success">✅ Pago</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  🗓️ Realizado em 18/12/2025 • Bosses 1-6
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">70kk</div>
                <div className="text-xs text-gray-500">Recebido</div>
              </div>
            </div>

            {/* Exemplo 3 - Pendente */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">Cliente: Pedro Costa</h3>
                  <Badge variant="primary">⏳ Agendado</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  🗓️ Agendado para 25/12/2025 • Carry Hela
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">85kk</div>
                <div className="text-xs text-gray-500">A Receber</div>
              </div>
            </div>

            {/* Exemplo 4 - Pendente */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">Cliente: Ana Lima</h3>
                  <Badge variant="warning">🕐 Em andamento</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  🗓️ Hoje, 20:00 • Bosses 4-6
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">60kk</div>
                <div className="text-xs text-gray-500">A Receber</div>
              </div>
            </div>
          </div>

          {/* Sem dados */}
          {loading && (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Carregando seus ganhos...</p>
            </div>
          )}
        </Card>

        {/* Média de Ganhos */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Média por Carry</span>
                <span className="font-bold text-gray-900">~70kk</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Maior Ganho</span>
                <span className="font-bold text-green-600">95kk</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Este Mês</span>
                <span className="font-bold text-purple-600">450kk</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Metas</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Meta Mensal (1b)</span>
                  <span className="text-sm font-bold text-purple-600">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Carrys no Mês (20)</span>
                  <span className="text-sm font-bold text-blue-600">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

