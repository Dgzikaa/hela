'use client'

import { Target, TrendingUp } from 'lucide-react'
import { Card } from '../Card'

interface Meta {
  id: number
  titulo: string
  atual: number
  objetivo: number
  unidade: string
  cor: 'purple' | 'blue' | 'green' | 'orange'
}

interface MetasProgressProps {
  metas: Meta[]
}

export function MetasProgress({ metas }: MetasProgressProps) {
  const getCorBarra = (cor: string) => {
    switch (cor) {
      case 'purple': return 'bg-purple-600'
      case 'blue': return 'bg-blue-600'
      case 'green': return 'bg-green-600'
      case 'orange': return 'bg-orange-600'
      default: return 'bg-gray-600'
    }
  }

  const calcularProgresso = (atual: number, objetivo: number) => {
    return Math.min(Math.round((atual / objetivo) * 100), 100)
  }

  return (
    <Card>
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-600" />
        Metas do Mês
      </h3>
      
      <div className="space-y-4">
        {metas.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhuma meta configurada</p>
        ) : (
          metas.map((meta) => {
            const progresso = calcularProgresso(meta.atual, meta.objetivo)
            const concluida = progresso >= 100

            return (
              <div key={meta.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{meta.titulo}</p>
                    {concluida && <span className="text-green-600">✓</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`font-bold ${concluida ? 'text-green-600' : 'text-gray-900'}`}>
                      {progresso}%
                    </span>
                    {progresso > 80 && !concluida && (
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                </div>
                
                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getCorBarra(meta.cor)} ${
                      concluida ? 'animate-pulse' : ''
                    }`}
                    style={{ width: `${progresso}%` }}
                  />
                  {concluida && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🎉 CONCLUÍDA!</span>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-600">
                  {meta.atual} / {meta.objetivo} {meta.unidade}
                </p>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

