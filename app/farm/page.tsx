'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { ToolsLayout } from '../components/ToolsLayout'
import { 
  Calculator,
  TrendingUp,
  Clock,
  Coins,
  Plus,
  Minus,
  Flame,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

// Dados dos conteúdos de farm
const CONTEUDOS_FARM = [
  {
    id: 'bio5',
    nome: 'Bio 5',
    icone: '🧬',
    cor: 'emerald',
    fadigaMaxima: 4500,
    tempoMinutos: 45,
    custoEntrada: 0,
    consumiveis: [
      { nome: 'Blue Potion', qtd: 50, preco: 5000, itemKey: 'blue_potion' },
      { nome: 'Yggdrasil Berry', qtd: 10, preco: 50000, itemKey: 'yggdrasil_berry' },
    ],
    drops: [
      { nome: 'Âmago (média)', preco: 2000000, qtdMedia: 15, itemKey: 'amago' },
      { nome: 'Loot NPC', preco: 1500000, qtdMedia: 1, isFixed: true },
    ],
    dicas: 'Melhor conteúdo para farm consistente. 4.500 mobs de fadiga.'
  },
  {
    id: 'verus',
    nome: 'Verus',
    icone: '⚔️',
    cor: 'purple',
    fadigaMaxima: null,
    tempoMinutos: 60,
    custoEntrada: 500000,
    consumiveis: [
      { nome: 'Blue Potion', qtd: 200, preco: 5000, itemKey: 'blue_potion' },
      { nome: 'Yggdrasil Berry', qtd: 30, preco: 50000, itemKey: 'yggdrasil_berry' },
    ],
    drops: [
      { nome: 'Fragmento Verus', preco: 500000, qtdMedia: 10, itemKey: 'fragmento_verus' },
      { nome: 'Loot NPC', preco: 3000000, qtdMedia: 1, isFixed: true },
    ],
    dicas: 'Entry limitado. Bom profit por hora.'
  },
  {
    id: 'torres',
    nome: 'Torres',
    icone: '🗼',
    cor: 'amber',
    fadigaMaxima: null,
    tempoMinutos: 90,
    custoEntrada: 200000,
    consumiveis: [
      { nome: 'Blue Potion', qtd: 100, preco: 5000, itemKey: 'blue_potion' },
      { nome: 'Speed Potion', qtd: 20, preco: 10000, itemKey: 'speed_potion' },
    ],
    drops: [
      { nome: 'Token Torre', preco: 200000, qtdMedia: 25, itemKey: 'token_torre' },
      { nome: 'Loot NPC', preco: 2000000, qtdMedia: 1, isFixed: true },
    ],
    dicas: 'Demora um pouco. Equipamento necessário.'
  },
  {
    id: 'thanatos',
    nome: 'Thanatos Tower',
    icone: '💀',
    cor: 'red',
    fadigaMaxima: null,
    tempoMinutos: 120,
    custoEntrada: 300000,
    consumiveis: [
      { nome: 'Blue Potion', qtd: 150, preco: 5000, itemKey: 'blue_potion' },
      { nome: 'Yggdrasil Berry', qtd: 20, preco: 50000, itemKey: 'yggdrasil_berry' },
    ],
    drops: [
      { nome: 'Fragmento Thanatos', preco: 800000, qtdMedia: 15, itemKey: 'fragmento_thanatos' },
      { nome: 'Loot NPC', preco: 5000000, qtdMedia: 1, isFixed: true },
    ],
    dicas: 'Endgame content. Alto investimento, alto retorno.'
  },
  {
    id: 'cheffenia',
    nome: 'Cheffenia',
    icone: '👼',
    cor: 'sky',
    fadigaMaxima: null,
    tempoMinutos: 30,
    custoEntrada: 0,
    consumiveis: [
      { nome: 'Blue Potion', qtd: 80, preco: 5000, itemKey: 'blue_potion' },
      { nome: 'Elemental Converter', qtd: 5, preco: 30000, itemKey: 'elemental_converter' },
    ],
    drops: [
      { nome: 'Oridecon', preco: 15000, qtdMedia: 80, itemKey: 'oridecon' },
      { nome: 'Elunium', preco: 20000, qtdMedia: 60, itemKey: 'elunium' },
      { nome: 'Loot NPC', preco: 800000, qtdMedia: 1, isFixed: true },
    ],
    dicas: 'Rápido e sem custo de entrada. Bom para iniciar.'
  },
  {
    id: 'geffenia',
    nome: 'Geffenia',
    icone: '😈',
    cor: 'pink',
    fadigaMaxima: null,
    tempoMinutos: 30,
    custoEntrada: 0,
    consumiveis: [
      { nome: 'Blue Potion', qtd: 100, preco: 5000, itemKey: 'blue_potion' },
    ],
    drops: [
      { nome: 'Loot Geral', preco: 150000, qtdMedia: 30, itemKey: 'loot_geffenia' },
      { nome: 'Loot NPC', preco: 500000, qtdMedia: 1, isFixed: true },
    ],
    dicas: 'Clássico do RO. Consistente e sem entry.'
  },
  {
    id: 'expedicao',
    nome: 'Expedição',
    icone: '🎯',
    cor: 'cyan',
    fadigaMaxima: null,
    tempoMinutos: 20,
    custoEntrada: 0,
    consumiveis: [
      { nome: 'Blue Potion', qtd: 30, preco: 5000, itemKey: 'blue_potion' },
    ],
    drops: [
      { nome: 'Pó de Meteorita', preco: 500000, qtdMedia: 3, itemKey: 'po_meteorita' },
      { nome: 'Loot NPC', preco: 200000, qtdMedia: 1, isFixed: true },
    ],
    dicas: 'Rápido, diário. Boa fonte de Pó de Meteorita.'
  },
  {
    id: 'somatologia',
    nome: 'Somatologia',
    icone: '🔬',
    cor: 'indigo',
    fadigaMaxima: null,
    tempoMinutos: 15,
    custoEntrada: 0,
    consumiveis: [
      { nome: 'Blue Potion', qtd: 20, preco: 5000, itemKey: 'blue_potion' },
    ],
    drops: [
      { nome: 'Material Soma', preco: 300000, qtdMedia: 5, itemKey: 'material_soma' },
      { nome: 'Loot NPC', preco: 150000, qtdMedia: 1, isFixed: true },
    ],
    dicas: 'Super rápido. Complementa a rotina.'
  },
]

const formatZeny = (value: number): string => {
  if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B'
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
  return value.toLocaleString('pt-BR')
}

const getCorClasse = (cor: string) => {
  const cores: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700',
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    sky: 'bg-sky-100 text-sky-700',
    pink: 'bg-pink-100 text-pink-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  }
  return cores[cor] || cores.emerald
}

const getCorBorda = (cor: string) => {
  const cores: Record<string, string> = {
    emerald: 'border-emerald-200',
    purple: 'border-purple-200',
    amber: 'border-amber-200',
    red: 'border-red-200',
    sky: 'border-sky-200',
    pink: 'border-pink-200',
    cyan: 'border-cyan-200',
    indigo: 'border-indigo-200',
  }
  return cores[cor] || cores.emerald
}

const getCorBg = (cor: string) => {
  const cores: Record<string, string> = {
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    sky: 'bg-sky-500',
    pink: 'bg-pink-500',
    cyan: 'bg-cyan-500',
    indigo: 'bg-indigo-500',
  }
  return cores[cor] || cores.emerald
}

interface Rotina {
  conteudoId: string
  quantidade: number
}

interface MarketPrice {
  item_key: string
  price: number
}

export default function FarmCalculadoraPage() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [rotina, setRotina] = useState<Rotina[]>([])
  const [showRotina, setShowRotina] = useState(false)
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({})
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  useEffect(() => {
    fetchMarketPrices()
  }, [])

  const fetchMarketPrices = async () => {
    setLoadingPrices(true)
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/market_prices?select=item_key,price,updated_at`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })
      
      if (response.ok) {
        const prices = await response.json()
        const priceMap: Record<string, number> = {}
        prices.forEach((p: MarketPrice & { updated_at: string }) => {
          priceMap[p.item_key] = p.price
        })
        setMarketPrices(priceMap)
        
        if (prices.length > 0) {
          setLastUpdate(new Date(prices[0].updated_at))
        }
      }
    } catch (err) {
      console.error('Erro ao buscar preços:', err)
    } finally {
      setLoadingPrices(false)
    }
  }

  // Calcula lucro de um conteúdo
  const calcularLucro = (conteudo: typeof CONTEUDOS_FARM[0]) => {
    // Custo total dos consumíveis (usa preço do market se disponível)
    const custoConsumiveis = conteudo.consumiveis.reduce(
      (acc, c) => {
        const preco = marketPrices[c.itemKey] || c.preco
        return acc + c.qtd * preco
      }, 0
    )
    const custoTotal = custoConsumiveis + conteudo.custoEntrada
    
    // Receita dos drops (usa preço do market se disponível)
    const receitaDrops = conteudo.drops.reduce((acc, drop) => {
      const preco = drop.isFixed ? drop.preco : (marketPrices[drop.itemKey] || drop.preco)
      return acc + preco * drop.qtdMedia
    }, 0)
    
    const lucroRun = receitaDrops - custoTotal
    const lucroPorHora = (lucroRun / conteudo.tempoMinutos) * 60
    
    return {
      custoTotal,
      custoConsumiveis,
      receitaDrops,
      lucroRun,
      lucroPorHora,
      tempoMinutos: conteudo.tempoMinutos
    }
  }
  
  // Rankings
  const rankings = useMemo(() => {
    return CONTEUDOS_FARM.map(c => ({
      ...c,
      ...calcularLucro(c)
    })).sort((a, b) => b.lucroPorHora - a.lucroPorHora)
  }, [marketPrices])
  
  // Toggle expandir card
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }
  
  // Adicionar à rotina
  const adicionarRotina = (conteudoId: string) => {
    const existente = rotina.find(r => r.conteudoId === conteudoId)
    if (existente) {
      setRotina(rotina.map(r => 
        r.conteudoId === conteudoId 
          ? { ...r, quantidade: r.quantidade + 1 }
          : r
      ))
    } else {
      setRotina([...rotina, { conteudoId, quantidade: 1 }])
    }
    setShowRotina(true)
  }
  
  // Remover da rotina
  const removerRotina = (conteudoId: string) => {
    const existente = rotina.find(r => r.conteudoId === conteudoId)
    if (existente && existente.quantidade > 1) {
      setRotina(rotina.map(r => 
        r.conteudoId === conteudoId 
          ? { ...r, quantidade: r.quantidade - 1 }
          : r
      ))
    } else {
      setRotina(rotina.filter(r => r.conteudoId !== conteudoId))
    }
  }
  
  // Calcular rotina total
  const rotinaTotal = useMemo(() => {
    let tempoTotal = 0
    let lucroTotal = 0
    let custoTotal = 0
    
    rotina.forEach(r => {
      const conteudo = CONTEUDOS_FARM.find(c => c.id === r.conteudoId)
      if (conteudo) {
        const calc = calcularLucro(conteudo)
        tempoTotal += calc.tempoMinutos * r.quantidade
        lucroTotal += calc.lucroRun * r.quantidade
        custoTotal += calc.custoTotal * r.quantidade
      }
    })
    
    return { tempoTotal, lucroTotal, custoTotal }
  }, [rotina, marketPrices])

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-gray-900">
                <Flame className="w-8 h-8 text-orange-500" />
                Calculadora de Farm
              </h1>
              <p className="text-gray-500 mt-1">Compare lucro/hora e monte sua rotina diária</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/agenda">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agenda de Farm
                </Button>
              </Link>
            </div>
          </div>

          {/* Info de preços */}
          <Card className="p-4 bg-white border-gray-200 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Preços do Mercado</p>
                  <p className="text-xs text-gray-500">
                    {loadingPrices ? 'Carregando...' : lastUpdate 
                      ? `Atualizado em ${lastUpdate.toLocaleString('pt-BR')}`
                      : 'Usando valores padrão'}
                  </p>
                </div>
              </div>
              <button
                onClick={fetchMarketPrices}
                disabled={loadingPrices}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-500 ${loadingPrices ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </Card>
        
          {/* Top 3 Ranking */}
          <h2 className="text-lg font-semibold text-gray-900 mb-3">🏆 Top 3 Lucro/Hora</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {rankings.slice(0, 3).map((conteudo, index) => (
              <Card 
                key={conteudo.id}
                className={`p-4 bg-white shadow-sm ${getCorBorda(conteudo.cor)} border-2 relative overflow-hidden`}
              >
                {/* Badge de posição */}
                <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white ${
                  index === 0 ? 'bg-amber-500' :
                  index === 1 ? 'bg-slate-400' :
                  'bg-amber-700'
                }`}>
                  #{index + 1}
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl ${getCorBg(conteudo.cor)} flex items-center justify-center text-2xl text-white`}>
                    {conteudo.icone}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{conteudo.nome}</h3>
                    <p className="text-xs text-gray-500">{conteudo.tempoMinutos} min/run</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Lucro/hora</p>
                    <p className={`text-lg font-bold ${conteudo.lucroPorHora >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatZeny(conteudo.lucroPorHora)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => adicionarRotina(conteudo.id)}
                    className={`${getCorBg(conteudo.cor)} text-white hover:opacity-90`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        
          {/* Lista de todos os conteúdos */}
          <h2 className="text-lg font-semibold text-gray-900 mb-3">📋 Todos os Conteúdos</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {CONTEUDOS_FARM.map(conteudo => {
              const calc = calcularLucro(conteudo)
              const isExpanded = expandedCards.has(conteudo.id)
              
              return (
                <Card 
                  key={conteudo.id}
                  className={`bg-white shadow-sm ${getCorBorda(conteudo.cor)} border transition-all`}
                >
                  {/* Header do card */}
                  <div 
                    className="p-4 cursor-pointer flex items-center gap-4"
                    onClick={() => toggleExpand(conteudo.id)}
                  >
                    <div className={`w-14 h-14 rounded-xl ${getCorBg(conteudo.cor)} flex items-center justify-center text-3xl text-white shrink-0`}>
                      {conteudo.icone}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{conteudo.nome}</h3>
                        {conteudo.fadigaMaxima && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                            {conteudo.fadigaMaxima.toLocaleString()} fadiga
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          {conteudo.tempoMinutos}min
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Coins className="w-3 h-3" />
                          {formatZeny(calc.custoTotal)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500">Lucro/hora</p>
                      <p className={`text-lg font-bold ${calc.lucroPorHora >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatZeny(calc.lucroPorHora)}
                      </p>
                    </div>
                    
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                  
                  {/* Detalhes expandidos */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {/* Custos */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <Minus className="w-4 h-4 text-red-500" />
                            Custos
                          </h4>
                          <div className="space-y-1 text-sm">
                            {conteudo.custoEntrada > 0 && (
                              <div className="flex justify-between text-gray-600">
                                <span>Entrada</span>
                                <span>{formatZeny(conteudo.custoEntrada)}</span>
                              </div>
                            )}
                            {conteudo.consumiveis.map(c => {
                              const preco = marketPrices[c.itemKey] || c.preco
                              return (
                                <div key={c.nome} className="flex justify-between text-gray-600">
                                  <span>{c.nome} x{c.qtd}</span>
                                  <span>{formatZeny(c.qtd * preco)}</span>
                                </div>
                              )
                            })}
                            <div className="flex justify-between font-medium text-red-600 pt-1 border-t border-gray-200">
                              <span>Total</span>
                              <span>{formatZeny(calc.custoTotal)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Drops */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <Plus className="w-4 h-4 text-emerald-500" />
                            Receita Estimada
                          </h4>
                          <div className="space-y-1 text-sm">
                            {conteudo.drops.map(d => {
                              const preco = d.isFixed ? d.preco : (marketPrices[d.itemKey] || d.preco)
                              return (
                                <div key={d.nome} className="flex justify-between text-gray-600">
                                  <span>{d.nome} x{d.qtdMedia}</span>
                                  <span>{formatZeny(preco * d.qtdMedia)}</span>
                                </div>
                              )
                            })}
                            <div className="flex justify-between font-medium text-emerald-600 pt-1 border-t border-gray-200">
                              <span>Total</span>
                              <span>{formatZeny(calc.receitaDrops)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lucro por run */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Lucro por Run</span>
                        <span className={`text-lg font-bold ${calc.lucroRun >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {calc.lucroRun >= 0 ? '+' : ''}{formatZeny(calc.lucroRun)}
                        </span>
                      </div>
                      
                      {/* Dica */}
                      {conteudo.dicas && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                          💡 {conteudo.dicas}
                        </div>
                      )}
                      
                      {/* Botão adicionar */}
                      <Button
                        onClick={() => adicionarRotina(conteudo.id)}
                        className={`w-full mt-4 ${getCorBg(conteudo.cor)} text-white hover:opacity-90`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar à Rotina
                      </Button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        
          {/* Rotina Diária */}
          {showRotina && (
            <Card className="p-6 bg-white shadow-sm border-amber-200 border-2 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Sua Rotina Diária
                </h2>
                <div className="flex gap-2">
                  {rotina.length > 0 && (
                    <>
                      <Link href="/agenda">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Salvar na Agenda
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setRotina([])}
                      >
                        Limpar
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {rotina.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Adicione conteúdos para montar sua rotina
                </p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {rotina.map(r => {
                      const conteudo = CONTEUDOS_FARM.find(c => c.id === r.conteudoId)
                      if (!conteudo) return null
                      const calc = calcularLucro(conteudo)
                      
                      return (
                        <div 
                          key={r.conteudoId}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className={`w-10 h-10 rounded-lg ${getCorBg(conteudo.cor)} flex items-center justify-center text-xl text-white`}>
                            {conteudo.icone}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{conteudo.nome}</p>
                            <p className="text-xs text-gray-500">
                              {conteudo.tempoMinutos * r.quantidade}min total
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removerRotina(conteudo.id)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900">{r.quantidade}x</span>
                            <button
                              onClick={() => adicionarRotina(conteudo.id)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="text-right ml-4">
                            <p className="text-sm text-emerald-600 font-medium">
                              +{formatZeny(calc.lucroRun * r.quantidade)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Totais */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Tempo Total</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.floor(rotinaTotal.tempoTotal / 60)}h {rotinaTotal.tempoTotal % 60}min
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Custo Total</p>
                      <p className="text-lg font-bold text-red-600">
                        -{formatZeny(rotinaTotal.custoTotal)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Lucro Estimado</p>
                      <p className={`text-xl font-bold ${rotinaTotal.lucroTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {rotinaTotal.lucroTotal >= 0 ? '+' : ''}{formatZeny(rotinaTotal.lucroTotal)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </Card>
          )}
        
          {/* Disclaimer */}
          <div className="text-center text-gray-500 text-sm">
            <p>⚠️ Valores são estimativas baseadas em médias.</p>
            <p>Resultados reais podem variar com lucky drops (cartas, etc).</p>
          </div>
        </div>
      </div>
    </ToolsLayout>
  )
}
