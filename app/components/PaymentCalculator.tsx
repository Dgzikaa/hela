'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Users, 
  Calculator, 
  Check, 
  Star, 
  Crown,
  AlertCircle
} from 'lucide-react'
import { Card } from './Card'
import { useToast } from '@/app/hooks/useToast'

interface Jogador {
  id: number
  nick: string
  categorias: string
  essencial: boolean
}

interface Divisao {
  jogadorId: number
  jogadorNick: string
  valorRecebido: number
  percentual: number
  isEssencial: boolean
  categoria: string
}

interface PaymentCalculatorProps {
  pedidoId: number
  valorTotal: number
  jogadoresDisponiveis: Jogador[]
  onAplicar?: (divisoes: Divisao[]) => void
}

export function PaymentCalculator({ 
  pedidoId, 
  valorTotal, 
  jogadoresDisponiveis,
  onAplicar 
}: PaymentCalculatorProps) {
  const [jogadoresSelecionados, setJogadoresSelecionados] = useState<number[]>([])
  const [taxaSistema, setTaxaSistema] = useState(0)
  const [bonusEssencial, setBonusEssencial] = useState(10)
  const [bonusHela, setBonusHela] = useState(15)
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()

  const toggleJogador = (jogadorId: number) => {
    if (jogadoresSelecionados.includes(jogadorId)) {
      setJogadoresSelecionados(jogadoresSelecionados.filter(id => id !== jogadorId))
    } else {
      setJogadoresSelecionados([...jogadoresSelecionados, jogadorId])
    }
    setResultado(null) // Limpar resultado ao mudar seleção
  }

  const calcular = async () => {
    if (jogadoresSelecionados.length === 0) {
      error('Selecione pelo menos 1 jogador')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}/calcular-divisao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jogadoresIds: jogadoresSelecionados,
          taxaSistema,
          bonusEssencial,
          bonusHela,
          aplicar: false
        })
      })

      if (res.ok) {
        const data = await res.json()
        setResultado(data.resultado)
      } else {
        error('Erro ao calcular divisão')
      }
    } catch (error) {
      console.error('Erro:', error)
      showToast('Erro ao calcular divisão', 'error')
    } finally {
      setLoading(false)
    }
  }

  const aplicar = async () => {
    if (!resultado) return

    setLoading(true)
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}/calcular-divisao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jogadoresIds: jogadoresSelecionados,
          taxaSistema,
          bonusEssencial,
          bonusHela,
          aplicar: true
        })
      })

      if (res.ok) {
        const data = await res.json()
        success('Divisão aplicada com sucesso!')
        onAplicar?.(data.resultado.divisoes)
      } else {
        error('Erro ao aplicar divisão')
      }
    } catch (error) {
      console.error('Erro:', error)
      showToast('Erro ao aplicar divisão', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Configurações */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Calculadora de Divisão
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Valor Total: <span className="font-bold text-green-600 dark:text-green-400">{valorTotal}kk</span>
            </p>
          </div>
        </div>

        {/* Configurações de Bônus */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Taxa Sistema (%)
            </label>
            <input
              type="number"
              value={taxaSistema}
              onChange={(e) => {
                setTaxaSistema(Number(e.target.value))
                setResultado(null)
              }}
              min="0"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bônus Essencial (%)
            </label>
            <input
              type="number"
              value={bonusEssencial}
              onChange={(e) => {
                setBonusEssencial(Number(e.target.value))
                setResultado(null)
              }}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bônus Hela (%)
            </label>
            <input
              type="number"
              value={bonusHela}
              onChange={(e) => {
                setBonusHela(Number(e.target.value))
                setResultado(null)
              }}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Seleção de Jogadores */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Selecionar Jogadores ({jogadoresSelecionados.length})
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {jogadoresDisponiveis.map((jogador) => {
              const selecionado = jogadoresSelecionados.includes(jogador.id)
              const isHela = jogador.categorias.includes('HELA')
              
              return (
                <button
                  key={jogador.id}
                  onClick={() => toggleJogador(jogador.id)}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all text-left
                    ${selecionado
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {jogador.nick}
                    </span>
                    {selecionado && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                  <div className="flex items-center gap-1">
                    {jogador.essencial && (
                      <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                    )}
                    {isHela && (
                      <Crown className="w-3 h-3 text-purple-500" fill="currentColor" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Botão Calcular */}
        <button
          onClick={calcular}
          disabled={loading || jogadoresSelecionados.length === 0}
          className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              Calcular Divisão
            </>
          )}
        </button>
      </Card>

      {/* Resultado */}
      {resultado && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              💰 Resultado da Divisão
            </h3>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Valor Líquido</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {resultado.valorLiquido}kk
              </p>
            </div>
          </div>

          {resultado.taxaSistema > 0 && (
            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <p className="text-sm text-orange-800 dark:text-orange-300">
                Taxa do sistema: <strong>{resultado.taxaSistema}kk</strong>
              </p>
            </div>
          )}

          <div className="space-y-3">
            {resultado.divisoes.map((divisao: Divisao, index: number) => (
              <div
                key={divisao.jogadorId}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold
                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-500'}
                  `}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {divisao.jogadorNick}
                      </span>
                      {divisao.isEssencial && (
                        <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                      )}
                      {divisao.categoria.includes('HELA') && (
                        <Crown className="w-4 h-4 text-purple-500" fill="currentColor" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {divisao.percentual}% do total
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {divisao.valorRecebido}kk
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={aplicar}
            disabled={loading}
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Aplicar Divisão ao Pedido
          </button>
        </Card>
      )}
    </div>
  )
}

