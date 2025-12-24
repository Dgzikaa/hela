'use client'

import { Trophy, TrendingUp } from 'lucide-react'
import { Card } from '../Card'
import { Badge } from '../Badge'

interface Jogador {
  id: number
  nome: string
  carrys: number
  ganhos: number
  posicao: number
}

interface TopJogadoresProps {
  jogadores: Jogador[]
  periodo?: 'semana' | 'mes'
}

export function TopJogadores({ jogadores, periodo = 'mes' }: TopJogadoresProps) {
  const getMedalha = (posicao: number) => {
    switch (posicao) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `${posicao}º`
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Top Jogadores
        </h3>
        <Badge variant="info">{periodo === 'semana' ? 'Esta Semana' : 'Este Mês'}</Badge>
      </div>
      
      <div className="space-y-3">
        {jogadores.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhum dado disponível</p>
        ) : (
          jogadores.map((jogador) => (
            <div 
              key={jogador.id} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                jogador.posicao <= 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold w-10 text-center">
                {getMedalha(jogador.posicao)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{jogador.nome}</p>
                <p className="text-sm text-gray-600">
                  {jogador.carrys} carrys • {jogador.ganhos >= 1000 ? `${(jogador.ganhos / 1000).toFixed(1)}b` : `${jogador.ganhos}kk`}
                </p>
              </div>
              {jogador.posicao <= 3 && (
                <TrendingUp className="w-5 h-5 text-green-600" />
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

