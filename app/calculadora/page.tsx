'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '../components/Card'
import { ArrowLeft, Calculator, Gem, FlaskConical, RefreshCw, Loader2, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { ToolsLayout } from '../components/ToolsLayout'

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
  espiritoPoderoso: 2000000000,
  espiritoLigeiro: 2000000000,
  espiritoAstuto: 2800000000,
  talismaYinYang: 1000000000,
  orbeYokai: 2000000000,
  garraPrata: 1400000000, // 1.4B
  caixaForcaExp: 3500000000,
}

// Aura da Mente Corrompida - drop SEPARADO (1%), não da caixa
const AURA_MENTE_ID = 19439

// Itens da Caixa de Somatologia - buscar do market (1° item = preço mais barato)
const CAIXA_SOMATOLOGIA_ITEMS = [
  { id: 20986, name: 'Manto Abstrato', key: 'mantoAbstrato' },
  { id: 540042, name: 'Livro Perverso', key: 'livroPerverso' },
  { id: 1837, name: 'Garra de Ferro', key: 'garraFerro' },
  { id: 28767, name: 'Jack Estripadora', key: 'jackEstripadora' },
  { id: 5985, name: 'Máscara da Nobreza', key: 'mascaraNobreza' },
  { id: 18752, name: 'Livro Amaldiçoado', key: 'livroAmaldicoado' },
  { id: 19379, name: 'Quepe do General', key: 'quepeGeneral' },
  { id: 5905, name: 'Chapéu de Maestro', key: 'chapeuMaestro' },
  { id: 470010, name: 'Botas de Capricórnio', key: 'botasCapricornio' },
  { id: 490141, name: 'Palheta de Elunium', key: 'palhetaElunium' },
  { id: 2935, name: 'Luvas de Corrida', key: 'luvasCorrida' },
  // Couraça de Senshi = vale nada (não incluir)
]

// Itens >1B (não vendem no market, valores fixos)
const CAIXA_SOMATOLOGIA_FIXED = {
  botasTeste: 1000000000, // 1B
  anelJupiter: 1500000000, // 1.5B
}

// Fallback se não conseguir buscar preços
const CAIXA_SOMATOLOGIA_FALLBACK = 300000000 // 300kk de média estimada

// Dados dos Tesouros
// Drops: 100% compêndios + 1 roll (12% nada, 70% desmembrador, 10% bênção, 5% mestre, 2% raro, 1% caixa)
const TREASURES = {
  escarlate: {
    name: "Tesouro Escarlate",
    costItemKey: 'poEscarlate',
    costAmount: 400, // 400 pós de meteorita por tesouro
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
    costAmount: 400,
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
    costAmount: 400,
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
    costAmount: 400,
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
    costAmount: 400,
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
    costAmount: 400,
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
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1000000000) return sign + (abs / 1000000000).toFixed(2) + 'B'
  if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1) + 'kk'
  if (abs >= 1000) return sign + Math.round(abs / 1000) + 'k'
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
  const [expSimCount, setExpSimCount] = useState(10)
  const [selectedTreasure, setSelectedTreasure] = useState('escarlate')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  // Sincroniza preços com a API do RagnaTales
  const syncPrices = async () => {
    setSyncing(true)
    setSyncMessage('')
    try {
      const response = await fetch('/api/sync-prices', { method: 'POST' })
      const data = await response.json()
      if (response.ok) {
        setSyncMessage(`✓ ${data.message}`)
        // Recarrega os preços
        fetchAllPrices()
      } else {
        setSyncMessage('Erro ao sincronizar preços')
      }
    } catch {
      setSyncMessage('Erro de conexão')
    } finally {
      setSyncing(false)
    }
  }

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
      
      // Calcula média da caixa de somatologia (itens do market + fixos >1B)
      const caixaKeys = ['mantoAbstrato', 'livroPerverso', 'garraFerro', 'jackEstripadora', 'mascaraNobreza', 'livroAmaldicoado', 'quepeGeneral', 'chapeuMaestro', 'botasCapricornio', 'palhetaElunium', 'luvasCorrida']
      const caixaPrices = caixaKeys.map(k => supabasePrices[k]).filter(p => p > 0)
      // Adiciona itens fixos (>1B que não vendem no market)
      caixaPrices.push(CAIXA_SOMATOLOGIA_FIXED.botasTeste) // 1B
      caixaPrices.push(CAIXA_SOMATOLOGIA_FIXED.anelJupiter) // 1.5B
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
    const avgCaixaSomatologia = prices.avgCaixaSomatologia || CAIXA_SOMATOLOGIA_FALLBACK
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

  // SIMULADOR - Cálculo GARANTIDO pela matemática
  // Drops: 89% só runa | 10% runa+caixa | 1% runa+aura (mutuamente exclusivos)
  const calculateSimulation = (count: number) => {
    const result = calculateSomatologyResult()
    const totalCost = result.totalCost * count
    
    // GARANTIDO pela matemática (floor = mínimo garantido)
    const garantidoRunas = count // 100% das vezes
    const garantidoCaixas = Math.floor(count * 0.10) // 10%
    const garantidoAuras = Math.floor(count * 0.01) // 1%
    
    // Valores de cada item
    const valorRunas = result.avgRuna * garantidoRunas
    const valorCaixas = garantidoCaixas * result.avgCaixaSomatologia
    const valorAuras = garantidoAuras * result.auraMente
    
    // RETORNO GARANTIDO (soma dos items garantidos)
    const retornoGarantido = valorRunas + valorCaixas + valorAuras
    const lucroGarantido = retornoGarantido - totalCost
    
    // Veredicto baseado no garantido
    const vale = lucroGarantido >= 0
    
    return {
      count,
      totalCost,
      // Garantidos
      garantidoRunas,
      garantidoCaixas,
      garantidoAuras,
      valorRunas,
      valorCaixas,
      valorAuras,
      avgRuna: result.avgRuna,
      avgCaixaSomatologia: result.avgCaixaSomatologia,
      auraMente: result.auraMente,
      // Totais
      retornoGarantido,
      lucroGarantido,
      vale
    }
  }

  // Simula expedição (N tiradas de tesouro) - CÁLCULO REALISTA
  const calculateExpeditionSimulation = (treasureKey: string, count: number) => {
    const treasure = TREASURES[treasureKey as keyof typeof TREASURES]
    if (!treasure) return null
    
    const costPerUnit = prices[treasure.costItemKey] || 0
    const totalCost = costPerUnit * treasure.costAmount * count
    
    // Garantido: compêndios (4x por tiro, ~500k cada)
    const compendioPrice = treasure.guaranteed.fixedPrice
    const compendiosTotal = treasure.guaranteed.quantity * compendioPrice * count
    
    // Preços dos drops
    const desmembradorPrice = prices.desmembrador || 50000
    const bencaoPrice = prices.bencaoFerreiro || 5000000
    const mestrePrice = prices.bencaoMestreFerreiro || 50000000
    
    // Item raro específico (2%)
    let raroPrice = 0
    let raroName = ''
    if (treasureKey === 'escarlate') { raroPrice = FIXED_PRICES.espiritoPoderoso; raroName = 'Espírito Poderoso' }
    if (treasureKey === 'solar') { raroPrice = FIXED_PRICES.talismaYinYang; raroName = 'Talismã Yin Yang' }
    if (treasureKey === 'verdejante') { raroPrice = FIXED_PRICES.orbeYokai; raroName = 'Orbe de Yokai' }
    if (treasureKey === 'celeste') { raroPrice = FIXED_PRICES.garraPrata; raroName = 'Garra de Prata' }
    if (treasureKey === 'oceanico') { raroPrice = FIXED_PRICES.espiritoAstuto; raroName = 'Espírito Astuto' }
    if (treasureKey === 'crepuscular') { raroPrice = FIXED_PRICES.espiritoLigeiro; raroName = 'Espírito Ligeiro' }
    
    const caixaPrice = FIXED_PRICES.caixaForcaExp
    
    // Quantidades esperadas
    const expectedDesmembradores = Math.floor(count * 0.70)
    const expectedBencaos = Math.floor(count * 0.10)
    const expectedMestres = Math.floor(count * 0.05)
    
    // Valores dos drops comuns
    const desmembradoresValue = expectedDesmembradores * desmembradorPrice
    const bencaosValue = expectedBencaos * bencaoPrice
    const mestresValue = expectedMestres * mestrePrice
    
    // RETORNO REALISTA (sem raros) - o que você PROVAVELMENTE vai ganhar
    const retornoRealista = compendiosTotal + desmembradoresValue + bencaosValue + mestresValue
    const lucroRealista = retornoRealista - totalCost
    
    // Chances de pelo menos 1 drop raro
    const chanceRaro = (1 - Math.pow(0.98, count)) * 100
    const chanceCaixa = (1 - Math.pow(0.99, count)) * 100
    
    // SE PEGAR RARO - quanto ganha a mais
    const lucroComRaro = lucroRealista + raroPrice
    const lucroComCaixa = lucroRealista + caixaPrice
    
    // Nível de risco baseado na chance de recuperar o investimento
    let riskLevel: 'alto' | 'medio' | 'baixo'
    
    if (chanceRaro < 30) {
      riskLevel = 'alto' // Menos de 30% de chance de raro = alto risco
    } else if (chanceRaro < 65) {
      riskLevel = 'medio'
    } else {
      riskLevel = 'baixo' // Mais de 65% de chance de pelo menos 1 raro
    }
    
    return {
      treasureName: treasure.name,
      count,
      totalCost,
      // Detalhes dos drops
      compendiosTotal,
      expectedDesmembradores,
      desmembradoresValue,
      desmembradorPrice,
      expectedBencaos,
      bencaosValue,
      bencaoPrice,
      expectedMestres,
      mestresValue,
      mestrePrice,
      // Retorno realista (sem raros)
      retornoRealista,
      lucroRealista,
      // Chances de raros
      chanceRaro,
      chanceCaixa,
      raroName,
      raroPrice,
      caixaPrice,
      // Se pegar raro
      lucroComRaro,
      lucroComCaixa,
      riskLevel
    }
  }

  const treasureResults = calculateTreasureResults()
  const somatologyResult = calculateSomatologyResult()
  const simulation = calculateSimulation(simCount)
  const expSimulation = calculateExpeditionSimulation(selectedTreasure, expSimCount)

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calculator className="w-7 h-7 text-purple-600" />
              Calculadora Tigrinho
            </h1>
            <p className="text-gray-500 text-sm">Preços do mercado RagnaTales em tempo real</p>
          </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('expedicao')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'expedicao' ? 'bg-purple-600 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Gem className="w-4 h-4" />
            Expedição
          </button>
          <button
            onClick={() => setActiveTab('somatologia')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'somatologia' ? 'bg-purple-600 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
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
                <h2 className="text-xl font-semibold text-gray-900">Tesouros de Expedição</h2>
                <p className="text-sm text-gray-500">400 Pó de Meteorita = 1 Tesouro</p>
              </div>
              <button
                onClick={syncPrices}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-gray-900 rounded-lg disabled:opacity-50 transition-colors"
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {syncing ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>

            {loading && <p className="text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />{loadingMessage}</p>}
            {syncMessage && <p className={`text-sm ${syncMessage.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>{syncMessage}</p>}

            {/* Preços */}
            <Card className="p-4 bg-white border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">Preços dos Pós de Meteorita (via Supabase)</span>
                {!prices.poEscarlate && <span className="text-xs text-amber-600">⚠️ Clique em Atualizar</span>}
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                {['poEscarlate', 'poSolar', 'poVerdejante', 'poCeleste', 'poOceanica', 'poCrepuscular'].map(key => (
                  <div key={key} className="text-center">
                    <div className="text-gray-400 text-xs">{key.replace('po', '')}</div>
                    <div className={`font-medium ${prices[key] ? 'text-gray-900' : 'text-gray-400'}`}>
                      {prices[key] ? formatZeny(prices[key]) : '---'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Simulador de Expedição */}
            <Card className="bg-white border-gray-200 shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Simulação de Tiradas</h3>
              
              {/* Seletor de tesouro */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(treasureResults).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTreasure(key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedTreasure === key
                        ? 'bg-purple-600 text-gray-900'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t.name.replace('Tesouro ', '')}
                  </button>
                ))}
              </div>

              {/* Tabela comparativa: 10, 50, 100 tiros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[10, 50, 100].map(count => {
                  const sim = calculateExpeditionSimulation(selectedTreasure, count)
                  if (!sim) return null
                  
                  // Calcula quantos de cada item é GARANTIDO pela matemática
                  const garantidoDesmembradores = Math.floor(count * 0.70)
                  const garantidoBencaos = Math.floor(count * 0.10)
                  const garantidoMestres = Math.floor(count * 0.05)
                  const garantidoRaros = Math.floor(count * 0.02)
                  const garantidoCaixas = Math.floor(count * 0.01)
                  
                  // Valor de cada item
                  const valorDesmembradores = garantidoDesmembradores * sim.desmembradorPrice
                  const valorBencaos = garantidoBencaos * sim.bencaoPrice
                  const valorMestres = garantidoMestres * sim.mestrePrice
                  const valorRaros = garantidoRaros * sim.raroPrice
                  const valorCaixas = garantidoCaixas * sim.caixaPrice
                  
                  // Retorno garantido (compêndios + drops garantidos pela %)
                  const retornoGarantido = sim.compendiosTotal + valorDesmembradores + valorBencaos + valorMestres + valorRaros + valorCaixas
                  const lucroGarantido = retornoGarantido - sim.totalCost
                  
                  // Veredicto
                  const vale = lucroGarantido >= 0
                  
                  return (
                    <div key={count} className={`bg-slate-900/50 rounded-lg p-4 border ${
                      vale ? 'border-emerald-500/30' : 'border-red-500/30'
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xl font-bold text-gray-900">{count}x Tiros</span>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          vale ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {vale ? '✓ Vale a pena' : '✗ Prejuízo'}
                        </span>
                      </div>
                      
                      {/* Investimento */}
                      <div className="bg-white border border-gray-200/50 rounded p-2 mb-3">
                        <div className="text-xs text-gray-500">💰 Investimento</div>
                        <div className="text-lg font-bold text-gray-900">{formatZeny(sim.totalCost)}</div>
                      </div>

                      {/* Retorno Garantido - detalhado */}
                      <div className="text-xs text-gray-500 mb-2">📦 Retorno garantido pela %:</div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{count * 4}x Compêndios</span>
                          <span className="text-gray-900">{formatZeny(sim.compendiosTotal)}</span>
                        </div>
                        {garantidoDesmembradores > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{garantidoDesmembradores}x Desmembrador</span>
                            <span className="text-gray-900">{formatZeny(valorDesmembradores)}</span>
                          </div>
                        )}
                        {garantidoBencaos > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{garantidoBencaos}x Bênção</span>
                            <span className="text-gray-900">{formatZeny(valorBencaos)}</span>
                          </div>
                        )}
                        {garantidoMestres > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{garantidoMestres}x Mestre</span>
                            <span className="text-gray-900">{formatZeny(valorMestres)}</span>
                          </div>
                        )}
                        {garantidoRaros > 0 && (
                          <div className="flex justify-between text-yellow-400">
                            <span>{garantidoRaros}x {sim.raroName}</span>
                            <span>{formatZeny(valorRaros)}</span>
                          </div>
                        )}
                        {garantidoCaixas > 0 && (
                          <div className="flex justify-between text-emerald-400">
                            <span>{garantidoCaixas}x Caixa Expedição</span>
                            <span>{formatZeny(valorCaixas)}</span>
                          </div>
                        )}
                      </div>

                      {/* Total e Lucro */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total retorno:</span>
                          <span className="text-gray-900 font-medium">{formatZeny(retornoGarantido)}</span>
                        </div>
                        <div className="flex justify-between text-lg mt-1">
                          <span className="text-gray-500">Lucro:</span>
                          <span className={`font-bold ${lucroGarantido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {lucroGarantido >= 0 ? '+' : ''}{formatZeny(lucroGarantido)}
                          </span>
                        </div>
                      </div>

                      {/* Bônus se tiver sorte */}
                      {(garantidoRaros === 0 || garantidoCaixas === 0) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400">
                          <div className="text-gray-500 mb-1">🍀 Se tiver sorte:</div>
                          {garantidoRaros === 0 && (
                            <div className="flex justify-between">
                              <span>+1 {sim.raroName}</span>
                              <span className="text-yellow-400">+{formatZeny(sim.raroPrice)}</span>
                            </div>
                          )}
                          {garantidoCaixas === 0 && (
                            <div className="flex justify-between">
                              <span>+1 Caixa Expedição</span>
                              <span className="text-emerald-400">+{formatZeny(sim.caixaPrice)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="text-xs text-gray-400 mt-4">
                * Drops extras (além dos compêndios): 12% nada, 70% desmembrador, 10% bênção, 5% mestre, 2% {treasureResults[selectedTreasure]?.extras?.find((e: any) => e.name?.includes('Espírito') || e.name?.includes('Orbe') || e.name?.includes('Garra') || e.name?.includes('Talismã'))?.name || 'raro'}, 1% caixa
              </p>
            </Card>

            {/* Grid resumido */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(treasureResults).map(([key, t]) => (
                <Card key={key} className={`bg-white border-gray-200 shadow-sm p-3 text-center cursor-pointer hover:border-slate-500 transition-all ${selectedTreasure === key ? 'ring-2 ring-white' : ''}`} onClick={() => setSelectedTreasure(key)}>
                  <div className="text-xs text-gray-500 mb-1">{t.name.replace('Tesouro ', '')}</div>
                  <div className="text-sm text-gray-900">{formatZeny(t.totalCost)}</div>
                  <div className={`text-xs ${t.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.profit >= 0 ? '+' : ''}{formatZeny(t.profit)}/tiro
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
                <h2 className="text-xl font-semibold text-gray-900">Runa Somatológica</h2>
                <p className="text-sm text-gray-500">9.990 Almas = 1 Runa</p>
              </div>
              <button
                onClick={fetchAllPrices}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Atualizar
              </button>
            </div>

            {loading && <p className="text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />{loadingMessage}</p>}

            {/* Info */}
            <Card className="p-4 bg-white border-gray-200 shadow-sm text-sm text-gray-500">
              <p>• 999 Alma → 1 Condensada → 10 Condensadas → <span className="text-gray-900">1 Runa</span></p>
              <p>• <span className="text-gray-900">100%</span> Runa (sempre)</p>
              <p>• <span className="text-emerald-400">10%</span> Caixa ({prices.avgCaixaSomatologia ? formatZeny(prices.avgCaixaSomatologia) : '~500M'}) <span className="text-gray-400">OU</span> <span className="text-yellow-400">1%</span> Aura ({prices.auraMente ? formatZeny(prices.auraMente) : '~5B'})</p>
              <p className="text-xs text-gray-400 mt-1">* Caixa e Aura são mutuamente exclusivos (não dropam juntos)</p>
            </Card>

            {/* Resultado base */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Por Runa</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${somatologyResult.isWorthIt ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {somatologyResult.isWorthIt ? '✓ Vale' : '✗ Não'}
                </span>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div><div className="text-xs text-gray-400">Alma</div><div className="text-gray-900">{formatZeny(somatologyResult.almaCost)}</div></div>
                <div><div className="text-xs text-gray-400">Custo Total</div><div className="text-gray-900">{formatZeny(somatologyResult.totalCost)}</div></div>
                <div><div className="text-xs text-gray-400">Média Runas</div><div className="text-gray-900">{formatZeny(somatologyResult.avgRuna)}</div></div>
                <div><div className="text-xs text-gray-400">Lucro</div><div className={somatologyResult.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>{somatologyResult.profit >= 0 ? '+' : ''}{formatZeny(somatologyResult.profit)}</div></div>
              </div>
            </Card>

            {/* SIMULADOR - mesma lógica da Expedição */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
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
                        simCount === n ? 'bg-white text-slate-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>

                {/* Card principal */}
                <div className={`bg-slate-900/50 rounded-lg p-4 border ${
                  simulation.vale ? 'border-emerald-500/30' : 'border-red-500/30'
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-gray-900">{simulation.count}x Runas</span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      simulation.vale ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {simulation.vale ? '✓ Vale a pena' : '✗ Prejuízo'}
                    </span>
                  </div>
                  
                  {/* Investimento */}
                  <div className="bg-white border border-gray-200/50 rounded p-2 mb-4">
                    <div className="text-xs text-gray-500">💰 Investimento ({simulation.count} × 9.990 almas)</div>
                    <div className="text-lg font-bold text-gray-900">{formatZeny(simulation.totalCost)}</div>
                  </div>

                  {/* Retorno Garantido - detalhado */}
                  <div className="text-xs text-gray-500 mb-2">📦 Retorno garantido pela %:</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{simulation.garantidoRunas}x Runas (100%)</span>
                      <span className="text-gray-900">{formatZeny(simulation.valorRunas)}</span>
                    </div>
                    {simulation.garantidoCaixas > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>{simulation.garantidoCaixas}x Caixa Somatologia (10%)</span>
                        <span>{formatZeny(simulation.valorCaixas)}</span>
                      </div>
                    )}
                    {simulation.garantidoAuras > 0 && (
                      <div className="flex justify-between text-yellow-400">
                        <span>{simulation.garantidoAuras}x Aura da Mente (1%)</span>
                        <span>{formatZeny(simulation.valorAuras)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total e Lucro */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total retorno:</span>
                      <span className="text-gray-900 font-medium">{formatZeny(simulation.retornoGarantido)}</span>
                    </div>
                    <div className="flex justify-between text-lg mt-1">
                      <span className="text-gray-500">Lucro:</span>
                      <span className={`font-bold ${simulation.lucroGarantido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {simulation.lucroGarantido >= 0 ? '+' : ''}{formatZeny(simulation.lucroGarantido)}
                      </span>
                    </div>
                  </div>

                  {/* Bônus se tiver sorte */}
                  {(simulation.garantidoCaixas === 0 || simulation.garantidoAuras === 0) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400">
                      <div className="text-gray-500 mb-1">🍀 Se tiver sorte:</div>
                      {simulation.garantidoCaixas === 0 && (
                        <div className="flex justify-between">
                          <span>+1 Caixa Somatologia</span>
                          <span className="text-emerald-400">+{formatZeny(simulation.avgCaixaSomatologia)}</span>
                        </div>
                      )}
                      {simulation.garantidoAuras === 0 && (
                        <div className="flex justify-between">
                          <span>+1 Aura da Mente</span>
                          <span className="text-yellow-400">+{formatZeny(simulation.auraMente)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Lista de Runas */}
            {runaPrices.length > 0 && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <button onClick={() => setShowRunas(!showRunas)} className="w-full p-4 flex justify-between items-center hover:bg-gray-100/30">
                  <span className="text-gray-900 font-medium">Runas ({runaPrices.length})</span>
                  {showRunas ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {showRunas && (
                  <div className="border-t border-gray-200 p-4 max-h-60 overflow-y-auto">
                    {runaPrices.sort((a, b) => b.price - a.price).map(r => (
                      <div key={r.id} className="flex justify-between py-1 text-sm">
                        <span className="text-gray-600">{r.name}</span>
                        <span className="text-gray-900">{formatZeny(r.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

          {/* Footer */}
          <div className="mt-8 text-center text-gray-400 text-xs">
            {lastUpdate && <p>Atualizado: {lastUpdate.toLocaleString('pt-BR')}</p>}
            <p>⚠️ Valores estatísticos - resultados reais podem variar</p>
          </div>
        </div>
      </div>
    </ToolsLayout>
  )
}
