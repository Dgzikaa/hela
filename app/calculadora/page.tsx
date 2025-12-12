'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '../components/Card'
import { ArrowLeft, Calculator, Gem, FlaskConical, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

// IDs dos itens - TODOS buscados do market exceto >1B
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
  // Itens dos tesouros (buscáveis no market)
  bencaoFerreiro: 6226,
  bencaoMestreFerreiro: 6225,
  desmembrador: 1000389,
  // Runas Somatológicas - TODAS buscadas do market
  runas: [
    { id: 17917, name: 'Runa da Vitalidade' },
    { id: 17918, name: 'Runa da Força' },
    { id: 17919, name: 'Runa da Agilidade' },
    { id: 17920, name: 'Runa da Inteligência' },
    { id: 17921, name: 'Runa da Destreza' },
    { id: 17922, name: 'Runa da Sorte' },
    { id: 17923, name: 'Runa do Ataque' },
    { id: 17924, name: 'Runa da Magia' },
    { id: 17925, name: 'Runa da Defesa' },
    { id: 17926, name: 'Runa da Def. Mágica' },
    { id: 17927, name: 'Runa do HP' },
    { id: 17928, name: 'Runa do SP' },
    { id: 17929, name: 'Runa da Velocidade' },
    { id: 17930, name: 'Runa do Crítico' },
    { id: 17931, name: 'Runa da Esquiva' },
    { id: 17932, name: 'Runa da Precisão' },
    { id: 17933, name: 'Runa do Vampirismo' },
    { id: 17934, name: 'Runa da Cura' },
    { id: 17935, name: 'Runa do Silêncio' },
    { id: 17936, name: 'Runa do Congelamento' },
    { id: 17937, name: 'Runa do Atordoamento' },
    { id: 17938, name: 'Runa da Maldição' },
    { id: 17939, name: 'Runa do Sono' },
    { id: 17940, name: 'Runa da Cegueira' },
    { id: 17941, name: 'Runa do Caos' },
    { id: 17942, name: 'Runa do Sangramento' },
    { id: 17943, name: 'Runa do Veneno' },
    { id: 17944, name: 'Runa da Petrificação' },
    { id: 17945, name: 'Runa do Fogo' },
    { id: 17946, name: 'Runa do Gelo' },
  ]
}

// Itens >1B que NÃO podem ser vendidos no market (valores estimados)
const FIXED_PRICES: Record<string, number> = {
  espiritoPoderoso: 2200000000,
  espiritoLigeiro: 2200000000,
  espiritoAstuto: 2800000000,
  talismaYinYang: 1000000000,
  orbeYokai: 2000000000,
  garraPrata: 2000000000,
  caixaForcaExp: 3500000000,
  auraMenteCorreompida: 5000000000,
  caixaSomatologia: 1000000000, // média dos itens
}

// Dados dos Tesouros de Expedição
const TREASURES = {
  escarlate: {
    name: "Tesouro Escarlate",
    costItemKey: 'poEscarlate',
    costAmount: 100,
    drops: [
      { name: "Compêndio (3x)", chance: 100, quantity: 3, priceKey: 'compendio', fixedPrice: 500000 },
      { name: "Compêndio Espelho", chance: 100, quantity: 1, priceKey: 'compendio', fixedPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre-Ferreiro", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Espírito Poderoso [1]", chance: 2, quantity: 1, fixedKey: 'espiritoPoderoso' },
      { name: "Caixa Força Exp.", chance: 1, quantity: 1, fixedKey: 'caixaForcaExp' }
    ]
  },
  solar: {
    name: "Tesouro Solar",
    costItemKey: 'poSolar',
    costAmount: 100,
    drops: [
      { name: "Compêndio (3x)", chance: 100, quantity: 3, fixedPrice: 500000 },
      { name: "Compêndio Espelho", chance: 100, quantity: 1, fixedPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre-Ferreiro", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Talismã Yin Yang", chance: 2, quantity: 1, fixedKey: 'talismaYinYang' },
      { name: "Caixa Força Exp.", chance: 1, quantity: 1, fixedKey: 'caixaForcaExp' }
    ]
  },
  verdejante: {
    name: "Tesouro Verdejante",
    costItemKey: 'poVerdejante',
    costAmount: 100,
    drops: [
      { name: "Compêndio (3x)", chance: 100, quantity: 3, fixedPrice: 500000 },
      { name: "Compêndio Espelho", chance: 100, quantity: 1, fixedPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre-Ferreiro", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Orbe de Yokai", chance: 2, quantity: 1, fixedKey: 'orbeYokai' },
      { name: "Caixa Força Exp.", chance: 1, quantity: 1, fixedKey: 'caixaForcaExp' }
    ]
  },
  celeste: {
    name: "Tesouro Celeste",
    costItemKey: 'poCeleste',
    costAmount: 100,
    drops: [
      { name: "Compêndio (3x)", chance: 100, quantity: 3, fixedPrice: 500000 },
      { name: "Compêndio Espelho", chance: 100, quantity: 1, fixedPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre-Ferreiro", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Garra de Prata", chance: 2, quantity: 1, fixedKey: 'garraPrata' },
      { name: "Caixa Força Exp.", chance: 1, quantity: 1, fixedKey: 'caixaForcaExp' }
    ]
  },
  oceanico: {
    name: "Tesouro Oceânico",
    costItemKey: 'poOceanica',
    costAmount: 100,
    drops: [
      { name: "Compêndio (3x)", chance: 100, quantity: 3, fixedPrice: 500000 },
      { name: "Compêndio Espelho", chance: 100, quantity: 1, fixedPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre-Ferreiro", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Espírito Astuto [1]", chance: 2, quantity: 1, fixedKey: 'espiritoAstuto' }
    ]
  },
  crepuscular: {
    name: "Tesouro Crepuscular",
    costItemKey: 'poCrepuscular',
    costAmount: 100,
    drops: [
      { name: "Compêndio (3x)", chance: 100, quantity: 3, fixedPrice: 500000 },
      { name: "Compêndio Espelho", chance: 100, quantity: 1, fixedPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, priceKey: 'desmembrador' },
      { name: "Bênção Ferreiro", chance: 10, quantity: 1, priceKey: 'bencaoFerreiro' },
      { name: "Bênção Mestre-Ferreiro", chance: 5, quantity: 1, priceKey: 'bencaoMestreFerreiro' },
      { name: "Espírito Ligeiro [1]", chance: 2, quantity: 1, fixedKey: 'espiritoLigeiro' },
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

async function fetchItemPrice(nameid: number): Promise<number | null> {
  try {
    const response = await fetch(`https://api.ragnatales.com.br/market/item/shopping?nameid=${nameid}`)
    if (!response.ok) return null
    const data = await response.json()
    if (!data || data.length === 0) return null
    const prices = data.map((d: any) => d.price).sort((a: number, b: number) => a - b)
    const top5 = prices.slice(0, Math.min(5, prices.length))
    return Math.round(top5.reduce((a: number, b: number) => a + b, 0) / top5.length)
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

  // Busca preços do mercado - EXPEDIÇÃO
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
      setLoadingMessage(`Buscando ${item.key}... (${i + 1}/${items.length})`)
      const price = await fetchItemPrice(item.id)
      if (price) newPrices[item.key] = price
      await new Promise(r => setTimeout(r, 300))
    }

    setPrices(newPrices)
    setLastUpdate(new Date())
    setLoading(false)
    setLoadingMessage('')
    localStorage.setItem('tigrinho-expedicao', JSON.stringify({ prices: newPrices, date: new Date().toISOString() }))
  }, [prices])

  // Busca preços do mercado - SOMATOLOGIA (Almas + Runas)
  const fetchSomatologiaPrices = useCallback(async () => {
    setLoading(true)
    const newPrices: Record<string, number> = { ...prices }
    
    // Busca Alma Sombria
    setLoadingMessage('Buscando Alma Sombria...')
    const almaPrice = await fetchItemPrice(ITEM_IDS.almaSombria)
    if (almaPrice) newPrices['almaSombria'] = almaPrice
    
    // Busca TODAS as runas
    const newRunaPrices: RunaPrice[] = []
    for (let i = 0; i < ITEM_IDS.runas.length; i++) {
      const runa = ITEM_IDS.runas[i]
      setLoadingMessage(`Buscando ${runa.name}... (${i + 1}/${ITEM_IDS.runas.length})`)
      
      try {
        const response = await fetch(`https://api.ragnatales.com.br/market/item/shopping?nameid=${runa.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            const prices = data.map((d: any) => d.price).sort((a: number, b: number) => a - b)
            const avgPrice = Math.round(prices.slice(0, 5).reduce((a: number, b: number) => a + b, 0) / Math.min(5, prices.length))
            newRunaPrices.push({
              id: runa.id,
              name: runa.name,
              price: avgPrice,
              sellers: data.length
            })
          }
        }
      } catch {}
      
      await new Promise(r => setTimeout(r, 200))
    }

    // Calcula média das runas
    if (newRunaPrices.length > 0) {
      const avgRuna = Math.round(newRunaPrices.reduce((a, b) => a + b.price, 0) / newRunaPrices.length)
      newPrices['avgRuna'] = avgRuna
    }

    setRunaPrices(newRunaPrices)
    setPrices(newPrices)
    setLastUpdate(new Date())
    setLoading(false)
    setLoadingMessage('')
    localStorage.setItem('tigrinho-somatologia', JSON.stringify({ 
      prices: newPrices, 
      runas: newRunaPrices,
      date: new Date().toISOString() 
    }))
  }, [prices])

  // Carrega do localStorage
  useEffect(() => {
    const expedicao = localStorage.getItem('tigrinho-expedicao')
    const somatologia = localStorage.getItem('tigrinho-somatologia')
    
    let loadedPrices: Record<string, number> = {}
    
    if (expedicao) {
      try {
        const { prices } = JSON.parse(expedicao)
        loadedPrices = { ...loadedPrices, ...prices }
      } catch {}
    }
    
    if (somatologia) {
      try {
        const { prices, runas, date } = JSON.parse(somatologia)
        loadedPrices = { ...loadedPrices, ...prices }
        if (runas) setRunaPrices(runas)
        if (date) setLastUpdate(new Date(date))
      } catch {}
    }
    
    setPrices(loadedPrices)
  }, [])

  // Calcula resultados dos tesouros
  const calculateTreasureResults = () => {
    const results: Record<string, any> = {}

    for (const [key, treasure] of Object.entries(TREASURES)) {
      const costPerUnit = prices[treasure.costItemKey] || 150000
      const totalCost = costPerUnit * treasure.costAmount

      let expectedValue = 0
      const dropDetails = treasure.drops.map(drop => {
        let price = 0
        if (drop.fixedPrice) {
          price = drop.fixedPrice
        } else if (drop.fixedKey) {
          price = FIXED_PRICES[drop.fixedKey] || 0
        } else if (drop.priceKey) {
          price = prices[drop.priceKey] || 0
        }
        
        const dropValue = (drop.chance / 100) * price * drop.quantity
        expectedValue += dropValue
        return { ...drop, price, expectedValue: dropValue }
      })

      results[key] = {
        name: treasure.name,
        totalCost,
        expectedValue,
        profit: expectedValue - totalCost,
        profitPercent: totalCost > 0 ? ((expectedValue / totalCost) - 1) * 100 : 0,
        isWorthIt: expectedValue > totalCost,
        drops: dropDetails
      }
    }

    return results
  }

  // Calcula resultado das runas
  const calculateSomatologyResult = () => {
    const almaCost = prices.almaSombria || 9500
    const totalCost = almaCost * 9990
    const avgRuna = prices.avgRuna || 15000000
    
    let expectedValue = avgRuna // 100% runa
    expectedValue += 0.10 * FIXED_PRICES.caixaSomatologia // 10% Caixa
    expectedValue += 0.01 * FIXED_PRICES.auraMenteCorreompida // 1% Aura

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

  const treasureResults = calculateTreasureResults()
  const somatologyResult = calculateSomatologyResult()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Calculator className="w-7 h-7" />
                Calculadora Tigrinho
              </h1>
              <p className="text-slate-400 text-sm">Preços em tempo real do mercado RagnaTales</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('expedicao')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'expedicao'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Gem className="w-4 h-4" />
            Expedição
          </button>
          <button
            onClick={() => setActiveTab('somatologia')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'somatologia'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            Alma Sombria
          </button>
        </div>

        {/* EXPEDIÇÃO TAB */}
        {activeTab === 'expedicao' && (
          <div className="space-y-6">
            {/* Header + Atualizar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Tesouros de Expedição</h2>
                <p className="text-sm text-slate-400">100 Pó de Meteorita = 1 Tesouro</p>
              </div>
              <button
                onClick={fetchExpedicaoPrices}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Atualizar
              </button>
            </div>

            {loading && loadingMessage && (
              <div className="text-sm text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {loadingMessage}
              </div>
            )}

            {/* Preços dos Pós */}
            <Card className="p-4 bg-slate-800/50 border-slate-700">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Preços dos Pós de Meteorita</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                {[
                  { key: 'poEscarlate', label: 'Escarlate' },
                  { key: 'poSolar', label: 'Solar' },
                  { key: 'poVerdejante', label: 'Verdejante' },
                  { key: 'poCeleste', label: 'Celeste' },
                  { key: 'poOceanica', label: 'Oceânica' },
                  { key: 'poCrepuscular', label: 'Crepuscular' },
                ].map(({ key, label }) => (
                  <div key={key} className="text-center">
                    <div className="text-slate-500 text-xs">{label}</div>
                    <div className="text-white font-medium">
                      {prices[key] ? formatZeny(prices[key]) : '-'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Grid de Tesouros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(treasureResults).map(([key, treasure]) => (
                <Card key={key} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-semibold text-white">{treasure.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      treasure.isWorthIt 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {treasure.isWorthIt ? '✓ Vale' : '✗ Não'}
                    </span>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="text-slate-500 text-xs">Custo</div>
                        <div className="text-white font-medium">{formatZeny(treasure.totalCost)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Esperado</div>
                        <div className="text-white font-medium">{formatZeny(treasure.expectedValue)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Lucro</div>
                        <div className={`font-medium ${treasure.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {treasure.profit >= 0 ? '+' : ''}{formatZeny(treasure.profit)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedCard(expandedCard === key ? null : key)}
                      className="w-full text-left text-xs text-slate-400 hover:text-slate-300"
                    >
                      {expandedCard === key ? '▼ Ocultar' : '▶ Ver drops'}
                    </button>

                    {expandedCard === key && (
                      <div className="space-y-1 pt-2 border-t border-slate-700 text-xs">
                        {treasure.drops.map((drop: any, i: number) => (
                          <div key={i} className="flex justify-between text-slate-400">
                            <span>{drop.quantity}x {drop.name}</span>
                            <span>{drop.chance}% • {formatZeny(drop.price)}</span>
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

        {/* SOMATOLOGIA TAB */}
        {activeTab === 'somatologia' && (
          <div className="space-y-6">
            {/* Header + Atualizar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Runa Somatológica</h2>
                <p className="text-sm text-slate-400">9.990 Almas Sombrias = 1 Runa</p>
              </div>
              <button
                onClick={fetchSomatologiaPrices}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Atualizar
              </button>
            </div>

            {loading && loadingMessage && (
              <div className="text-sm text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {loadingMessage}
              </div>
            )}

            {/* Info */}
            <Card className="p-4 bg-slate-800/50 border-slate-700">
              <div className="text-sm text-slate-400 space-y-1">
                <p>• 999 Alma Sombria → 1 Condensada</p>
                <p>• 10 Condensadas → 1 Runa Somatológica</p>
                <p>• <span className="text-white">Drops:</span> 100% Runa + 10% Caixa (~1B) + 1% Aura (~5B)</p>
              </div>
            </Card>

            {/* Resultado Principal */}
            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-white">Resultado</h3>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  somatologyResult.isWorthIt 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {somatologyResult.isWorthIt ? '✓ Vale a pena' : '✗ Não vale'}
                </span>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Preços base */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500">Alma Sombria</div>
                    <div className="text-lg text-white font-semibold">
                      {prices.almaSombria ? formatZeny(prices.almaSombria) : '-'}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500">Média das Runas ({runaPrices.length})</div>
                    <div className="text-lg text-white font-semibold">
                      {prices.avgRuna ? formatZeny(prices.avgRuna) : '-'}
                    </div>
                  </div>
                </div>

                {/* Cálculo */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-sm text-slate-500 mb-1">Custo (9.990 almas)</div>
                    <div className="text-xl text-white font-semibold">{formatZeny(somatologyResult.totalCost)}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-sm text-slate-500 mb-1">Valor Esperado</div>
                    <div className="text-xl text-white font-semibold">{formatZeny(somatologyResult.expectedValue)}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-sm text-slate-500 mb-1">Lucro/Prejuízo</div>
                    <div className={`text-xl font-semibold ${somatologyResult.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {somatologyResult.profit >= 0 ? '+' : ''}{formatZeny(somatologyResult.profit)}
                    </div>
                    <div className="text-xs text-slate-500">
                      ({somatologyResult.profitPercent >= 0 ? '+' : ''}{somatologyResult.profitPercent.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Lista de Runas */}
            {runaPrices.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <button
                  onClick={() => setShowRunas(!showRunas)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
                >
                  <span className="font-medium text-white">
                    Preços das Runas ({runaPrices.length} encontradas)
                  </span>
                  {showRunas ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                
                {showRunas && (
                  <div className="border-t border-slate-700 p-4 max-h-80 overflow-y-auto">
                    <div className="space-y-2">
                      {runaPrices.sort((a, b) => b.price - a.price).map(runa => (
                        <div key={runa.id} className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">{runa.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-xs">{runa.sellers} vendas</span>
                            <span className="text-white font-medium">{formatZeny(runa.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm space-y-1">
          {lastUpdate && (
            <p>Última atualização: {lastUpdate.toLocaleString('pt-BR')}</p>
          )}
          <p>⚠️ Valores estatísticos. Resultados podem variar!</p>
        </div>
      </div>
    </div>
  )
}
