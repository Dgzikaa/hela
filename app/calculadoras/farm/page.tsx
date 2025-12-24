'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/app/components/Card'
import { Button } from '@/app/components/Button'
import { ToolsLayout } from '@/app/components/ToolsLayout'
import { 
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
  DollarSign,
  Settings,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

// Taxa de conversão: 1kk = R$ 0,32
const TAXA_REAIS_POR_KK = 0.32

// Interface para itens do market
interface MarketPrice {
  item_key: string
  item_name: string
  price: number
  preco_manual?: number
  updated_at: string
}

// Interfaces para conteúdos de farm
interface ItemFarm {
  nome: string
  itemKey: string // Chave para buscar no market_prices
  qtd: number
  duracao?: string
  nota?: string
}

interface DropFarm {
  nome: string
  itemKey?: string
  qtdMedia: number
  precoNpc?: number // Preço fixo do NPC (não vem do market)
}

interface ConteudoFarm {
  id: string
  nome: string
  icone: string
  cor: string
  fadigaMaxima: number | null
  tempoMinutos: number
  consumiveis: ItemFarm[]
  drops: DropFarm[]
  dicas: string
}

// Configuração dos conteúdos de farm
// Os preços vêm do banco de dados (market_prices)
const CONTEUDOS_FARM: ConteudoFarm[] = [
  {
    id: 'bio5',
    nome: 'Bio 5',
    icone: '🧬',
    cor: 'emerald',
    fadigaMaxima: 4500,
    tempoMinutos: 150, // 2h30
    consumiveis: [
      // Buffs de tempo (para 2h30 = 150min)
      { nome: 'Poção de Furor Físico', itemKey: 'pocao_furor_fisico', qtd: 30, duracao: '5min' },
      { nome: 'Poção Grande de HP', itemKey: 'pocao_grande_hp', qtd: 18, duracao: '500s' },
      { nome: 'Poção Grande de SP', itemKey: 'pocao_grande_sp', qtd: 18, duracao: '500s' },
      { nome: 'Salada de Frutas Tropicais', itemKey: 'salada_frutas_tropicais', qtd: 30, duracao: '5min' },
      { nome: 'Biscoito Natalino', itemKey: 'biscoito_natalino', qtd: 15, duracao: '10min' },
      { nome: 'Suco de Gato', itemKey: 'suco_gato', qtd: 15, duracao: '10min' },
      { nome: 'Cozido Imortal', itemKey: 'cozido_imortal', qtd: 30, duracao: '5min' },
      { nome: 'Benção de Tyr', itemKey: 'bencao_tyr', qtd: 30, duracao: '5min' },
      { nome: 'Suco Celular Enriquecido', itemKey: 'suco_celular_enriquecido', qtd: 15, duracao: '10min' },
      { nome: 'Ativador de Erva Vermelha', itemKey: 'ativador_erva_vermelha', qtd: 15, duracao: '10min' },
      // Consumíveis por uso
      { nome: 'Poção Dourada Concentrada', itemKey: 'pocao_dourada_concentrada', qtd: 200 },
      { nome: 'Poção Branca', itemKey: 'pocao_branca', qtd: 500 },
      { nome: 'Poção Azul Concentrada', itemKey: 'pocao_azul_concentrada', qtd: 300 },
      { nome: 'Amuleto de Ziegfried', itemKey: 'amuleto_ziegfried', qtd: 30 },
      // Gomas (5x gomas de 30min = 1/3 caixa)
      { nome: 'Goma de Bolha (5x)', itemKey: 'goma_bolha', qtd: 5, nota: '5 gomas de 30min' },
    ],
    drops: [
      { nome: 'Âmagos', itemKey: 'amago', qtdMedia: 15 },
      { nome: 'Loot NPC', qtdMedia: 1, precoNpc: 1500000 },
    ],
    dicas: 'Farm principal. 2h30 por run, 4.500 mobs de fadiga. Entrada: 2 Alma Condensada.'
  },
  {
    id: 'expedicao',
    nome: 'Expedição',
    icone: '🎯',
    cor: 'cyan',
    fadigaMaxima: null,
    tempoMinutos: 90, // 1h30 máximo
    consumiveis: [
      // Pós de Meteorita (custo dos compêndios)
      { nome: 'Pó Meteorita Oceânica (3 comp)', itemKey: 'po_meteorita_oceanica', qtd: 36, nota: '12 cada' },
      { nome: 'Pó Meteorita Escarlate (3 comp)', itemKey: 'po_meteorita_escarlate', qtd: 36, nota: '12 cada' },
      { nome: 'Pó Meteorita Solar (3 comp)', itemKey: 'po_meteorita_solar', qtd: 12, nota: '4 cada' },
      { nome: 'Pó Meteorita Celeste (3 comp)', itemKey: 'po_meteorita_celeste', qtd: 36, nota: '12 cada' },
      // Entrada
      { nome: 'Âmagos Sombrios (entrada)', itemKey: 'amago_sombrio', qtd: 250 },
      // Mesmos consumíveis da Bio5
      { nome: 'Poção Dourada Concentrada', itemKey: 'pocao_dourada_concentrada', qtd: 200 },
      { nome: 'Poção Branca', itemKey: 'pocao_branca', qtd: 500 },
      { nome: 'Poção Azul Concentrada', itemKey: 'pocao_azul_concentrada', qtd: 300 },
    ],
    drops: [
      { nome: 'Pó de Meteorita (variado)', itemKey: 'po_meteorita_escarlate', qtdMedia: 20 },
      { nome: 'Loot NPC', qtdMedia: 1, precoNpc: 500000 },
    ],
    dicas: 'Entrada: 250 Âmagos Sombrios. Usa compêndios (pós de meteorita).'
  },
  {
    id: 'verus',
    nome: 'Verus',
    icone: '⚔️',
    cor: 'purple',
    fadigaMaxima: 4500,
    tempoMinutos: 30,
    consumiveis: [
      { nome: 'Suco de Gato', itemKey: 'suco_gato', qtd: 3, duracao: '10min' },
      { nome: 'Pergaminho do Éden', itemKey: 'pergaminho_eden', qtd: 1 },
      { nome: 'Poção Branca', itemKey: 'pocao_branca', qtd: 30 },
      { nome: 'Poção Dourada Concentrada', itemKey: 'pocao_dourada_concentrada', qtd: 2 },
      { nome: 'Poção Azul Concentrada', itemKey: 'pocao_azul_concentrada', qtd: 20 },
    ],
    drops: [
      // ~1.130 itens x 9k cada = ~10.17M
      { nome: 'Giroparafuso Rígido (~1.130)', itemKey: 'verus_drop', qtdMedia: 1130, precoNpc: 9000 },
    ],
    dicas: 'Rápido e barato. 4.500 mobs de fadiga, ~30 min.'
  },
  {
    id: 'cheffenia',
    nome: 'Cheffenia',
    icone: '👼',
    cor: 'sky',
    fadigaMaxima: 1000,
    tempoMinutos: 40,
    consumiveis: [
      { nome: 'Suco de Gato', itemKey: 'suco_gato', qtd: 4, duracao: '10min' },
      { nome: 'Pergaminho do Éden', itemKey: 'pergaminho_eden', qtd: 1 },
      { nome: 'Poção Branca', itemKey: 'pocao_branca', qtd: 200 },
      { nome: 'Poção Dourada Concentrada', itemKey: 'pocao_dourada_concentrada', qtd: 10 },
      { nome: 'Poção Azul Concentrada', itemKey: 'pocao_azul_concentrada', qtd: 80 },
      { nome: 'Goma de Bolha (2x)', itemKey: 'goma_bolha', qtd: 2, nota: '2 gomas max' },
    ],
    drops: [
      // ~120 itens x 150k cada = ~18M (preço NPC)
      { nome: 'Fragment of Rossata Stone (~120)', itemKey: 'rossata_stone', qtdMedia: 120, precoNpc: 150000 },
    ],
    dicas: '1.000 mobs de fadiga. Usa 2 gomas. ~40 min.'
  },
  {
    id: 'thanatos',
    nome: 'Maldição de Thanatos',
    icone: '💀',
    cor: 'red',
    fadigaMaxima: null,
    tempoMinutos: 60,
    consumiveis: [
      { nome: 'Poção Árvore Envenenada Diluída', itemKey: 'pocao_arvore_envenenada', qtd: 1, nota: '1 item = 2 poções' },
      { nome: 'Poção Branca', itemKey: 'pocao_branca', qtd: 500 },
      { nome: 'Poção Dourada Concentrada', itemKey: 'pocao_dourada_concentrada', qtd: 150 },
      { nome: 'Poção Azul Concentrada', itemKey: 'pocao_azul_concentrada', qtd: 200 },
    ],
    drops: [
      // ~150 fragmentos líquidos (220 - 50 craft)
      { nome: 'Fragmento Maldição (~150)', itemKey: 'fragmento_maldicao', qtdMedia: 150 },
      // ~10% chance do item raro
      { nome: 'Essência Thanatos (10%)', itemKey: 'essencia_thanatos', qtdMedia: 0.1 },
    ],
    dicas: 'Principal farm! Usa 50 frags pra craft. Chance de Essência.'
  },
]

const formatZeny = (value: number): string => {
  if (value >= 1000000000) return (value / 1000000000).toFixed(2) + 'B'
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
  return value.toLocaleString('pt-BR')
}

const formatReais = (zeny: number): string => {
  const reais = (zeny / 1000000) * TAXA_REAIS_POR_KK
  return `R$ ${reais.toFixed(2)}`
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

export default function FarmCalculadoraPage() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [rotina, setRotina] = useState<Rotina[]>([])
  const [showRotina, setShowRotina] = useState(false)
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({})
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [syncingPrices, setSyncingPrices] = useState(false)
  const [missingItems, setMissingItems] = useState<string[]>([])
  
  useEffect(() => {
    fetchMarketPrices()
  }, [])

  const fetchMarketPrices = async () => {
    setLoadingPrices(true)
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/market_prices?select=item_key,item_name,price,preco_manual,updated_at`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })
      
      if (response.ok) {
        const prices: MarketPrice[] = await response.json()
        const priceMap: Record<string, number> = {}
        
        prices.forEach((p) => {
          // Prioridade: preço manual > preço do market
          const finalPrice = (p.preco_manual && p.preco_manual > 0) ? p.preco_manual : p.price
          priceMap[p.item_key] = finalPrice
        })
        
        setMarketPrices(priceMap)
        
        // Encontrar itens que faltam no banco
        const allItemKeys = new Set<string>()
        CONTEUDOS_FARM.forEach(c => {
          c.consumiveis.forEach(item => allItemKeys.add(item.itemKey))
          c.drops.forEach(drop => { if (drop.itemKey) allItemKeys.add(drop.itemKey) })
        })
        
        const missing = Array.from(allItemKeys).filter(key => !priceMap[key] || priceMap[key] === 0)
        setMissingItems(missing)
        
        if (prices.length > 0) {
          const latestDate = new Date(Math.max(...prices.map(p => new Date(p.updated_at).getTime())))
          setLastUpdate(latestDate)
        }
      }
    } catch (err) {
      console.error('Erro ao buscar preços:', err)
    } finally {
      setLoadingPrices(false)
    }
  }

  const syncPrices = async () => {
    setSyncingPrices(true)
    try {
      const response = await fetch('/api/sync-prices', { method: 'POST' })
      if (response.ok) {
        await fetchMarketPrices()
      }
    } catch (err) {
      console.error('Erro ao sincronizar:', err)
    } finally {
      setSyncingPrices(false)
    }
  }

  // Pega o preço de um item do market
  const getPreco = (itemKey: string, precoNpc?: number): number => {
    if (precoNpc) return precoNpc // Preço NPC fixo
    return marketPrices[itemKey] || 0
  }

  // Calcula lucro de um conteúdo
  const calcularLucro = (conteudo: ConteudoFarm) => {
    // Custo total dos consumíveis
    const custoConsumiveis = conteudo.consumiveis.reduce((acc, item) => {
      const preco = getPreco(item.itemKey)
      return acc + (preco * item.qtd)
    }, 0)
    
    // Receita dos drops
    const receitaDrops = conteudo.drops.reduce((acc, drop) => {
      const preco = drop.precoNpc || getPreco(drop.itemKey || '')
      return acc + (preco * drop.qtdMedia)
    }, 0)
    
    const lucroRun = receitaDrops - custoConsumiveis
    const lucroPorHora = conteudo.tempoMinutos > 0 ? (lucroRun / conteudo.tempoMinutos) * 60 : 0
    
    return {
      custoTotal: custoConsumiveis,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    return { 
      tempoTotal, 
      lucroTotal, 
      custoTotal,
      lucroSemanal: lucroTotal * 7,
      lucroMensal: lucroTotal * 30,
      reaisDia: (lucroTotal / 1000000) * TAXA_REAIS_POR_KK,
      reaisSemana: (lucroTotal * 7 / 1000000) * TAXA_REAIS_POR_KK,
      reaisMes: (lucroTotal * 30 / 1000000) * TAXA_REAIS_POR_KK
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <Link href="/config-farm">
                <Button variant="secondary" className="border-gray-300">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Preços
                </Button>
              </Link>
              <Link href="/agenda">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agenda de Farm
                </Button>
              </Link>
            </div>
          </div>

          {/* Alerta de itens faltando */}
          {missingItems.length > 0 && (
            <Card className="p-4 bg-amber-50 border-amber-200 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-800">
                    {missingItems.length} item(s) sem preço no market
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Sincronize os preços ou configure manualmente: {missingItems.slice(0, 5).join(', ')}
                    {missingItems.length > 5 && ` e mais ${missingItems.length - 5}...`}
                  </p>
                </div>
                <Link href="/config-farm">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    Configurar
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Info de preços e conversão */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Preços do Market</p>
                    <p className="text-xs text-gray-500">
                      {loadingPrices ? 'Carregando...' : lastUpdate 
                        ? `Atualizado em ${lastUpdate.toLocaleString('pt-BR')}`
                        : 'Clique para sincronizar'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={syncPrices}
                  disabled={syncingPrices || loadingPrices}
                  className="px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors flex items-center gap-2 text-purple-700 text-sm font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${syncingPrices ? 'animate-spin' : ''}`} />
                  {syncingPrices ? 'Sincronizando...' : 'Atualizar'}
                </button>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Taxa de Conversão</p>
                  <p className="text-xs text-gray-600">
                    1 KK = R$ {TAXA_REAIS_POR_KK.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        
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
                
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Lucro/hora</span>
                    <span className={`text-lg font-bold ${conteudo.lucroPorHora >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatZeny(conteudo.lucroPorHora)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">≈ R$/hora</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatReais(conteudo.lucroPorHora)}
                    </span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => adicionarRotina(conteudo.id)}
                  className={`w-full ${getCorBg(conteudo.cor)} text-white hover:opacity-90`}
                >
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
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
                            {conteudo.fadigaMaxima.toLocaleString()} mobs
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          {conteudo.tempoMinutos}min
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <Coins className="w-3 h-3" />
                          -{formatZeny(calc.custoTotal)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500">Lucro/run</p>
                      <p className={`text-lg font-bold ${calc.lucroRun >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {calc.lucroRun >= 0 ? '+' : ''}{formatZeny(calc.lucroRun)}
                      </p>
                      <p className="text-xs text-green-600">{formatReais(calc.lucroRun)}</p>
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
                          <div className="space-y-1 text-xs max-h-48 overflow-y-auto">
                            {conteudo.consumiveis.map(item => {
                              const preco = getPreco(item.itemKey)
                              const total = preco * item.qtd
                              const semPreco = preco === 0
                              return (
                                <div 
                                  key={item.nome} 
                                  className={`flex justify-between ${semPreco ? 'text-amber-600' : 'text-gray-600'}`}
                                  title={item.nota || item.nome}
                                >
                                  <span className="truncate pr-2">
                                    {item.nome} x{item.qtd}
                                    {semPreco && ' ⚠️'}
                                  </span>
                                  <span className="shrink-0">{formatZeny(total)}</span>
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
                          <div className="space-y-1 text-xs">
                            {conteudo.drops.map(drop => {
                              const preco = drop.precoNpc || getPreco(drop.itemKey || '')
                              const total = preco * drop.qtdMedia
                              const isNpc = !!drop.precoNpc
                              return (
                                <div key={drop.nome} className="flex justify-between text-gray-600">
                                  <span className="truncate pr-2">
                                    {drop.nome}
                                    {isNpc && <span className="text-amber-600 ml-1">(NPC)</span>}
                                  </span>
                                  <span className="shrink-0">{formatZeny(total)}</span>
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
                      
                      {/* Lucro e conversão */}
                      <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500">Lucro por Run</span>
                          <p className={`text-lg font-bold ${calc.lucroRun >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {calc.lucroRun >= 0 ? '+' : ''}{formatZeny(calc.lucroRun)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">≈ em Reais</span>
                          <p className="text-lg font-bold text-green-600">
                            {formatReais(calc.lucroRun)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Dica */}
                      {conteudo.dicas && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
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
                            <p className="text-xs text-green-600">
                              {formatReais(calc.lucroRun * r.quantidade)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Totais com projeção */}
                  <div className="space-y-4">
                    {/* Resumo diário */}
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
                        <p className="text-xs text-gray-500">Lucro/Dia</p>
                        <p className={`text-xl font-bold ${rotinaTotal.lucroTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {rotinaTotal.lucroTotal >= 0 ? '+' : ''}{formatZeny(rotinaTotal.lucroTotal)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Projeção em R$ */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Por Dia</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {rotinaTotal.reaisDia.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Por Semana</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {rotinaTotal.reaisSemana.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">({formatZeny(rotinaTotal.lucroSemanal)})</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Por Mês</p>
                        <p className="text-xl font-bold text-green-600">
                          R$ {rotinaTotal.reaisMes.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">({formatZeny(rotinaTotal.lucroMensal)})</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          )}
        
          {/* Disclaimer */}
          <div className="text-center text-gray-500 text-sm">
            <p>⚠️ Valores são estimativas baseadas em médias e preços do market.</p>
            <p>Taxa: 1 KK = R$ {TAXA_REAIS_POR_KK.toFixed(2)} | Resultados reais podem variar.</p>
            <p className="mt-2">
              <Link href="/config-farm" className="text-blue-600 hover:underline">
                Configure os preços dos itens →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </ToolsLayout>
  )
}
