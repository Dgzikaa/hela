'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card } from '../components/Card'
import { Ticket, RefreshCw, Loader2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { ToolsLayout } from '../components/ToolsLayout'

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

// ===============================
// DADOS DAS RIFAS
// ===============================

interface RifaItem {
  name: string
  quantity: number
  itemId: number // nameid para buscar na API - 0 = ainda não mapeado
  key: string // chave única para buscar no cache de preços
}

interface Rifa {
  id: number
  preco: number
  premioPrincipal: RifaItem
  chancePrincipal: number // em %
  premioConsolacao: RifaItem
  chanceConsolacao: number // em %
}

// Conteúdo das caixas (para calcular valor total)
interface CaixaConteudo {
  key: string
  name: string
  items: { name: string; quantity: number; itemId: number; key: string }[]
}

const CAIXAS_CONTEUDO: CaixaConteudo[] = [
  {
    key: 'caixaConsumiveisA',
    name: 'Caixa de Consumíveis da Rifa A',
    items: [
      { name: 'Palitos de Baunilha', quantity: 5, itemId: 14618, key: 'palitosBaunilha' },
      { name: 'Palitos de Laranja', quantity: 5, itemId: 14616, key: 'palitosLaranja' },
    ]
  },
  {
    key: 'caixaConsumiveisB',
    name: 'Caixa de Consumíveis da Rifa B',
    items: [
      { name: 'Pergaminho de Esquiva', quantity: 5, itemId: 14530, key: 'pergaminhoEsquiva' },
      { name: 'Poção do Furor Físico', quantity: 2, itemId: 12418, key: 'pocaoFurorFisico' },
      { name: 'Cálice da Ilusão', quantity: 5, itemId: 14538, key: 'caliceIlusao' },
    ]
  },
  {
    key: 'caixaConsumiveisC',
    name: 'Caixa de Consumíveis da Rifa C',
    items: [
      { name: 'Palitos de Cassis', quantity: 5, itemId: 14619, key: 'palitosCassis' },
      { name: 'Palitos de Chocolate', quantity: 5, itemId: 14617, key: 'palitosChocolate' },
    ]
  },
  {
    key: 'caixaConsumiveisD',
    name: 'Caixa de Consumíveis da Rifa D',
    items: [
      { name: 'Poção do Furor Mágico', quantity: 2, itemId: 12419, key: 'pocaoFurorMagico' },
      { name: 'Poção de Regeneração', quantity: 5, itemId: 12461, key: 'pocaoRegeneracao' },
    ]
  },
  {
    key: 'caixaConsumiveisE',
    name: 'Caixa de Consumíveis da Rifa E',
    items: [
      { name: 'Palitos de Limão', quantity: 5, itemId: 14620, key: 'palitosLimao' },
      { name: 'Palitos de Morango', quantity: 5, itemId: 14621, key: 'palitosMorango' },
    ]
  },
  {
    key: 'caixaConsumiveisF',
    name: 'Caixa de Consumíveis da Rifa F',
    items: [
      { name: 'Pergaminho de Precisão', quantity: 5, itemId: 14531, key: 'pergaminhoPrecisao' },
      { name: 'Acarajé', quantity: 3, itemId: 12375, key: 'acaraje' },
      { name: 'Abrasivo', quantity: 3, itemId: 14536, key: 'abrasivo' },
    ]
  },
  {
    key: 'caixaAuxiliaresA',
    name: 'Caixa de Auxiliares Dourados A',
    items: [
      { name: 'Frasco de Bomba Dourado', quantity: 1, itemId: 17620, key: 'frascosBombaDourado' },
      { name: 'Frasco de Revestimento Dourado', quantity: 1, itemId: 17619, key: 'frascosRevestimentoDourado' },
      { name: 'Pedra Dourada', quantity: 1, itemId: 52011, key: 'pedraDourada' },
      { name: 'Pergaminho Dourado', quantity: 1, itemId: 52009, key: 'pergaminhoDourado' },
      { name: 'Gema Amarela Dourada', quantity: 1, itemId: 102509, key: 'gemaAmarelaDourada' },
      { name: 'Gema Vermelha Dourada', quantity: 1, itemId: 102510, key: 'gemaVermelhoDourada' },
      { name: 'Gema Azul Dourada', quantity: 1, itemId: 102511, key: 'gemaAzulDourada' },
    ]
  },
  {
    key: 'caixaConversoresEtereos',
    name: 'Caixa de Conversores Etéreos',
    items: [
      { name: 'Conversor Elemental Fantasma', quantity: 1, itemId: 102502, key: 'conversorFantasma' },
      { name: 'Pergaminho de Aspersio', quantity: 5, itemId: 12928, key: 'pergaminhoAspersio' },
    ]
  },
  {
    key: 'caixaConsumiveisDourados',
    name: 'Caixa de Consumíveis Dourados',
    items: [
      { name: 'Poção de Agilidade Dourada', quantity: 1, itemId: 102503, key: 'pocaoAgilidadeDourada' },
      { name: 'Panacéia Dourada', quantity: 1, itemId: 52047, key: 'panaceiaDourada' },
      { name: 'Doce de Elvira Dourado', quantity: 1, itemId: 52045, key: 'doceElviraDourado' },
      { name: 'Folha de Yggdrasil Dourada', quantity: 1, itemId: 52046, key: 'folhaYggdrasilDourada' },
      { name: 'Poção Anti-Elemento Dourada', quantity: 1, itemId: 52048, key: 'pocaoAntiElementoDourada' },
      { name: 'Conversor Removedor Dourado', quantity: 1, itemId: 52063, key: 'conversorRemovedorDourado' },
    ]
  },
  {
    key: 'caixaMunicoesDouradas',
    name: 'Caixa de Munições Douradas',
    items: [
      { name: 'Kunai Dourada', quantity: 1, itemId: 17616, key: 'kunaiDourada' },
      { name: 'Flecha Dourada', quantity: 1, itemId: 17614, key: 'flechaDourada' },
      { name: 'Projétil Dourado', quantity: 1, itemId: 17617, key: 'projetilDourado' },
      { name: 'Shuriken Dourada', quantity: 1, itemId: 17615, key: 'shurikenDourada' },
      { name: 'Cápsula Dourada', quantity: 1, itemId: 52010, key: 'capsulaDourada' },
    ]
  },
  {
    key: 'caixaConversoresElementais',
    name: 'Caixa de Conversores Elementais',
    items: [
      { name: 'Conversor Elemental Água', quantity: 5, itemId: 12115, key: 'conversorAgua' },
      { name: 'Conversor Elemental Fogo', quantity: 5, itemId: 12114, key: 'conversorFogo' },
      { name: 'Conversor Elemental Terra', quantity: 5, itemId: 12116, key: 'conversorTerra' },
      { name: 'Conversor Elemental Vento', quantity: 5, itemId: 12117, key: 'conversorVento' },
      { name: 'Conversor Removedor Elemental', quantity: 5, itemId: 102504, key: 'conversorRemovedor' },
    ]
  },
  {
    key: 'caixaAuxiliaresB',
    name: 'Caixa de Auxiliares Dourados B',
    items: [
      { name: 'Garrafa de Veneno Dourada', quantity: 1, itemId: 17618, key: 'garrafaVenenoDourada' },
      { name: 'Kit de Toxinas Douradas', quantity: 1, itemId: 102508, key: 'kitToxinasDouradas' },
      { name: 'Bolsa Falsa de Zenys Dourada', quantity: 1, itemId: 17613, key: 'bolsaFalsaZenysDourada' },
      { name: 'Armadilha Dourada', quantity: 1, itemId: 52053, key: 'armadilhaDourada' },
      { name: 'Esporo de Cogumelo Dourado', quantity: 1, itemId: 52059, key: 'esporoCogumeloDourado' },
      { name: 'Semente Selvagem Dourada', quantity: 1, itemId: 52061, key: 'sementeSelvagemDourada' },
      { name: 'Semente Sanguessuga Dourada', quantity: 1, itemId: 52062, key: 'sementeSanguessugaDourada' },
    ]
  },
  {
    key: 'caixaSuprimentosClasse',
    name: 'Caixa de Suprimentos de Classe',
    items: [
      { name: 'Garrafa de Veneno', quantity: 5, itemId: 678, key: 'garrafaVeneno' },
      { name: 'Frasco de Fogo Grego', quantity: 5, itemId: 7135, key: 'frascoFogoGrego' },
      { name: 'Frasco de Ácido', quantity: 5, itemId: 7136, key: 'frascoAcido' },
      { name: 'Frasco de Revestimento', quantity: 5, itemId: 7139, key: 'frascoRevestimento' },
    ]
  },
  {
    key: 'caixaIngredientesDourados',
    name: 'Caixa de Ingredientes Dourados',
    items: [
      { name: 'Tubo de Ensaio Dourado', quantity: 1, itemId: 52056, key: 'tuboEnsaioDourado' },
      { name: 'Garrafa Vazia Dourada', quantity: 1, itemId: 52055, key: 'garrafaVaziaDourada' },
      { name: 'Garrafa de Poção Dourada', quantity: 1, itemId: 52057, key: 'garrafaPocaoDourada' },
      { name: 'Vasilha de Mistura Dourada', quantity: 1, itemId: 52054, key: 'vasilhaMisturaDourada' },
    ]
  },
  {
    key: 'caixaXaropes',
    name: 'Caixa de Xaropes',
    items: [
      { name: 'Xarope Azul', quantity: 20, itemId: 11624, key: 'xaropeAzul' },
      { name: 'Xarope Vermelho', quantity: 10, itemId: 11621, key: 'xaropeVermelho' },
      { name: 'Xarope Branco', quantity: 10, itemId: 11623, key: 'xaropeBranco' },
      { name: 'Xarope Amarelo', quantity: 10, itemId: 11622, key: 'xaropeAmarelo' },
    ]
  },
  {
    key: 'caixaConsumiveisG',
    name: 'Caixa de Consumíveis da Rifa G',
    items: [
      { name: 'Dogão', quantity: 2, itemId: 101900, key: 'dogao' },
      { name: 'Bênção de Tyr', quantity: 2, itemId: 14601, key: 'bencaoTyr' },
      { name: 'Caixinha Noite Feliz', quantity: 2, itemId: 2784, key: 'caixinhaNoiteFeliz' },
      { name: 'Suco de Gato', quantity: 2, itemId: 12298, key: 'sucoGato' },
    ]
  },
  // Trouxinha de Comidas Especiais (rifa 9 consolação)
  {
    key: 'trouxinhaComidas',
    name: 'Trouxinha de Comidas Especiais',
    items: [
      { name: 'Língua no Vapor', quantity: 1, itemId: 12075, key: 'linguaVapor' },
      { name: 'Escorpiões do Deserto no Vapor', quantity: 1, itemId: 12090, key: 'escorpioesVapor' },
      { name: 'Cozido Imortal', quantity: 1, itemId: 12085, key: 'cozidoImortal' },
      { name: 'Coquetel Sopro do Dragão', quantity: 1, itemId: 12080, key: 'coquetelSoproDragao' },
      { name: 'Tônico de Hwergelmir', quantity: 1, itemId: 12095, key: 'tonicoHwergelmir' },
      { name: 'Nove Caudas Cozidas', quantity: 1, itemId: 12100, key: 'noveCaudasCozidas' },
    ]
  },
]

// As 14 rifas com seus dados
const RIFAS: Rifa[] = [
  {
    id: 1,
    preco: 180000,
    premioPrincipal: { name: 'Caixa de Consumíveis da Rifa A', quantity: 1, itemId: 0, key: 'caixaConsumiveisA' },
    chancePrincipal: 3,
    premioConsolacao: { name: 'Caixa de Consumíveis da Rifa B', quantity: 1, itemId: 0, key: 'caixaConsumiveisB' },
    chanceConsolacao: 97,
  },
  {
    id: 2,
    preco: 180000,
    premioPrincipal: { name: 'Caixa de Consumíveis da Rifa C', quantity: 1, itemId: 0, key: 'caixaConsumiveisC' },
    chancePrincipal: 3,
    premioConsolacao: { name: 'Caixa de Consumíveis da Rifa D', quantity: 1, itemId: 0, key: 'caixaConsumiveisD' },
    chanceConsolacao: 97,
  },
  {
    id: 3,
    preco: 180000,
    premioPrincipal: { name: 'Caixa de Consumíveis da Rifa E', quantity: 1, itemId: 0, key: 'caixaConsumiveisE' },
    chancePrincipal: 3,
    premioConsolacao: { name: 'Caixa de Consumíveis da Rifa F', quantity: 1, itemId: 0, key: 'caixaConsumiveisF' },
    chanceConsolacao: 97,
  },
  {
    id: 4,
    preco: 180000,
    premioPrincipal: { name: 'Medicina Milagrosa', quantity: 10, itemId: 12259, key: 'medicinaMilagrosa' },
    chancePrincipal: 1,
    premioConsolacao: { name: 'Pergaminho do Éden', quantity: 25, itemId: 17721, key: 'pergaminhoEden' },
    chanceConsolacao: 99,
  },
  {
    id: 5,
    preco: 300000,
    premioPrincipal: { name: 'Espelho Convexo', quantity: 3, itemId: 12214, key: 'espelhoConvexo' },
    chancePrincipal: 1,
    premioConsolacao: { name: 'Amuleto de Ziegfried', quantity: 10, itemId: 7621, key: 'amuletoZiegfried' },
    chanceConsolacao: 99,
  },
  {
    id: 6,
    preco: 300000,
    premioPrincipal: { name: 'Caixa de Auxiliares Dourados A', quantity: 1, itemId: 0, key: 'caixaAuxiliaresA' },
    chancePrincipal: 0.5,
    premioConsolacao: { name: 'Caixa de Conversores Etéreos', quantity: 1, itemId: 0, key: 'caixaConversoresEtereos' },
    chanceConsolacao: 99.5,
  },
  {
    id: 7,
    preco: 300000,
    premioPrincipal: { name: 'Caixa de Consumíveis Dourados', quantity: 1, itemId: 0, key: 'caixaConsumiveisDourados' },
    chancePrincipal: 0.5,
    premioConsolacao: { name: 'Doce de Elvira', quantity: 10, itemId: 23044, key: 'doceElvira' },
    chanceConsolacao: 99.5,
  },
  {
    id: 8,
    preco: 360000,
    premioPrincipal: { name: 'Poção de Guyak', quantity: 10, itemId: 12710, key: 'pocaoGuyak' },
    chancePrincipal: 1,
    premioConsolacao: { name: 'Poção do Vento', quantity: 20, itemId: 12016, key: 'pocaoVento' },
    chanceConsolacao: 99,
  },
  {
    id: 9,
    preco: 600000,
    premioPrincipal: { name: 'Salada de Frutas Tropicais', quantity: 20, itemId: 12247, key: 'saladaFrutasTropicais' },
    chancePrincipal: 2,
    premioConsolacao: { name: 'Trouxinha de Comidas Especiais', quantity: 2, itemId: 0, key: 'trouxinhaComidas' },
    chanceConsolacao: 98,
  },
  {
    id: 10,
    preco: 300000,
    premioPrincipal: { name: 'Caixa de Munições Douradas', quantity: 1, itemId: 0, key: 'caixaMunicoesDouradas' },
    chancePrincipal: 0.5,
    premioConsolacao: { name: 'Caixa de Conversores Elementais', quantity: 1, itemId: 0, key: 'caixaConversoresElementais' },
    chanceConsolacao: 99.5,
  },
  {
    id: 11,
    preco: 300000,
    premioPrincipal: { name: 'Caixa de Auxiliares Dourados B', quantity: 1, itemId: 0, key: 'caixaAuxiliaresB' },
    chancePrincipal: 0.5,
    premioConsolacao: { name: 'Caixa de Suprimentos de Classe', quantity: 1, itemId: 0, key: 'caixaSuprimentosClasse' },
    chanceConsolacao: 99.5,
  },
  {
    id: 12,
    preco: 300000,
    premioPrincipal: { name: 'Caixa de Ingredientes Dourados', quantity: 1, itemId: 0, key: 'caixaIngredientesDourados' },
    chancePrincipal: 0.5,
    premioConsolacao: { name: 'Caixa de Xaropes', quantity: 1, itemId: 0, key: 'caixaXaropes' },
    chanceConsolacao: 99.5,
  },
  {
    id: 13,
    preco: 300000,
    premioPrincipal: { name: 'Poção Mental', quantity: 20, itemId: 14600, key: 'pocaoMental' },
    chancePrincipal: 3,
    premioConsolacao: { name: 'Incenso Queimado', quantity: 10, itemId: 102501, key: 'incensoQueimado' },
    chanceConsolacao: 97,
  },
  {
    id: 14,
    preco: 300000,
    premioPrincipal: { name: 'Pedra de Selamento Dourada', quantity: 1, itemId: 52058, key: 'pedraSelamentoDourada' },
    chancePrincipal: 0.03,
    premioConsolacao: { name: 'Caixa de Consumíveis da Rifa G', quantity: 1, itemId: 0, key: 'caixaConsumiveisG' },
    chanceConsolacao: 99.97,
  },
]

// ===============================
// HELPERS
// ===============================

function formatZeny(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1000000000) return sign + (abs / 1000000000).toFixed(2) + 'B'
  if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1) + 'kk'
  if (abs >= 1000) return sign + Math.round(abs / 1000) + 'k'
  return value.toLocaleString('pt-BR')
}

function formatPercent(value: number): string {
  if (value < 1) return value.toFixed(2) + '%'
  return value + '%'
}

// ===============================
// COMPONENTE PRINCIPAL
// ===============================

export default function RifasPage() {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [expandedRifa, setExpandedRifa] = useState<number | null>(null)
  const [showOnlyWorth, setShowOnlyWorth] = useState(false)

  // Busca preços do Supabase
  const fetchPrices = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rifa_prices?select=item_key,price,updated_at`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const pricesMap: Record<string, number> = {}
        let latestUpdate: Date | null = null
        
        data.forEach((item: { item_key: string; price: number; updated_at: string }) => {
          if (item.price > 0) pricesMap[item.item_key] = item.price
          const itemDate = new Date(item.updated_at)
          if (!latestUpdate || itemDate > latestUpdate) latestUpdate = itemDate
        })
        
        setPrices(pricesMap)
        if (latestUpdate) setLastUpdate(latestUpdate)
      }
    } catch (err) {
      console.error('Erro ao buscar preços:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Sincroniza preços com a API do RagnaTales
  const syncPrices = async () => {
    setSyncing(true)
    setSyncMessage('')
    try {
      const response = await fetch('/api/sync-rifa-prices', { method: 'POST' })
      const data = await response.json()
      if (response.ok) {
        setSyncMessage(`✓ ${data.message}`)
        fetchPrices()
      } else {
        setSyncMessage('Erro ao sincronizar preços')
      }
    } catch {
      setSyncMessage('Erro de conexão')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [fetchPrices])

  // Calcula o valor de um item (direto ou de uma caixa)
  const getItemValue = useCallback((key: string, quantity: number): number => {
    // Primeiro tenta buscar preço direto do item
    if (prices[key]) {
      return prices[key] * quantity
    }
    
    // Se é uma caixa, soma o valor dos itens dentro
    const caixa = CAIXAS_CONTEUDO.find(c => c.key === key)
    if (caixa) {
      let total = 0
      for (const item of caixa.items) {
        const itemPrice = prices[item.key] || 0
        total += itemPrice * item.quantity
      }
      return total * quantity
    }
    
    return 0
  }, [prices])

  // Calcula resultado de cada rifa
  const rifasCalculadas = useMemo(() => {
    return RIFAS.map(rifa => {
      const valorPrincipal = getItemValue(rifa.premioPrincipal.key, rifa.premioPrincipal.quantity)
      const valorConsolacao = getItemValue(rifa.premioConsolacao.key, rifa.premioConsolacao.quantity)
      
      // Valor esperado = (chance_principal × valor_principal) + (chance_consolacao × valor_consolacao)
      const valorEsperado = (rifa.chancePrincipal / 100) * valorPrincipal + (rifa.chanceConsolacao / 100) * valorConsolacao
      
      // Lucro = valor esperado - custo
      const lucro = valorEsperado - rifa.preco
      const lucroPorcentagem = rifa.preco > 0 ? (lucro / rifa.preco) * 100 : 0
      
      // Vale a pena se lucro > 0
      const valeAPena = lucro > 0
      
      // Verifica se temos preços para todos os itens
      const temPrecos = valorPrincipal > 0 || valorConsolacao > 0
      
      // Lucro GARANTIDO (só com consolação, já que 97%+ de chance)
      const lucroConsolacao = valorConsolacao - rifa.preco
      const valeAPenaConsolacao = lucroConsolacao > 0
      
      return {
        ...rifa,
        valorPrincipal,
        valorConsolacao,
        valorEsperado,
        lucro,
        lucroPorcentagem,
        valeAPena,
        temPrecos,
        lucroConsolacao,
        valeAPenaConsolacao,
      }
    })
  }, [getItemValue])

  // Filtra rifas
  const rifasExibidas = useMemo(() => {
    if (showOnlyWorth) {
      return rifasCalculadas.filter(r => r.valeAPena || r.valeAPenaConsolacao)
    }
    return rifasCalculadas
  }, [rifasCalculadas, showOnlyWorth])

  // Estatísticas
  const stats = useMemo(() => {
    const comPreco = rifasCalculadas.filter(r => r.temPrecos)
    const valemAPena = rifasCalculadas.filter(r => r.valeAPena)
    const valemConsolacao = rifasCalculadas.filter(r => r.valeAPenaConsolacao)
    const melhorRifa = rifasCalculadas.reduce((a, b) => a.lucro > b.lucro ? a : b)
    const piorRifa = rifasCalculadas.reduce((a, b) => a.lucro < b.lucro ? a : b)
    
    return {
      total: RIFAS.length,
      comPreco: comPreco.length,
      valemAPena: valemAPena.length,
      valemConsolacao: valemConsolacao.length,
      melhorRifa,
      piorRifa,
    }
  }, [rifasCalculadas])

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Ticket className="w-7 h-7 text-amber-500" />
              Calculadora Rafa da Rifa
            </h1>
            <p className="text-gray-500 text-sm">Analise quais rifas valem a pena jogar</p>
          </div>

          {/* Controles */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={syncPrices}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? 'Sincronizando...' : 'Atualizar Preços'}
            </button>
            
            <button
              onClick={() => setShowOnlyWorth(!showOnlyWorth)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showOnlyWorth 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Só as que valem
            </button>
          </div>

          {loading && (
            <p className="text-sm text-gray-500 mb-4">
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Carregando preços...
            </p>
          )}
          
          {syncMessage && (
            <p className={`text-sm mb-4 ${syncMessage.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
              {syncMessage}
            </p>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-white border-gray-200 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Total de Rifas</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </Card>
            <Card className="p-4 bg-white border-gray-200 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Com Preços</div>
              <div className="text-2xl font-bold text-gray-900">{stats.comPreco}</div>
            </Card>
            <Card className="p-4 bg-emerald-50 border-emerald-200 shadow-sm">
              <div className="text-xs text-emerald-600 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Valem a Pena
              </div>
              <div className="text-2xl font-bold text-emerald-700">{stats.valemAPena}</div>
            </Card>
            <Card className="p-4 bg-blue-50 border-blue-200 shadow-sm">
              <div className="text-xs text-blue-600 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Lucro Garantido
              </div>
              <div className="text-2xl font-bold text-blue-700">{stats.valemConsolacao}</div>
            </Card>
          </div>

          {/* Melhor e Pior */}
          {stats.comPreco > 0 && (
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Card className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
                <div className="text-xs opacity-80 mb-1">🏆 Melhor Rifa</div>
                <div className="font-bold">Rifa #{stats.melhorRifa.id}</div>
                <div className="text-sm opacity-90">{stats.melhorRifa.premioConsolacao.name}</div>
                <div className="text-lg font-bold mt-2">
                  +{formatZeny(stats.melhorRifa.lucro)} lucro esperado
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
                <div className="text-xs opacity-80 mb-1">⚠️ Pior Rifa</div>
                <div className="font-bold">Rifa #{stats.piorRifa.id}</div>
                <div className="text-sm opacity-90">{stats.piorRifa.premioConsolacao.name}</div>
                <div className="text-lg font-bold mt-2">
                  {formatZeny(stats.piorRifa.lucro)} lucro esperado
                </div>
              </Card>
            </div>
          )}

          {/* Lista de Rifas */}
          <div className="space-y-3">
            {rifasExibidas.map(rifa => (
              <Card 
                key={rifa.id} 
                className={`bg-white border shadow-sm overflow-hidden transition-all ${
                  rifa.valeAPenaConsolacao 
                    ? 'border-emerald-300 ring-2 ring-emerald-100' 
                    : rifa.valeAPena 
                      ? 'border-blue-300' 
                      : 'border-gray-200'
                }`}
              >
                {/* Header da Rifa */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedRifa(expandedRifa === rifa.id ? null : rifa.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Número e Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-400">#{rifa.id}</span>
                        {rifa.valeAPenaConsolacao && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> LUCRO GARANTIDO
                          </span>
                        )}
                        {!rifa.valeAPenaConsolacao && rifa.valeAPena && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Vale a pena
                          </span>
                        )}
                        {!rifa.temPrecos && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Sem preços
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Preço e Lucro */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Custo</div>
                        <div className="font-semibold text-gray-900">{formatZeny(rifa.preco)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Lucro Esperado</div>
                        <div className={`font-bold text-lg ${rifa.lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {rifa.lucro >= 0 ? '+' : ''}{formatZeny(rifa.lucro)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Só Consolação</div>
                        <div className={`font-semibold ${rifa.lucroConsolacao >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {rifa.lucroConsolacao >= 0 ? '+' : ''}{formatZeny(rifa.lucroConsolacao)}
                        </div>
                      </div>
                      {expandedRifa === rifa.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Prêmios resumo */}
                  <div className="mt-3 flex gap-8 text-sm">
                    <div>
                      <span className="text-gray-500">Principal ({formatPercent(rifa.chancePrincipal)}):</span>{' '}
                      <span className="text-gray-900">
                        {rifa.premioPrincipal.quantity}x {rifa.premioPrincipal.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Consolação ({formatPercent(rifa.chanceConsolacao)}):</span>{' '}
                      <span className="text-gray-900">
                        {rifa.premioConsolacao.quantity}x {rifa.premioConsolacao.name}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Detalhes expandidos */}
                {expandedRifa === rifa.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Prêmio Principal */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          🎁 Prêmio Principal
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                            {formatPercent(rifa.chancePrincipal)} chance
                          </span>
                        </h4>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="font-medium text-gray-900">
                            {rifa.premioPrincipal.quantity}x {rifa.premioPrincipal.name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Valor: <span className="text-gray-900 font-medium">{formatZeny(rifa.valorPrincipal)}</span>
                          </div>
                          
                          {/* Se for caixa, mostra conteúdo */}
                          {CAIXAS_CONTEUDO.find(c => c.key === rifa.premioPrincipal.key) && (
                            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                              <div className="font-medium mb-1">Conteúdo da caixa:</div>
                              {CAIXAS_CONTEUDO.find(c => c.key === rifa.premioPrincipal.key)?.items.map((item, i) => (
                                <div key={i} className="flex justify-between">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>{prices[item.key] ? formatZeny(prices[item.key] * item.quantity) : '---'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Prêmio Consolação */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          📦 Prêmio de Consolação
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {formatPercent(rifa.chanceConsolacao)} chance
                          </span>
                        </h4>
                        <div className={`rounded-lg p-3 border ${
                          rifa.lucroConsolacao >= 0 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : 'bg-white border-gray-200'
                        }`}>
                          <div className="font-medium text-gray-900">
                            {rifa.premioConsolacao.quantity}x {rifa.premioConsolacao.name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Valor: <span className="text-gray-900 font-medium">{formatZeny(rifa.valorConsolacao)}</span>
                          </div>
                          {rifa.lucroConsolacao >= 0 && (
                            <div className="text-sm text-emerald-600 font-medium mt-1">
                              ✓ Lucro garantido: +{formatZeny(rifa.lucroConsolacao)}
                            </div>
                          )}
                          
                          {/* Se for caixa, mostra conteúdo */}
                          {CAIXAS_CONTEUDO.find(c => c.key === rifa.premioConsolacao.key) && (
                            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                              <div className="font-medium mb-1">Conteúdo da caixa:</div>
                              {CAIXAS_CONTEUDO.find(c => c.key === rifa.premioConsolacao.key)?.items.map((item, i) => (
                                <div key={i} className="flex justify-between">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>{prices[item.key] ? formatZeny(prices[item.key] * item.quantity) : '---'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Cálculo detalhado */}
                    <div className="mt-4 p-3 bg-slate-100 rounded-lg text-sm">
                      <div className="font-medium text-gray-900 mb-2">📊 Cálculo do Valor Esperado:</div>
                      <div className="grid md:grid-cols-2 gap-2 text-gray-600">
                        <div>({formatPercent(rifa.chancePrincipal)} × {formatZeny(rifa.valorPrincipal)}) = {formatZeny((rifa.chancePrincipal / 100) * rifa.valorPrincipal)}</div>
                        <div>({formatPercent(rifa.chanceConsolacao)} × {formatZeny(rifa.valorConsolacao)}) = {formatZeny((rifa.chanceConsolacao / 100) * rifa.valorConsolacao)}</div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 font-medium">
                        Valor Esperado: {formatZeny(rifa.valorEsperado)} | 
                        Custo: {formatZeny(rifa.preco)} | 
                        <span className={rifa.lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {' '}Lucro: {rifa.lucro >= 0 ? '+' : ''}{formatZeny(rifa.lucro)} ({rifa.lucroPorcentagem.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-400 text-xs">
            {lastUpdate && <p>Preços atualizados: {lastUpdate.toLocaleString('pt-BR')}</p>}
            <p className="mt-1">⚠️ Valores baseados em preços de mercado - podem variar</p>
            <p className="mt-1">💡 "Lucro Garantido" = prêmio de consolação já paga o custo</p>
          </div>
        </div>
      </div>
    </ToolsLayout>
  )
}
