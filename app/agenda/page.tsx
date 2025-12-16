'use client'

import { useState, useEffect } from 'react'
import { ToolsLayout } from '../components/ToolsLayout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  Coins, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Edit2,
  Save
} from 'lucide-react'

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

const formatZeny = (value: number): string => {
  if (value >= 1000000000) return (value / 1000000000).toFixed(2) + 'B'
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return Math.round(value / 1000) + 'K'
  return value.toLocaleString('pt-BR')
}

// Conteúdos disponíveis
const CONTEUDOS = [
  { id: 'bio5', nome: 'Bio 5', cor: 'purple', tempoBase: 45 },
  { id: 'verus', nome: 'Verus', cor: 'blue', tempoBase: 60 },
  { id: 'cheffenia', nome: 'Cheffenia', cor: 'amber', tempoBase: 30 },
  { id: 'torres', nome: 'Torres', cor: 'cyan', tempoBase: 90 },
  { id: 'thanatos', nome: 'Thanatos', cor: 'red', tempoBase: 120 },
  { id: 'expedicao', nome: 'Expedição', cor: 'green', tempoBase: 20 },
  { id: 'somatologia', nome: 'Somatologia', cor: 'pink', tempoBase: 15 },
  { id: 'geffenia', nome: 'Geffenia', cor: 'indigo', tempoBase: 30 },
]

interface Registro {
  id: number
  conteudo: string
  nome_conteudo: string
  porcentagem_drop: number
  tempo_minutos: number
  custo_entrada: number
  custo_consumiveis: number
  custo_total: number
  profit_estimado: number
  profit_real?: number
  observacoes?: string
}

interface Agenda {
  id: number
  data: string
  registros: Registro[]
}

interface ConfigConsumiveis {
  conteudo: string
  item_name: string
  quantidade: number
  preco_fixo: number
}

interface ConfigDrops {
  conteudo: string
  item_name: string
  quantidade_media: number
  preco_npc: number
  is_raw_zeny: boolean
}

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [configConsumiveis, setConfigConsumiveis] = useState<ConfigConsumiveis[]>([])
  const [configDrops, setConfigDrops] = useState<ConfigDrops[]>([])
  
  // Estado do novo registro
  const [novoRegistro, setNovoRegistro] = useState({
    conteudo: '',
    porcentagem_drop: 100,
    tempo_minutos: 60,
    profit_real: ''
  })
  
  // Estatísticas do período
  const [estatisticas, setEstatisticas] = useState({
    totalProfit: 0,
    totalCusto: 0,
    totalTempo: 0,
    conteudosMaisFeitos: [] as { nome: string; count: number }[]
  })

  useEffect(() => {
    fetchAgendas()
    fetchConfigs()
  }, [])

  useEffect(() => {
    calcularEstatisticas()
  }, [agendas])

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/config-farm')
      if (response.ok) {
        const data = await response.json()
        setConfigConsumiveis(data.consumiveis || [])
        setConfigDrops(data.drops || [])
      }
    } catch (err) {
      console.error('Erro ao buscar configs:', err)
    }
  }

  const fetchAgendas = async () => {
    setLoading(true)
    try {
      // Buscar últimos 30 dias
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      
      const response = await fetch(
        `/api/agenda-farm?user_id=guest&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setAgendas(data)
      }
    } catch (err) {
      console.error('Erro ao buscar agendas:', err)
    } finally {
      setLoading(false)
    }
  }

  const calcularEstatisticas = () => {
    let totalProfit = 0
    let totalCusto = 0
    let totalTempo = 0
    const conteudoCount: Record<string, number> = {}
    
    agendas.forEach(agenda => {
      agenda.registros?.forEach(reg => {
        totalProfit += reg.profit_real || reg.profit_estimado || 0
        totalCusto += reg.custo_total || 0
        totalTempo += reg.tempo_minutos || 0
        conteudoCount[reg.nome_conteudo] = (conteudoCount[reg.nome_conteudo] || 0) + 1
      })
    })
    
    const conteudosMaisFeitos = Object.entries(conteudoCount)
      .map(([nome, count]) => ({ nome, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    setEstatisticas({
      totalProfit,
      totalCusto,
      totalTempo,
      conteudosMaisFeitos
    })
  }

  const calcularCustoConsumiveis = (conteudo: string): number => {
    const consumiveis = configConsumiveis.filter(c => c.conteudo === conteudo)
    return consumiveis.reduce((acc, c) => acc + (c.quantidade * c.preco_fixo), 0)
  }

  const calcularProfitEstimado = (conteudo: string): number => {
    const drops = configDrops.filter(d => d.conteudo === conteudo && d.is_raw_zeny)
    return drops.reduce((acc, d) => acc + (d.preco_npc || 0), 0)
  }

  const adicionarRegistro = async () => {
    if (!novoRegistro.conteudo) return
    
    setSaving(true)
    try {
      const conteudoInfo = CONTEUDOS.find(c => c.id === novoRegistro.conteudo)
      const custoConsumivel = calcularCustoConsumiveis(novoRegistro.conteudo)
      const profitBase = calcularProfitEstimado(novoRegistro.conteudo)
      const profitAjustado = Math.round(profitBase * (novoRegistro.porcentagem_drop / 100))
      
      const response = await fetch('/api/agenda-farm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'guest',
          data: selectedDate,
          registro: {
            conteudo: novoRegistro.conteudo,
            nome_conteudo: conteudoInfo?.nome || novoRegistro.conteudo,
            porcentagem_drop: novoRegistro.porcentagem_drop,
            tempo_minutos: novoRegistro.tempo_minutos || conteudoInfo?.tempoBase || 60,
            custo_entrada: 0,
            custo_consumiveis: custoConsumivel,
            profit_estimado: profitAjustado,
            profit_real: novoRegistro.profit_real ? parseInt(novoRegistro.profit_real) : null
          }
        })
      })
      
      if (response.ok) {
        await fetchAgendas()
        setShowAddModal(false)
        setNovoRegistro({
          conteudo: '',
          porcentagem_drop: 100,
          tempo_minutos: 60,
          profit_real: ''
        })
      }
    } catch (err) {
      console.error('Erro ao adicionar registro:', err)
    } finally {
      setSaving(false)
    }
  }

  const removerRegistro = async (registroId: number) => {
    if (!confirm('Remover este registro?')) return
    
    try {
      const response = await fetch(`/api/agenda-farm?registro_id=${registroId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchAgendas()
      }
    } catch (err) {
      console.error('Erro ao remover registro:', err)
    }
  }

  const agendaDoDia = agendas.find(a => a.data === selectedDate)
  const registrosDoDia = agendaDoDia?.registros || []

  const mudarDia = (dias: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + dias)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const totalDia = registrosDoDia.reduce((acc, r) => ({
    profit: acc.profit + (r.profit_real || r.profit_estimado || 0),
    custo: acc.custo + (r.custo_total || 0),
    tempo: acc.tempo + (r.tempo_minutos || 0)
  }), { profit: 0, custo: 0, tempo: 0 })

  const getCorClasse = (cor: string) => {
    const cores: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    }
    return cores[cor] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Agenda de Farm
            </h1>
            <p className="text-gray-500 mt-1">Registre e acompanhe seu farm diário</p>
          </div>

          {/* Estatísticas do período */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Profit (30 dias)</p>
                  <p className="font-bold text-green-600">{formatZeny(estatisticas.totalProfit)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Coins className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Custo (30 dias)</p>
                  <p className="font-bold text-red-600">{formatZeny(estatisticas.totalCusto)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lucro Líquido</p>
                  <p className={`font-bold ${estatisticas.totalProfit - estatisticas.totalCusto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatZeny(estatisticas.totalProfit - estatisticas.totalCusto)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tempo Total</p>
                  <p className="font-bold text-purple-600">{Math.round(estatisticas.totalTempo / 60)}h {estatisticas.totalTempo % 60}m</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Coluna principal - Registros do dia */}
            <div className="lg:col-span-2 space-y-4">
              {/* Seletor de data */}
              <Card className="p-4 bg-white border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => mudarDia(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <div className="text-center">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="text-lg font-semibold text-gray-900 bg-transparent border-none text-center cursor-pointer"
                    />
                    <p className="text-sm text-gray-500">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { 
                        weekday: 'long' 
                      })}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => mudarDia(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </Card>

              {/* Resumo do dia */}
              {registrosDoDia.length > 0 && (
                <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100 shadow-sm">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Profit</p>
                      <p className="font-bold text-green-600">{formatZeny(totalDia.profit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Custo</p>
                      <p className="font-bold text-red-600">{formatZeny(totalDia.custo)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tempo</p>
                      <p className="font-bold text-purple-600">{totalDia.tempo}min</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Registros */}
              <div className="space-y-3">
                {loading ? (
                  <Card className="p-8 bg-white border-gray-200 shadow-sm">
                    <p className="text-center text-gray-500">Carregando...</p>
                  </Card>
                ) : registrosDoDia.length === 0 ? (
                  <Card className="p-8 bg-white border-gray-200 shadow-sm">
                    <p className="text-center text-gray-500">Nenhum conteúdo registrado neste dia</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 mx-auto flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar conteúdo
                    </button>
                  </Card>
                ) : (
                  registrosDoDia.map((registro) => {
                    const conteudoInfo = CONTEUDOS.find(c => c.id === registro.conteudo)
                    return (
                      <Card key={registro.id} className="p-4 bg-white border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getCorClasse(conteudoInfo?.cor || 'gray')}`}>
                              {registro.nome_conteudo}
                            </div>
                            {registro.porcentagem_drop < 100 && (
                              <span className="text-xs text-gray-500">
                                ({registro.porcentagem_drop}% drop)
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">
                                +{formatZeny(registro.profit_real || registro.profit_estimado)}
                              </p>
                              <p className="text-xs text-red-500">
                                -{formatZeny(registro.custo_total)}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => removerRegistro(registro.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {registro.tempo_minutos}min
                          </span>
                          {registro.observacoes && (
                            <span className="truncate">{registro.observacoes}</span>
                          )}
                        </div>
                      </Card>
                    )
                  })
                )}
              </div>

              {/* Botão adicionar */}
              {!loading && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar conteúdo feito
                </button>
              )}
            </div>

            {/* Coluna lateral - Conteúdos mais feitos */}
            <div className="space-y-4">
              <Card className="p-4 bg-white border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Conteúdos mais feitos</h3>
                {estatisticas.conteudosMaisFeitos.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum dado ainda</p>
                ) : (
                  <div className="space-y-3">
                    {estatisticas.conteudosMaisFeitos.map((item, idx) => {
                      const conteudoInfo = CONTEUDOS.find(c => c.nome === item.nome)
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-sm ${getCorClasse(conteudoInfo?.cor || 'gray')}`}>
                            {item.nome}
                          </span>
                          <span className="text-sm font-medium text-gray-600">
                            {item.count}x
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>

              <Card className="p-4 bg-white border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Atalhos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CONTEUDOS.slice(0, 6).map(conteudo => (
                    <button
                      key={conteudo.id}
                      onClick={() => {
                        setNovoRegistro(prev => ({ ...prev, conteudo: conteudo.id }))
                        setShowAddModal(true)
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${getCorClasse(conteudo.cor)}`}
                    >
                      {conteudo.nome}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Modal adicionar */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white border-gray-200 shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Adicionar Conteúdo</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Seleção de conteúdo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTEUDOS.map(conteudo => (
                      <button
                        key={conteudo.id}
                        onClick={() => setNovoRegistro(prev => ({ 
                          ...prev, 
                          conteudo: conteudo.id,
                          tempo_minutos: conteudo.tempoBase
                        }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                          novoRegistro.conteudo === conteudo.id 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-transparent'
                        } ${getCorClasse(conteudo.cor)}`}
                      >
                        {conteudo.nome}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Porcentagem de drop */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    % de Drop (piloto?)
                  </label>
                  <div className="flex gap-2">
                    {[100, 75, 50, 25].map(pct => (
                      <button
                        key={pct}
                        onClick={() => setNovoRegistro(prev => ({ ...prev, porcentagem_drop: pct }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          novoRegistro.porcentagem_drop === pct
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tempo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo (minutos)
                  </label>
                  <input
                    type="number"
                    value={novoRegistro.tempo_minutos}
                    onChange={(e) => setNovoRegistro(prev => ({ ...prev, tempo_minutos: parseInt(e.target.value) || 60 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Profit real (opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profit Real (opcional)
                  </label>
                  <input
                    type="text"
                    value={novoRegistro.profit_real}
                    onChange={(e) => setNovoRegistro(prev => ({ ...prev, profit_real: e.target.value }))}
                    placeholder="Ex: 5000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Se souber o valor exato que ganhou</p>
                </div>

                {/* Preview */}
                {novoRegistro.conteudo && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Custo estimado:</span>{' '}
                      <span className="text-red-600">{formatZeny(calcularCustoConsumiveis(novoRegistro.conteudo))}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Profit estimado:</span>{' '}
                      <span className="text-green-600">
                        {formatZeny(Math.round(calcularProfitEstimado(novoRegistro.conteudo) * (novoRegistro.porcentagem_drop / 100)))}
                      </span>
                    </p>
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={adicionarRegistro}
                    disabled={!novoRegistro.conteudo || saving}
                    className="flex-1"
                  >
                    {saving ? 'Salvando...' : 'Adicionar'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </ToolsLayout>
  )
}

