'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '../components/Card'
import { ArrowLeft, Calculator, Gem, FlaskConical, RefreshCw, Loader2, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'
import Link from 'next/link'

// IDs dos itens do mercado
const ITEM_IDS = {
  // Pós de Meteorita
  poEscarlate: 1000398,
  poSolar: 1000399,
  poVerdejante: 1000400,
  poCeleste: 1000401,
  poOceanica: 1000402,
  poCrepuscular: 1000403,
  // Almas
  almaSombria: 25986,
  // Itens dos tesouros
  bencaoFerreiro: 6226,
  bencaoMestreFerreiro: 6225,
  desmembrador: 1000389,
}

// RUNAS SOMATOLÓGICAS - IDs e nomes corretos
const RUNAS = [
  { id: 17917, name: 'Runa Ruby da Celia' },
  { id: 17918, name: 'Runa Ruby da Gertie' },
  { id: 17919, name: 'Runa Ruby do Alphoccio' },
  { id: 17920, name: 'Runa Ruby da Tretini' },
  { id: 17921, name: 'Runa Ruby do Randel' },
  { id: 17922, name: 'Runa Safira da Celia' },
  { id: 17923, name: 'Runa Safira da Gertie' },
  { id: 17924, name: 'Runa Safira do Alphoccio' },
  { id: 17925, name: 'Runa Safira do Flamel' },
  { id: 17926, name: 'Runa Safira da Tretini' },
  { id: 17927, name: 'Runa Topazio da Celia' },
  { id: 17928, name: 'Runa Topazio da Gertie' },
  { id: 17929, name: 'Runa Topazio do Chen' },
  { id: 17930, name: 'Runa Topazio da Tretini' },
  { id: 17931, name: 'Runa Topazio do Alphoccio' },
  { id: 17932, name: 'Runa Ametista do Alphoccio' },
  { id: 17933, name: 'Runa Ametista do Randel' },
  { id: 17934, name: 'Runa Ametista do Chen' },
  { id: 17935, name: 'Runa Ametista do Flamel' },
  { id: 17936, name: 'Runa Ametista da Gertie' },
  { id: 17937, name: 'Runa Jade do Alphoccio' },
  { id: 17938, name: 'Runa Jade do Chen' },
  { id: 17939, name: 'Runa Jade do Flamel' },
  { id: 17940, name: 'Runa Jade da Tretini' },
  { id: 17941, name: 'Runa Jade da Gertie' },
  { id: 17942, name: 'Runa Citrina do Alphoccio' },
  { id: 17943, name: 'Runa Citrina do Randel' },
  { id: 17944, name: 'Runa Citrina do Chen' },
  { id: 17945, name: 'Runa Citrina da Gertie' },
  { id: 17946, name: 'Runa Citrina do Flamel' },
]

// Itens >1B (valores estimados - não vendem no market)
const FIXED_PRICES: Record<string, number> = {
  espiritoPoderoso: 2200000000,
  espiritoLigeiro: 2200000000,
  espiritoAstuto: 2800000000,
  talismaYinYang: 1000000000,
  orbeYokai: 2000000000,
  garraPrata: 2000000000,
  caixaForcaExp: 3500000000,
}

// Itens da Caixa de Somatologia - buscar do market
const CAIXA_SOMATOLOGIA_ITEMS = [
  { id: 19439, name: 'Aura da Mente Corrompida', key: 'auraMente' },
  { id: 20986, name: 'Manto Abstrato', key: 'mantoAbstrato' },
  { id: 540042, name: 'Livro Perverso', key: 'livroPerverso' },
  { id: 1837, name: 'Garra de Ferro', key: 'garraFerro' },
  { id: 28767, name: 'Jack Estripadora', key: 'jackEstripadora' },
  { id: 5985, name: 'Máscara da Nobreza', key: 'mascaraNobreza' },
  { id: 18752, name: 'Livro Amaldiçoado', key: 'livroAmaldicoado' },
  { id: 19379, name: 'Quepe do General', key: 'quepeGeneral' },
  { id: 5905, name: 'Chapéu de Maestro', key: 'chapeuMaestro' },
  // Couraça de Senshi = vale nada (não incluir)
]

// Dados dos Tesouros
// Drops: 100% compêndios + 1 roll (12% nada, 70% desmembrador, 10% bênção, 5% mestre, 2% raro, 1% caixa)
const TREASURES = {
  escarlate: {
    name: "Tesouro Escarlate",
    costItemKey: 'poEscarlate',
    costAmount: 100,
    guaranteed: { name: "Compêndios (4x)", quantity: 4, fixedPrice: 500000 },
    extras: [
      { name: "Nada extra", chance: 12, quantity: 0, fixedPrice: 0 },
      { name: "Desmembrador", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Espírito Poderoso", chance: 2, quantity: 1, fixedKey: 'espiritoPoderoso' },
      { name: "Caixa Força Exp.", chance: 1, quantity: 1, fixedKey: 'caixaForcaExp' }
    ]
  },
  solar: {
    name: "Tesouro Solar",
    costItemKey: 'poSolar',
    costAmount: 100,
    guaranteed: { name: "Compêndios (4x)", quantity: 4, fixedPrice: 500000 },
    extras: [
      { name: "Nada extra", chance: 12, quantity: 0, fixedPrice: 0 },
      { name: "Desmembrador", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Talismã Yin Yang", chance: 2, quantity: 1, fixedKey: 'talismaYinYang' },
      { name: "Caixa Força Exp.", chance: 1, quantity: 1, fixedKey: 'caixaForcaExp' }
    ]
  },
  verdejante: {
    name: "Tesouro Verdejante",
    costItemKey: 'poVerdejante',
    costAmount: 100,
    guaranteed: { name: "Compêndios (4x)", quantity: 4, fixedPrice: 500000 },
    extras: [
      { name: "Nada extra", chance: 12, quantity: 0, fixedPrice: 0 },
      { name: "Desmembrador", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Orbe de Yokai", chance: 2, quantity: 1, fixedKey: 'orbeYokai' },
      { name: "Caixa Força Exp.", chance: 1, quantity: 1, fixedKey: 'caixaForcaExp' }
    ]
  },
  celeste: {
    name: "Tesouro Celeste",
    costItemKey: 'poCeleste',
    costAmount: 100,
    guaranteed: { name: "Compêndios (4x)", quantity: 4, fixedPrice: 500000 },
    extras: [
      { name: "Nada extra", chance: 12, quantity: 0, fixedPrice: 0 },
      { name: "Desmembrador", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Garra de Prata", chance: 2, quantity: 1, fixedKey: 'garraPrata' },
      { name: "Caixa Força Exp.", chance: 1, quantity: 1, fixedKey: 'caixaForcaExp' }
    ]
  },
  oceanico: {
    name: "Tesouro Oceânico",
    costItemKey: 'poOceanica',
    costAmount: 100,
    guaranteed: { name: "Compêndios (4x)", quantity: 4, fixedPrice: 500000 },
    extras: [
      { name: "Nada extra", chance: 13, quantity: 0, fixedPrice: 0 }, // 13% pois não tem caixa
      { name: "Desmembrador", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Espírito Astuto", chance: 2, quantity: 1, fixedKey: 'espiritoAstuto' }
    ]
  },
  crepuscular: {
    name: "Tesouro Crepuscular",
    costItemKey: 'poCrepuscular',
    costAmount: 100,
    guaranteed: { name: "Compêndios (4x)", quantity: 4, fixedPrice: 500000 },
    extras: [
      { name: "Nada extra", chance: 12, quantity: 0, fixedPrice: 0 },
      { name: "Desmembrador", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Espírito Ligeiro", chance: 2, quantity: 1, fixedKey: 'espiritoLigeiro' },
      { name: "Caixa Força Exp.", chance: 1, quantity: 1, fixedKey: 'caixaForcaExp' }
    ]
  }
}

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

function formatZeny(value: number): string {
  if (value >= 1000000000) return (value / 1000000000).toFixed(2) + 'B'
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return Math.round(value / 1000) + 'K'
  return value.toLocaleString('pt-BR')
}

// Busca preços do Supabase
async function fetchPricesFromSupabase(): Promise<Record<string, number>> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/market_prices?select=item_key,price`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
    if (!response.ok) return {}
    const data = await response.json()
    const prices: Record<string, number> = {}
    data.forEach((item: any) => {
      if (item.price > 0) prices[item.item_key] = item.price
    })
    return prices
  } catch {
    return {}
  }
}

// Busca runas do Supabase
async function fetchRunasFromSupabase(): Promise<RunaPrice[]> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/runa_prices?select=runa_id,runa_name,price,sellers&order=price.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.filter((r: any) => r.price > 0).map((r: any) => ({
      id: r.runa_id,
      name: r.runa_name,
      price: r.price,
      sellers: r.sellers || 0
    }))
  } catch {
    return []
  }
}

// Busca última atualização
async function fetchLastUpdate(): Promise<Date | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/market_prices?select=updated_at&order=updated_at.desc&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
    if (!response.ok) return null
    const data = await response.json()
    if (data.length > 0) return new Date(data[0].updated_at)
    return null
  } catch {
    return null
  }
}

interface RunaPrice {
  id: number
  name: string
  price: number
  sellers: number
}

export default function CalculadoraPage() {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [runaPrices, setRunaPrices] = useState<RunaPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<'expedicao' | 'somatologia'>('expedicao')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [showRunas, setShowRunas] = useState(false)
  const [simCount, setSimCount] = useState(10)

  // Busca TODOS os preços do Supabase
  const fetchAllPrices = useCallback(async () => {
    setLoading(true)
    setLoadingMessage('Buscando preços do Supabase...')
    
    const supabasePrices = await fetchPricesFromSupabase()
    const supabaseRunas = await fetchRunasFromSupabase()
    const lastUpd = await fetchLastUpdate()
    
    if (Object.keys(supabasePrices).length > 0) {
      // Calcula média das runas
      if (supabaseRunas.length > 0) {
        supabasePrices['avgRuna'] = Math.round(supabaseRunas.reduce((a, b) => a + b.price, 0) / supabaseRunas.length)
      }
      
      // Calcula média da caixa de somatologia
      const caixaKeys = ['auraMente', 'mantoAbstrato', 'livroPerverso', 'garraFerro', 'jackEstripadora', 'mascaraNobreza', 'livroAmaldicoado', 'quepeGeneral', 'chapeuMaestro']
      const caixaPrices = caixaKeys.map(k => supabasePrices[k]).filter(p => p > 0)
      if (caixaPrices.length > 0) {
        supabasePrices['avgCaixaSomatologia'] = Math.round(caixaPrices.reduce((a, b) => a + b, 0) / caixaPrices.length)
      }
      
      setPrices(supabasePrices)
      setRunaPrices(supabaseRunas)
      if (lastUpd) setLastUpdate(lastUpd)
      console.log('✅ Preços carregados do Supabase:', Object.keys(supabasePrices).length, 'itens')
    } else {
      console.log('⚠️ Nenhum preço encontrado no Supabase')
    }
    
    setLoading(false)
    setLoadingMessage('')
  }, [])

  // Carrega do Supabase automaticamente
  useEffect(() => {
    fetchAllPrices()
  }, [fetchAllPrices])

  // Calcula tesouros
  // 100% compêndios + 1 roll para extras (12% nada, 70% desmembrador, etc)
  const calculateTreasureResults = () => {
    const results: Record<string, any> = {}

    for (const [key, treasure] of Object.entries(TREASURES)) {
      const costPerUnit = prices[treasure.costItemKey] || 0
      const totalCost = costPerUnit * treasure.costAmount

      // Valor garantido dos compêndios
      const guaranteedValue = treasure.guaranteed.quantity * treasure.guaranteed.fixedPrice
      
      // Valor esperado dos extras (1 roll)
      let extrasExpectedValue = 0
      const extraDetails = treasure.extras.map(extra => {
        let price = 0
        if (extra.fixedPrice !== undefined) price = extra.fixedPrice
        else if (extra.fixedKey) price = FIXED_PRICES[extra.fixedKey] || 0
        else if (extra.priceKey) price = prices[extra.priceKey] || 0
        
        const dropValue = (extra.chance / 100) * price * extra.quantity
        extrasExpectedValue += dropValue
        return { ...extra, price, expectedValue: dropValue }
      })

      const expectedValue = guaranteedValue + extrasExpectedValue

      results[key] = {
        name: treasure.name,
        totalCost,
        guaranteedValue,
        extrasExpectedValue,
        expectedValue,
        profit: expectedValue - totalCost,
        isWorthIt: expectedValue > totalCost,
        guaranteed: treasure.guaranteed,
        extras: extraDetails.filter(e => e.name !== 'Nada extra')
      }
    }

    return results
  }

  // Calcula somatologia
  // Drops: 100% runa + (10% caixa OU 1% aura - mutuamente exclusivos)
  // 89% = só runa | 10% = runa + caixa | 1% = runa + aura
  const calculateSomatologyResult = () => {
    const almaCost = prices.almaSombria || 9500
    const totalCost = almaCost * 9990
    const avgRuna = prices.avgRuna || 15000000
    const avgCaixaSomatologia = prices.avgCaixaSomatologia || 500000000
    const auraMente = prices.auraMente || 5000000000
    
    // 100% runa sempre
    // + 10% chance de caixa (exclusivo com aura)
    // + 1% chance de aura (exclusivo com caixa)
    // Total extra: 10% + 1% = 11%, mas são mutuamente exclusivos
    let expectedValue = avgRuna
    expectedValue += 0.10 * avgCaixaSomatologia // 10% caixa
    expectedValue += 0.01 * auraMente // 1% aura (no lugar da caixa quando acontece)

    return {
      almaCost,
      totalCost,
      avgRuna,
      avgCaixaSomatologia,
      auraMente,
      expectedValue,
      profit: expectedValue - totalCost,
      profitPercent: totalCost > 0 ? ((expectedValue / totalCost) - 1) * 100 : 0,
      isWorthIt: expectedValue > totalCost
    }
  }

  // SIMULADOR - Análise estatística de N tiradas
  // Drops: 89% só runa | 10% runa+caixa | 1% runa+aura (mutuamente exclusivos)
  const calculateSimulation = (count: number) => {
    const result = calculateSomatologyResult()
    const totalCost = result.totalCost * count
    const expectedReturn = result.expectedValue * count
    const expectedProfit = expectedReturn - totalCost
    
    // Chances de drops extras em N tiradas (mutuamente exclusivos)
    // 89% nada extra, 10% caixa, 1% aura
    const chanceAlgumExtra = 1 - Math.pow(0.89, count) // Chance de pelo menos 1 extra (caixa ou aura)
    const chanceCaixa = 1 - Math.pow(0.90, count) // Chance de pelo menos 1 caixa
    const chanceAura = 1 - Math.pow(0.99, count) // Chance de pelo menos 1 aura
    const expectedCaixas = count * 0.10 // Número esperado de caixas
    const expectedAuras = count * 0.01 // Número esperado de auras
    
    // Análise de risco
    let riskLevel: 'alto' | 'medio' | 'baixo'
    let recommendation: string
    
    if (count < 10) {
      riskLevel = 'alto'
      recommendation = 'Muito arriscado! Com poucas tiradas, você depende muito da sorte. 89% de chance de não dropar nada extra.'
    } else if (count < 50) {
      riskLevel = 'medio'
      recommendation = 'Risco moderado. Boa chance de pelo menos 1 caixa, mas aura ainda é sorte.'
    } else {
      riskLevel = 'baixo'
      recommendation = 'Estatisticamente seguro. Deve pegar ~' + expectedCaixas.toFixed(0) + ' caixas e talvez 1 aura.'
    }
    
    // Cenários
    const worstCase = (result.avgRuna * count) - totalCost // Só runas, sem extras (89% das vezes)
    const normalCase = (result.avgRuna * count) + (expectedCaixas * result.avgCaixaSomatologia) - totalCost // Com caixas esperadas
    const bestCase = (result.avgRuna * count) + (expectedCaixas * result.avgCaixaSomatologia) + result.auraMente - totalCost // Com aura
    
    return {
      count,
      totalCost,
      expectedReturn,
      expectedProfit,
      profitPercent: totalCost > 0 ? ((expectedReturn / totalCost) - 1) * 100 : 0,
      chanceAlgumExtra: chanceAlgumExtra * 100,
      chanceCaixa: chanceCaixa * 100,
      chanceAura: chanceAura * 100,
      expectedCaixas,
      expectedAuras,
      riskLevel,
      recommendation,
      worstCase,
      normalCase,
      bestCase,
      isWorthIt: expectedProfit > 0,
      avgCaixaSomatologia: result.avgCaixaSomatologia,
      auraMente: result.auraMente
    }
  }

  const treasureResults = calculateTreasureResults()
  const somatologyResult = calculateSomatologyResult()
  const simulation = calculateSimulation(simCount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Calculator className="w-7 h-7" />
              Calculadora Tigrinho
            </h1>
            <p className="text-slate-400 text-sm">Preços do mercado RagnaTales em tempo real</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('expedicao')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'expedicao' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Gem className="w-4 h-4" />
            Expedição
          </button>
          <button
            onClick={() => setActiveTab('somatologia')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'somatologia' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            Alma Sombria
          </button>
        </div>

        {/* EXPEDIÇÃO */}
        {activeTab === 'expedicao' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Tesouros de Expedição</h2>
                <p className="text-sm text-slate-400">100 Pó de Meteorita = 1 Tesouro</p>
              </div>
              <button
                onClick={fetchAllPrices}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Atualizar
              </button>
            </div>

            {loading && <p className="text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />{loadingMessage}</p>}

            {/* Preços */}
            <Card className="p-4 bg-slate-800/50 border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-400">Preços dos Pós de Meteorita (via Supabase)</span>
                {!prices.poEscarlate && <span className="text-xs text-yellow-400">⚠️ Execute o sync-prices.js</span>}
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                {['poEscarlate', 'poSolar', 'poVerdejante', 'poCeleste', 'poOceanica', 'poCrepuscular'].map(key => (
                  <div key={key} className="text-center">
                    <div className="text-slate-500 text-xs">{key.replace('po', '')}</div>
                    <div className={`font-medium ${prices[key] ? 'text-white' : 'text-slate-600'}`}>
                      {prices[key] ? formatZeny(prices[key]) : '---'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(treasureResults).map(([key, t]) => (
                <Card key={key} className="bg-slate-800/50 border-slate-700">
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-semibold text-white">{t.name}</h3>
                    {t.totalCost > 0 ? (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${t.isWorthIt ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {t.isWorthIt ? '✓ Vale' : '✗ Não'}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-600/20 text-slate-400">
                        Atualizar
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div><div className="text-slate-500 text-xs">Custo</div><div className="text-white">{formatZeny(t.totalCost)}</div></div>
                      <div><div className="text-slate-500 text-xs">Esperado</div><div className="text-white">{formatZeny(t.expectedValue)}</div></div>
                      <div><div className="text-slate-500 text-xs">Lucro</div><div className={t.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>{t.profit >= 0 ? '+' : ''}{formatZeny(t.profit)}</div></div>
                    </div>
                    <button onClick={() => setExpandedCard(expandedCard === key ? null : key)} className="text-xs text-slate-400 hover:text-slate-300">
                      {expandedCard === key ? '▼ Ocultar' : '▶ Drops'}
                    </button>
                    {expandedCard === key && (
                      <div className="text-xs space-y-1 pt-2 border-t border-slate-700">
                        <div className="flex justify-between text-emerald-400">
                          <span>✓ {t.guaranteed.quantity}x Compêndios</span>
                          <span>100%</span>
                        </div>
                        <div className="text-slate-500 text-[10px] mt-1 mb-1">+ 1 roll (12% nada):</div>
                        {t.extras.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between text-slate-400">
                            <span>{d.quantity}x {d.name}</span>
                            <span>{d.chance}% • {formatZeny(d.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* SOMATOLOGIA */}
        {activeTab === 'somatologia' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Runa Somatológica</h2>
                <p className="text-sm text-slate-400">9.990 Almas = 1 Runa</p>
              </div>
              <button
                onClick={fetchAllPrices}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Atualizar
              </button>
            </div>

            {loading && <p className="text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />{loadingMessage}</p>}

            {/* Info */}
            <Card className="p-4 bg-slate-800/50 border-slate-700 text-sm text-slate-400">
              <p>• 999 Alma → 1 Condensada → 10 Condensadas → <span className="text-white">1 Runa</span></p>
              <p>• <span className="text-white">100%</span> Runa (sempre)</p>
              <p>• <span className="text-emerald-400">10%</span> Caixa ({prices.avgCaixaSomatologia ? formatZeny(prices.avgCaixaSomatologia) : '~500M'}) <span className="text-slate-500">OU</span> <span className="text-yellow-400">1%</span> Aura ({prices.auraMente ? formatZeny(prices.auraMente) : '~5B'})</p>
              <p className="text-xs text-slate-500 mt-1">* Caixa e Aura são mutuamente exclusivos (não dropam juntos)</p>
            </Card>

            {/* Resultado base */}
            <Card className="bg-slate-800/50 border-slate-700">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <span className="font-semibold text-white">Por Runa</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${somatologyResult.isWorthIt ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {somatologyResult.isWorthIt ? '✓ Vale' : '✗ Não'}
                </span>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div><div className="text-xs text-slate-500">Alma</div><div className="text-white">{formatZeny(somatologyResult.almaCost)}</div></div>
                <div><div className="text-xs text-slate-500">Custo Total</div><div className="text-white">{formatZeny(somatologyResult.totalCost)}</div></div>
                <div><div className="text-xs text-slate-500">Média Runas</div><div className="text-white">{formatZeny(somatologyResult.avgRuna)}</div></div>
                <div><div className="text-xs text-slate-500">Lucro</div><div className={somatologyResult.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>{somatologyResult.profit >= 0 ? '+' : ''}{formatZeny(somatologyResult.profit)}</div></div>
              </div>
            </Card>

            {/* SIMULADOR */}
            <Card className="bg-slate-800/50 border-slate-700">
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <TrendingUp className="w-5 h-5" />
                  Simulador de Tiradas
                </div>
              </div>
              <div className="p-4 space-y-4">
                {/* Seletor */}
                <div className="flex gap-2 flex-wrap">
                  {[1, 10, 30, 50, 100].map(n => (
                    <button
                      key={n}
                      onClick={() => setSimCount(n)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        simCount === n ? 'bg-white text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>

                {/* Resultado da simulação */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">Investimento</div>
                    <div className="text-lg text-white font-semibold">{formatZeny(simulation.totalCost)}</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">Retorno Esperado</div>
                    <div className="text-lg text-white font-semibold">{formatZeny(simulation.expectedReturn)}</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">Lucro Esperado</div>
                    <div className={`text-lg font-semibold ${simulation.expectedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {simulation.expectedProfit >= 0 ? '+' : ''}{formatZeny(simulation.expectedProfit)}
                    </div>
                    <div className="text-xs text-slate-500">({simulation.profitPercent.toFixed(1)}%)</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">Risco</div>
                    <div className={`text-lg font-semibold ${
                      simulation.riskLevel === 'baixo' ? 'text-emerald-400' :
                      simulation.riskLevel === 'medio' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {simulation.riskLevel === 'baixo' ? '🟢 Baixo' :
                       simulation.riskLevel === 'medio' ? '🟡 Médio' : '🔴 Alto'}
                    </div>
                  </div>
                </div>

                {/* Chances */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-900/30 p-3 rounded-lg">
                    <div className="text-slate-400">Chance de ≥1 Caixa (10%)</div>
                    <div className="text-emerald-400 font-medium">{simulation.chanceCaixa.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">~{simulation.expectedCaixas.toFixed(1)} caixas • {formatZeny(simulation.avgCaixaSomatologia)} cada</div>
                  </div>
                  <div className="bg-slate-900/30 p-3 rounded-lg">
                    <div className="text-slate-400">Chance de ≥1 Aura (1%)</div>
                    <div className="text-yellow-400 font-medium">{simulation.chanceAura.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">~{simulation.expectedAuras.toFixed(2)} auras • {formatZeny(simulation.auraMente)} cada</div>
                  </div>
                </div>

                {/* Recomendação */}
                <div className={`p-4 rounded-lg border ${
                  simulation.riskLevel === 'baixo' ? 'bg-emerald-500/10 border-emerald-500/30' :
                  simulation.riskLevel === 'medio' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <p className="text-white">{simulation.recommendation}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="text-slate-500 text-xs">Só runas (89%)</div>
                      <div className={simulation.worstCase >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {simulation.worstCase >= 0 ? '+' : ''}{formatZeny(simulation.worstCase)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-500 text-xs">+ Caixas esperadas</div>
                      <div className={simulation.normalCase >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {simulation.normalCase >= 0 ? '+' : ''}{formatZeny(simulation.normalCase)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-500 text-xs">+ Aura (sorte!)</div>
                      <div className="text-emerald-400">+{formatZeny(simulation.bestCase)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Lista de Runas */}
            {runaPrices.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <button onClick={() => setShowRunas(!showRunas)} className="w-full p-4 flex justify-between items-center hover:bg-slate-700/30">
                  <span className="text-white font-medium">Runas ({runaPrices.length})</span>
                  {showRunas ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {showRunas && (
                  <div className="border-t border-slate-700 p-4 max-h-60 overflow-y-auto">
                    {runaPrices.sort((a, b) => b.price - a.price).map(r => (
                      <div key={r.id} className="flex justify-between py-1 text-sm">
                        <span className="text-slate-300">{r.name}</span>
                        <span className="text-white">{formatZeny(r.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-xs">
          {lastUpdate && <p>Atualizado: {lastUpdate.toLocaleString('pt-BR')}</p>}
          <p>⚠️ Valores estatísticos - resultados reais podem variar</p>
        </div>
      </div>
    </div>
  )
}
