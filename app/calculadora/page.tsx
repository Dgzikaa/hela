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

// RUNAS SOMATOLÓGICAS - IDs corretos conforme passados
const RUNAS = [
  { id: 17917, name: 'Runa Ruby da Celia' },
  { id: 17918, name: 'Runa Topazio da Celia' },
  { id: 17919, name: 'Runa Ametista da Celia' },
  { id: 17920, name: 'Runa Esmeralda da Celia' },
  { id: 17921, name: 'Runa Safira da Celia' },
  { id: 17922, name: 'Runa Turmalina da Celia' },
  { id: 17923, name: 'Runa Ruby de Alphonse' },
  { id: 17924, name: 'Runa Topazio de Alphonse' },
  { id: 17925, name: 'Runa Ametista de Alphonse' },
  { id: 17926, name: 'Runa Esmeralda de Alphonse' },
  { id: 17927, name: 'Runa Safira de Alphonse' },
  { id: 17928, name: 'Runa Turmalina de Alphonse' },
  { id: 17929, name: 'Runa Ruby de Edan' },
  { id: 17930, name: 'Runa Topazio de Edan' },
  { id: 17931, name: 'Runa Ametista de Edan' },
  { id: 17932, name: 'Runa Esmeralda de Edan' },
  { id: 17933, name: 'Runa Safira de Edan' },
  { id: 17934, name: 'Runa Turmalina de Edan' },
  { id: 17935, name: 'Runa Ruby de Skia' },
  { id: 17936, name: 'Runa Topazio de Skia' },
  { id: 17937, name: 'Runa Ametista de Skia' },
  { id: 17938, name: 'Runa Esmeralda de Skia' },
  { id: 17939, name: 'Runa Safira de Skia' },
  { id: 17940, name: 'Runa Turmalina de Skia' },
  { id: 17941, name: 'Runa Ruby de Loki' },
  { id: 17942, name: 'Runa Topazio de Loki' },
  { id: 17943, name: 'Runa Ametista de Loki' },
  { id: 17944, name: 'Runa Esmeralda de Loki' },
  { id: 17945, name: 'Runa Safira de Loki' },
  { id: 17946, name: 'Runa Turmalina de Loki' },
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
  auraMenteCorreompida: 5000000000,
  caixaSomatologia: 1000000000,
}

// Dados dos Tesouros
const TREASURES = {
  escarlate: {
    name: "Tesouro Escarlate",
    costItemKey: 'poEscarlate',
    costAmount: 100,
    drops: [
      { name: "Compêndios (4x)", chance: 100, quantity: 4, fixedPrice: 500000 },
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
    drops: [
      { name: "Compêndios (4x)", chance: 100, quantity: 4, fixedPrice: 500000 },
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
    drops: [
      { name: "Compêndios (4x)", chance: 100, quantity: 4, fixedPrice: 500000 },
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
    drops: [
      { name: "Compêndios (4x)", chance: 100, quantity: 4, fixedPrice: 500000 },
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
    drops: [
      { name: "Compêndios (4x)", chance: 100, quantity: 4, fixedPrice: 500000 },
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
    drops: [
      { name: "Compêndios (4x)", chance: 100, quantity: 4, fixedPrice: 500000 },
      { name: "Desmembrador", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Espírito Ligeiro", chance: 2, quantity: 1, fixedKey: 'espiritoLigeiro' },
      { name: "Caixa Força Exp.", chance: 1, quantity: 1, fixedKey: 'caixaForcaExp' }
    ]
  }
}

function formatZeny(value: number): string {
  if (value >= 1000000000) return (value / 1000000000).toFixed(2) + 'B'
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return Math.round(value / 1000) + 'K'
  return value.toLocaleString('pt-BR')
}

async function fetchItemPrice(nameid: number): Promise<{ price: number, sellers: number } | null> {
  try {
    const response = await fetch(`https://api.ragnatales.com.br/market/item/shopping?nameid=${nameid}`)
    if (!response.ok) return null
    const data = await response.json()
    if (!data || data.length === 0) return null
    const prices = data.map((d: any) => d.price).sort((a: number, b: number) => a - b)
    const top5 = prices.slice(0, Math.min(5, prices.length))
    return {
      price: Math.round(top5.reduce((a: number, b: number) => a + b, 0) / top5.length),
      sellers: data.length
    }
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

  // Busca preços EXPEDIÇÃO
  const fetchExpedicaoPrices = useCallback(async () => {
    setLoading(true)
    const newPrices: Record<string, number> = { ...prices }
    
    const items = [
      { key: 'poEscarlate', id: ITEM_IDS.poEscarlate },
      { key: 'poSolar', id: ITEM_IDS.poSolar },
      { key: 'poVerdejante', id: ITEM_IDS.poVerdejante },
      { key: 'poCeleste', id: ITEM_IDS.poCeleste },
      { key: 'poOceanica', id: ITEM_IDS.poOceanica },
      { key: 'poCrepuscular', id: ITEM_IDS.poCrepuscular },
      { key: 'bencaoFerreiro', id: ITEM_IDS.bencaoFerreiro },
      { key: 'bencaoMestreFerreiro', id: ITEM_IDS.bencaoMestreFerreiro },
      { key: 'desmembrador', id: ITEM_IDS.desmembrador },
    ]

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      setLoadingMessage(`${item.key} (${i + 1}/${items.length})`)
      const result = await fetchItemPrice(item.id)
      if (result) newPrices[item.key] = result.price
      await new Promise(r => setTimeout(r, 300))
    }

    setPrices(newPrices)
    setLastUpdate(new Date())
    setLoading(false)
    setLoadingMessage('')
    localStorage.setItem('tigrinho-prices', JSON.stringify({ prices: newPrices, date: new Date().toISOString() }))
  }, [prices])

  // Busca preços SOMATOLOGIA
  const fetchSomatologiaPrices = useCallback(async () => {
    setLoading(true)
    const newPrices: Record<string, number> = { ...prices }
    
    // Alma Sombria
    setLoadingMessage('Alma Sombria...')
    const almaResult = await fetchItemPrice(ITEM_IDS.almaSombria)
    if (almaResult) newPrices['almaSombria'] = almaResult.price
    
    // TODAS as runas
    const newRunaPrices: RunaPrice[] = []
    for (let i = 0; i < RUNAS.length; i++) {
      const runa = RUNAS[i]
      setLoadingMessage(`${runa.name} (${i + 1}/${RUNAS.length})`)
      
      const result = await fetchItemPrice(runa.id)
      if (result) {
        newRunaPrices.push({
          id: runa.id,
          name: runa.name,
          price: result.price,
          sellers: result.sellers
        })
      }
      
      await new Promise(r => setTimeout(r, 200))
    }

    // Média das runas
    if (newRunaPrices.length > 0) {
      newPrices['avgRuna'] = Math.round(newRunaPrices.reduce((a, b) => a + b.price, 0) / newRunaPrices.length)
    }

    setRunaPrices(newRunaPrices)
    setPrices(newPrices)
    setLastUpdate(new Date())
    setLoading(false)
    setLoadingMessage('')
    localStorage.setItem('tigrinho-runas', JSON.stringify({ 
      prices: newPrices, 
      runas: newRunaPrices,
      date: new Date().toISOString() 
    }))
  }, [prices])

  // Carrega do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tigrinho-prices')
    const savedRunas = localStorage.getItem('tigrinho-runas')
    
    let loadedPrices: Record<string, number> = {}
    
    if (saved) {
      try {
        const { prices } = JSON.parse(saved)
        loadedPrices = { ...loadedPrices, ...prices }
      } catch {}
    }
    
    if (savedRunas) {
      try {
        const { prices, runas, date } = JSON.parse(savedRunas)
        loadedPrices = { ...loadedPrices, ...prices }
        if (runas) setRunaPrices(runas)
        if (date) setLastUpdate(new Date(date))
      } catch {}
    }
    
    setPrices(loadedPrices)
  }, [])

  // Calcula tesouros
  const calculateTreasureResults = () => {
    const results: Record<string, any> = {}

    for (const [key, treasure] of Object.entries(TREASURES)) {
      const costPerUnit = prices[treasure.costItemKey] || 150000
      const totalCost = costPerUnit * treasure.costAmount

      let expectedValue = 0
      const dropDetails = treasure.drops.map(drop => {
        let price = 0
        if (drop.fixedPrice) price = drop.fixedPrice
        else if (drop.fixedKey) price = FIXED_PRICES[drop.fixedKey] || 0
        else if (drop.priceKey) price = prices[drop.priceKey] || 0
        
        const dropValue = (drop.chance / 100) * price * drop.quantity
        expectedValue += dropValue
        return { ...drop, price, expectedValue: dropValue }
      })

      results[key] = {
        name: treasure.name,
        totalCost,
        expectedValue,
        profit: expectedValue - totalCost,
        isWorthIt: expectedValue > totalCost,
        drops: dropDetails
      }
    }

    return results
  }

  // Calcula somatologia
  const calculateSomatologyResult = () => {
    const almaCost = prices.almaSombria || 9500
    const totalCost = almaCost * 9990
    const avgRuna = prices.avgRuna || 15000000
    
    let expectedValue = avgRuna
    expectedValue += 0.10 * FIXED_PRICES.caixaSomatologia
    expectedValue += 0.01 * FIXED_PRICES.auraMenteCorreompida

    return {
      almaCost,
      totalCost,
      avgRuna,
      expectedValue,
      profit: expectedValue - totalCost,
      profitPercent: totalCost > 0 ? ((expectedValue / totalCost) - 1) * 100 : 0,
      isWorthIt: expectedValue > totalCost
    }
  }

  // SIMULADOR - Análise estatística de N tiradas
  const calculateSimulation = (count: number) => {
    const result = calculateSomatologyResult()
    const totalCost = result.totalCost * count
    const expectedReturn = result.expectedValue * count
    const expectedProfit = expectedReturn - totalCost
    
    // Chances de drops extras em N tiradas
    const chanceCaixa = 1 - Math.pow(0.90, count) // Chance de pelo menos 1 caixa
    const chanceAura = 1 - Math.pow(0.99, count) // Chance de pelo menos 1 aura
    const expectedCaixas = count * 0.10 // Número esperado de caixas
    const expectedAuras = count * 0.01 // Número esperado de auras
    
    // Análise de risco
    let riskLevel: 'alto' | 'medio' | 'baixo'
    let recommendation: string
    
    if (count < 10) {
      riskLevel = 'alto'
      recommendation = 'Muito arriscado! Com poucas tiradas, você depende muito da sorte.'
    } else if (count < 50) {
      riskLevel = 'medio'
      recommendation = 'Risco moderado. Começando a ter uma amostra razoável.'
    } else {
      riskLevel = 'baixo'
      recommendation = 'Estatisticamente seguro. Com muitas tiradas, o resultado tende ao esperado.'
    }
    
    // Cenários
    const worstCase = (result.avgRuna * count) - totalCost // Só runas, sem extras
    const bestCase = (result.avgRuna * count) + (count * 0.10 * FIXED_PRICES.caixaSomatologia) + (count * 0.01 * FIXED_PRICES.auraMenteCorreompida) - totalCost
    
    return {
      count,
      totalCost,
      expectedReturn,
      expectedProfit,
      profitPercent: totalCost > 0 ? ((expectedReturn / totalCost) - 1) * 100 : 0,
      chanceCaixa: chanceCaixa * 100,
      chanceAura: chanceAura * 100,
      expectedCaixas,
      expectedAuras,
      riskLevel,
      recommendation,
      worstCase,
      bestCase,
      isWorthIt: expectedProfit > 0
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
                onClick={fetchExpedicaoPrices}
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
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                {['poEscarlate', 'poSolar', 'poVerdejante', 'poCeleste', 'poOceanica', 'poCrepuscular'].map(key => (
                  <div key={key} className="text-center">
                    <div className="text-slate-500 text-xs">{key.replace('po', '')}</div>
                    <div className="text-white font-medium">{prices[key] ? formatZeny(prices[key]) : '-'}</div>
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${t.isWorthIt ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {t.isWorthIt ? '✓ Vale' : '✗ Não'}
                    </span>
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
                        {t.drops.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between text-slate-400">
                            <span>{d.quantity}x {d.name}</span>
                            <span>{d.chance}%</span>
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
                onClick={fetchSomatologiaPrices}
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
              <p>• Drops: 100% Runa + <span className="text-emerald-400">10% Caixa (~1B)</span> + <span className="text-yellow-400">1% Aura (~5B)</span></p>
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
                    <div className="text-slate-400">Chance de ≥1 Caixa</div>
                    <div className="text-emerald-400 font-medium">{simulation.chanceCaixa.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">~{simulation.expectedCaixas.toFixed(1)} caixas esperadas</div>
                  </div>
                  <div className="bg-slate-900/30 p-3 rounded-lg">
                    <div className="text-slate-400">Chance de ≥1 Aura</div>
                    <div className="text-yellow-400 font-medium">{simulation.chanceAura.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">~{simulation.expectedAuras.toFixed(2)} auras esperadas</div>
                  </div>
                </div>

                {/* Recomendação */}
                <div className={`p-4 rounded-lg border ${
                  simulation.riskLevel === 'baixo' ? 'bg-emerald-500/10 border-emerald-500/30' :
                  simulation.riskLevel === 'medio' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <p className="text-white">{simulation.recommendation}</p>
                  <div className="mt-2 text-sm text-slate-400">
                    <span>Pior cenário: </span>
                    <span className={simulation.worstCase >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {simulation.worstCase >= 0 ? '+' : ''}{formatZeny(simulation.worstCase)}
                    </span>
                    <span className="mx-2">|</span>
                    <span>Melhor cenário: </span>
                    <span className="text-emerald-400">+{formatZeny(simulation.bestCase)}</span>
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
