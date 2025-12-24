'use client'

import { Calendar, DollarSign, Users, CheckCircle } from 'lucide-react'
import { Card } from '../Card'
import { Badge } from '../Badge'

interface Atividade {
  id: number
  tipo: 'carry' | 'pagamento' | 'jogador' | 'concluido'
  titulo: string
  descricao: string
  tempo: string
  valor?: number
}

interface AtividadesRecentesProps {
  atividades: Atividade[]
}

export function AtividadesRecentes({ atividades }: AtividadesRecentesProps) {
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'carry': return Calendar
      case 'pagamento': return DollarSign
      case 'jogador': return Users
      case 'concluido': return CheckCircle
      default: return Calendar
    }
  }

  const getColor = (tipo: string) => {
    switch (tipo) {
      case 'carry': return 'bg-blue-100 text-blue-600'
      case 'pagamento': return 'bg-green-100 text-green-600'
      case 'jogador': return 'bg-purple-100 text-purple-600'
      case 'concluido': return 'bg-emerald-100 text-emerald-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-bold text-gray-900 mb-4">🔥 Atividades Recentes</h3>
      <div className="space-y-3">
        {atividades.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhuma atividade recente</p>
        ) : (
          atividades.map((atividade) => {
            const Icon = getIcon(atividade.tipo)
            return (
              <div key={atividade.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg ${getColor(atividade.tipo)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{atividade.titulo}</p>
                  <p className="text-sm text-gray-600">{atividade.descricao}</p>
                  {atividade.valor && (
                    <Badge variant="success" className="mt-1">
                      💰 {atividade.valor >= 1000 ? `${(atividade.valor / 1000).toFixed(1)}b` : `${atividade.valor}kk`}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{atividade.tempo}</span>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

