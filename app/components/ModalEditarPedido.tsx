'use client'

import { useState, useEffect } from 'react'
import { Edit2, DollarSign, Save, X } from 'lucide-react'
import { Button } from './Button'
import { Badge } from './Badge'

interface Boss {
  id: number
  nome: string
  preco: number
  ordem: number
}

interface Pedido {
  id: number
  nomeCliente: string
  contatoCliente: string
  status: string
  statusPagamento?: string
  dataAgendada: string | null
  horario?: string | null
  valorTotal: number
  valorFinal: number
  valorReserva: number
  reservaPaga: boolean
  itens: {
    id: number
    preco: number
    boss: Boss
  }[]
}

interface Props {
  pedido: Pedido | null
  bosses: Boss[]
  onClose: () => void
  onSave: (dados: any) => Promise<void>
}

export function ModalEditarPedido({ pedido, bosses, onClose, onSave }: Props) {
  const [loading, setLoading] = useState(false)
  const [bossesPrecos, setBossesPrecos] = useState<Record<number, number>>({})
  const [bossesGratis, setBossesGratis] = useState<Set<number>>(new Set())
  const [valorFinal, setValorFinal] = useState(0)
  const [statusPagamento, setStatusPagamento] = useState('NAO_PAGO')
  const [valorPago, setValorPago] = useState(0)
  const [horario, setHorario] = useState('21:00')

  useEffect(() => {
    if (!pedido) return

    // Inicializar preços dos bosses
    const precos: Record<number, number> = {}
    const gratis = new Set<number>()
    
    pedido.itens.forEach(item => {
      precos[item.boss.id] = item.preco
      if (item.preco === 0) {
        gratis.add(item.boss.id)
      }
    })

    setBossesPrecos(precos)
    setBossesGratis(gratis)
    setValorFinal(pedido.valorFinal)
    setStatusPagamento(pedido.statusPagamento || 'NAO_PAGO')
    setValorPago(pedido.valorReserva || 0)
    
    // Inicializar horário
    if (pedido.horario) {
      const horarioFormatado = pedido.horario.substring(0, 5) // "HH:MM"
      setHorario(horarioFormatado)
    } else if (pedido.dataAgendada) {
      // Calcular horário padrão baseado no dia da semana
      const data = new Date(pedido.dataAgendada)
      const diaSemana = data.getDay() // 0=Domingo, 6=Sábado
      const horarioPadrao = (diaSemana === 0 || diaSemana === 6) ? '15:00' : '19:00'
      setHorario(horarioPadrao)
    }
  }, [pedido])

  if (!pedido) return null

  const helaSelecionada = Object.keys(bossesPrecos).includes('7') // Boss ID 7 = Hela

  const handleBossToggle = (bossId: number) => {
    const boss = bosses.find(b => b.id === bossId)
    if (!boss) return

    // Se está selecionando HELA
    if (bossId === 7 && !bossesPrecos[7]) {
      const novosPrecos: Record<number, number> = { ...bossesPrecos }
      const novosGratis = new Set(bossesGratis)

      // Hela tem preço normal
      novosPrecos[7] = boss.preco

      // Bosses 1-6 são adicionados DE GRAÇA
      bosses.filter(b => b.id !== 7).forEach(b => {
        novosPrecos[b.id] = 0
        novosGratis.add(b.id)
      })

      setBossesPrecos(novosPrecos)
      setBossesGratis(novosGratis)
      setValorFinal(boss.preco) // Só o valor da Hela
      return
    }

    // Se está DEsselecionando HELA
    if (bossId === 7 && bossesPrecos[7]) {
      const novosPrecos = { ...bossesPrecos }
      const novosGratis = new Set(bossesGratis)
      
      delete novosPrecos[7]
      
      // Remover também os bosses 1-6 gratuitos
      bosses.filter(b => b.id !== 7).forEach(b => {
        delete novosPrecos[b.id]
        novosGratis.delete(b.id)
      })

      setBossesPrecos(novosPrecos)
      setBossesGratis(novosGratis)
      setValorFinal(0)
      return
    }

    // Toggle normal para outros bosses (se não tiver Hela)
    if (!helaSelecionada) {
      if (bossesPrecos[bossId]) {
        const novosPrecos = { ...bossesPrecos }
        delete novosPrecos[bossId]
        setBossesPrecos(novosPrecos)
        
        const novoTotal = Object.values(novosPrecos).reduce((sum, p) => sum + p, 0)
        setValorFinal(novoTotal)
      } else {
        const novosPrecos = { ...bossesPrecos, [bossId]: boss.preco }
        setBossesPrecos(novosPrecos)
        
        const novoTotal = Object.values(novosPrecos).reduce((sum, p) => sum + p, 0)
        setValorFinal(novoTotal)
      }
    }
  }

  const handlePrecoChange = (bossId: number, novoPreco: number) => {
    // Não permitir mudar preço da Hela ou de bosses gratuitos quando Hela está selecionada
    if (helaSelecionada && bossId !== 7) {
      return
    }

    const novosPrecos = { ...bossesPrecos, [bossId]: novoPreco }
    setBossesPrecos(novosPrecos)

    if (helaSelecionada) {
      // Se Hela selecionada, o total é apenas o preço da Hela
      setValorFinal(novosPrecos[7] || 0)
    } else {
      const novoTotal = Object.values(novosPrecos).reduce((sum, p) => sum + p, 0)
      setValorFinal(novoTotal)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const itensPedido = Object.entries(bossesPrecos).map(([bossId, preco]) => ({
        bossId: parseInt(bossId),
        preco
      }))

      await onSave({
        id: pedido.id,
        valorTotal: valorFinal,
        valorFinal,
        valorReserva: valorPago,
        statusPagamento,
        reservaPaga: statusPagamento !== 'NAO_PAGO',
        horario: horario + ':00', // Converter HH:MM para HH:MM:SS
        itens: itensPedido
      })

      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setLoading(false)
    }
  }

  const bossesOrdenados = [...bosses].sort((a, b) => a.ordem - b.ordem)

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg max-w-4xl w-full p-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Edit2 className="w-6 h-6 text-blue-500" />
              Editar Pedido #{pedido.id}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Cliente: {pedido.nomeCliente} • Status: {pedido.status}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Coluna 1: Bosses */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">📋 Bosses</h3>
            
            {helaSelecionada && (
              <div className="mb-4 p-3 bg-purple-900/30 border border-purple-500 rounded-lg">
                <p className="text-purple-300 text-sm">
                  👑 <strong>Hela selecionada!</strong> Bosses 1-6 incluídos de graça para pegar relíquias.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {bossesOrdenados.map(boss => {
                const selecionado = !!bossesPrecos[boss.id]
                const gratis = bossesGratis.has(boss.id)
                const desabilitado = helaSelecionada && boss.id !== 7

                return (
                  <div
                    key={boss.id}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${selecionado 
                        ? gratis
                          ? 'bg-green-900/20 border-green-500'
                          : 'bg-blue-900/20 border-blue-500'
                        : 'bg-gray-700/50 border-gray-600'
                      }
                      ${desabilitado ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={() => handleBossToggle(boss.id)}
                          disabled={desabilitado}
                          className="w-5 h-5 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">{boss.nome}</p>
                          {gratis && (
                            <Badge variant="success" className="mt-1">
                              Grátis (Relíquias)
                            </Badge>
                          )}
                        </div>
                      </label>

                      {selecionado && !gratis && (
                        <input
                          type="number"
                          value={bossesPrecos[boss.id] || 0}
                          onChange={(e) => handlePrecoChange(boss.id, parseInt(e.target.value) || 0)}
                          disabled={desabilitado}
                          className="w-24 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 text-right"
                          placeholder="Preço"
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Coluna 2: Valores e Pagamento */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">💰 Valores e Pagamento</h3>

            <div className="space-y-4">
              {/* Horário do Carry */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <label className="block text-gray-300 text-sm mb-2">🕐 Horário do Clear (Brasília)</label>
                <input
                  type="time"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-600 text-lg"
                />
                <p className="text-gray-400 text-xs mt-2">
                  ⏰ Padrão: Semana <strong>19:00</strong> | Fim de semana <strong>15:00</strong>
                </p>
              </div>

              {/* Valor Total */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <label className="block text-gray-300 text-sm mb-2">Valor Total do Carry</label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <input
                    type="number"
                    value={valorFinal}
                    onChange={(e) => setValorFinal(parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded border border-gray-600 text-lg font-bold"
                  />
                  <span className="text-gray-400">kk</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  = {(valorFinal / 1000).toFixed(1)}b
                </p>
              </div>

              {/* Status de Pagamento */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <label className="block text-gray-300 text-sm mb-2">Status de Pagamento</label>
                <select
                  value={statusPagamento}
                  onChange={(e) => setStatusPagamento(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-600"
                >
                  <option value="NAO_PAGO">❌ Não Pagou</option>
                  <option value="SINAL">💰 Pagou Sinal</option>
                  <option value="PAGO">✅ Pago Completo</option>
                </select>
              </div>

              {/* Valor Pago */}
              {statusPagamento !== 'NAO_PAGO' && (
                <div className="p-4 bg-gray-700 rounded-lg">
                  <label className="block text-gray-300 text-sm mb-2">
                    Valor {statusPagamento === 'SINAL' ? 'do Sinal' : 'Pago'}
                  </label>
                  <input
                    type="number"
                    value={valorPago}
                    onChange={(e) => setValorPago(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-600"
                    placeholder="Ex: 2000 (2b)"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    = {(valorPago / 1000).toFixed(1)}b
                  </p>
                </div>
              )}

              {/* Valor Restante */}
              {statusPagamento !== 'NAO_PAGO' && (
                <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
                  <p className="text-yellow-300 text-sm mb-1">Falta Pagar:</p>
                  <p className="text-yellow-400 text-2xl font-bold">
                    {valorFinal - valorPago}kk
                  </p>
                  <p className="text-yellow-300 text-xs">
                    = {((valorFinal - valorPago) / 1000).toFixed(1)}b
                  </p>
                </div>
              )}

              {/* Resumo */}
              <div className="p-4 bg-gray-900 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bosses selecionados:</span>
                  <span className="text-white font-semibold">
                    {Object.keys(bossesPrecos).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bosses gratuitos:</span>
                  <span className="text-green-400 font-semibold">
                    {bossesGratis.size}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-2">
                  <span className="text-gray-400">Valor a cobrar:</span>
                  <span className="text-green-400 font-bold text-lg">
                    {valorFinal}kk
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || Object.keys(bossesPrecos).length === 0}
            variant="primary"
            className="flex-1"
          >
            {loading ? (
              'Salvando...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

