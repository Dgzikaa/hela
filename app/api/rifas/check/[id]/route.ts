import { NextResponse } from 'next/server'

const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

// Dados das rifas
interface RifaItem {
  name: string
  quantity: number
  key: string
}

interface RifaData {
  id: number
  preco: number
  premioPrincipal: RifaItem
  chancePrincipal: number
  premioConsolacao: RifaItem
  chanceConsolacao: number
  caixaPrincipal?: string
  caixaConsolacao?: string
}

const RIFAS: RifaData[] = [
  {
    id: 1,
    preco: 180000,
    premioPrincipal: { name: 'Caixa de Consumíveis da Rifa A', quantity: 1, key: 'caixaConsumiveisA' },
    chancePrincipal: 3,
    premioConsolacao: { name: 'Caixa de Consumíveis da Rifa B', quantity: 1, key: 'caixaConsumiveisB' },
    chanceConsolacao: 97,
  },
  {
    id: 2,
    preco: 180000,
    premioPrincipal: { name: 'Caixa de Consumíveis da Rifa C', quantity: 1, key: 'caixaConsumiveisC' },
    chancePrincipal: 3,
    premioConsolacao: { name: 'Caixa de Consumíveis da Rifa D', quantity: 1, key: 'caixaConsumiveisD' },
    chanceConsolacao: 97,
  },
  {
    id: 3,
    preco: 180000,
    premioPrincipal: { name: 'Caixa de Consumíveis da Rifa E', quantity: 1, key: 'caixaConsumiveisE' },
    chancePrincipal: 3,
    premioConsolacao: { name: 'Caixa de Consumíveis da Rifa F', quantity: 1, key: 'caixaConsumiveisF' },
    chanceConsolacao: 97,
  },
  {
    id: 4,
    preco: 180000,
    premioPrincipal: { name: 'Medicina Milagrosa', quantity: 10, key: 'medicinaMilagrosa' },
    chancePrincipal: 1,
    premioConsolacao: { name: 'Pergaminho do Éden', quantity: 25, key: 'pergaminhoEden' },
    chanceConsolacao: 99,
  },
  {
    id: 5,
    preco: 300000,
    premioPrincipal: { name: 'Espelho Convexo', quantity: 3, key: 'espelhoConvexo' },
    chancePrincipal: 1,
    premioConsolacao: { name: 'Amuleto de Ziegfried', quantity: 10, key: 'amuletoZiegfried' },
    chanceConsolacao: 99,
  },
  {
    id: 6,
    preco: 300000,
    premioPrincipal: { name: 'Caixa de Auxiliares Dourados A', quantity: 1, key: 'caixaAuxiliaresA' },
    chancePrincipal: 0.5,
    premioConsolacao: { name: 'Caixa de Conversores Etéreos', quantity: 1, key: 'caixaConversoresEtereos' },
    chanceConsolacao: 99.5,
  },
  {
    id: 7,
    preco: 300000,
    premioPrincipal: { name: 'Caixa de Consumíveis Dourados', quantity: 1, key: 'caixaConsumiveisDourados' },
    chancePrincipal: 0.5,
    premioConsolacao: { name: 'Doce de Elvira', quantity: 10, key: 'doceElvira' },
    chanceConsolacao: 99.5,
  },
  {
    id: 8,
    preco: 360000,
    premioPrincipal: { name: 'Poção de Guyak', quantity: 10, key: 'pocaoGuyak' },
    chancePrincipal: 1,
    premioConsolacao: { name: 'Poção do Vento', quantity: 20, key: 'pocaoVento' },
    chanceConsolacao: 99,
  },
  {
    id: 9,
    preco: 600000,
    premioPrincipal: { name: 'Salada de Frutas Tropicais', quantity: 20, key: 'saladaFrutasTropicais' },
    chancePrincipal: 2,
    premioConsolacao: { name: 'Trouxinha de Comidas Especiais', quantity: 2, key: 'trouxinhaComidas' },
    chanceConsolacao: 98,
  },
  {
    id: 10,
    preco: 300000,
    premioPrincipal: { name: 'Caixa de Munições Douradas', quantity: 1, key: 'caixaMunicoesDouradas' },
    chancePrincipal: 0.5,
    premioConsolacao: { name: 'Caixa de Conversores Elementais', quantity: 1, key: 'caixaConversoresElementais' },
    chanceConsolacao: 99.5,
  },
  {
    id: 11,
    preco: 300000,
    premioPrincipal: { name: 'Caixa de Auxiliares Dourados B', quantity: 1, key: 'caixaAuxiliaresB' },
    chancePrincipal: 0.5,
    premioConsolacao: { name: 'Caixa de Suprimentos de Classe', quantity: 1, key: 'caixaSuprimentosClasse' },
    chanceConsolacao: 99.5,
  },
  {
    id: 12,
    preco: 300000,
    premioPrincipal: { name: 'Caixa de Ingredientes Dourados', quantity: 1, key: 'caixaIngredientesDourados' },
    chancePrincipal: 0.5,
    premioConsolacao: { name: 'Caixa de Xaropes', quantity: 1, key: 'caixaXaropes' },
    chanceConsolacao: 99.5,
  },
  {
    id: 13,
    preco: 300000,
    premioPrincipal: { name: 'Poção Mental', quantity: 20, key: 'pocaoMental' },
    chancePrincipal: 3,
    premioConsolacao: { name: 'Incenso Queimado', quantity: 10, key: 'incensoQueimado' },
    chanceConsolacao: 97,
  },
  {
    id: 14,
    preco: 300000,
    premioPrincipal: { name: 'Pedra de Selamento Dourada', quantity: 1, key: 'pedraSelamentoDourada' },
    chancePrincipal: 0.03,
    premioConsolacao: { name: 'Caixa de Consumíveis da Rifa G', quantity: 1, key: 'caixaConsumiveisG' },
    chanceConsolacao: 99.97,
  },
]

// Caixas e seus itens
const CAIXAS: Record<string, { key: string, quantity: number }[]> = {
  caixaConsumiveisA: [
    { key: 'palitosBaunilha', quantity: 5 },
    { key: 'palitosLaranja', quantity: 5 },
  ],
  caixaConsumiveisB: [
    { key: 'pergaminhoEsquiva', quantity: 5 },
    { key: 'pocaoFurorFisico', quantity: 2 },
    { key: 'caliceIlusao', quantity: 5 },
  ],
  caixaConsumiveisC: [
    { key: 'palitosCassis', quantity: 5 },
    { key: 'palitosChocolate', quantity: 5 },
  ],
  caixaConsumiveisD: [
    { key: 'pocaoFurorMagico', quantity: 2 },
    { key: 'pocaoRegeneracao', quantity: 5 },
  ],
  caixaConsumiveisE: [
    { key: 'palitosLimao', quantity: 5 },
    { key: 'palitosMorango', quantity: 5 },
  ],
  caixaConsumiveisF: [
    { key: 'pergaminhoPrecisao', quantity: 5 },
    { key: 'acaraje', quantity: 3 },
    { key: 'abrasivo', quantity: 3 },
  ],
  caixaAuxiliaresA: [
    { key: 'frascosBombaDourado', quantity: 1 },
    { key: 'frascosRevestimentoDourado', quantity: 1 },
    { key: 'pedraDourada', quantity: 1 },
    { key: 'pergaminhoDourado', quantity: 1 },
    { key: 'gemaAmarelaDourada', quantity: 1 },
    { key: 'gemaVermelhoDourada', quantity: 1 },
    { key: 'gemaAzulDourada', quantity: 1 },
  ],
  caixaConversoresEtereos: [
    { key: 'conversorFantasma', quantity: 1 },
    { key: 'pergaminhoAspersio', quantity: 5 },
  ],
  caixaConsumiveisDourados: [
    { key: 'pocaoAgilidadeDourada', quantity: 1 },
    { key: 'panaceiaDourada', quantity: 1 },
    { key: 'doceElviraDourado', quantity: 1 },
    { key: 'folhaYggdrasilDourada', quantity: 1 },
    { key: 'pocaoAntiElementoDourada', quantity: 1 },
    { key: 'conversorRemovedorDourado', quantity: 1 },
  ],
  caixaMunicoesDouradas: [
    { key: 'kunaiDourada', quantity: 1 },
    { key: 'flechaDourada', quantity: 1 },
    { key: 'projetilDourado', quantity: 1 },
    { key: 'shurikenDourada', quantity: 1 },
    { key: 'capsulaDourada', quantity: 1 },
  ],
  caixaConversoresElementais: [
    { key: 'conversorAgua', quantity: 5 },
    { key: 'conversorFogo', quantity: 5 },
    { key: 'conversorTerra', quantity: 5 },
    { key: 'conversorVento', quantity: 5 },
    { key: 'conversorRemovedor', quantity: 5 },
  ],
  caixaAuxiliaresB: [
    { key: 'garrafaVenenoDourada', quantity: 1 },
    { key: 'kitToxinasDouradas', quantity: 1 },
    { key: 'bolsaFalsaZenysDourada', quantity: 1 },
    { key: 'armadilhaDourada', quantity: 1 },
    { key: 'esporoCogumeloDourado', quantity: 1 },
    { key: 'sementeSelvagemDourada', quantity: 1 },
    { key: 'sementeSanguessugaDourada', quantity: 1 },
  ],
  caixaSuprimentosClasse: [
    { key: 'garrafaVeneno', quantity: 5 },
    { key: 'frascoFogoGrego', quantity: 5 },
    { key: 'frascoAcido', quantity: 5 },
    { key: 'frascoRevestimento', quantity: 5 },
  ],
  caixaIngredientesDourados: [
    { key: 'tuboEnsaioDourado', quantity: 1 },
    { key: 'garrafaVaziaDourada', quantity: 1 },
    { key: 'garrafaPocaoDourada', quantity: 1 },
    { key: 'vasilhaMisturaDourada', quantity: 1 },
  ],
  caixaXaropes: [
    { key: 'xaropeAzul', quantity: 20 },
    { key: 'xaropeVermelho', quantity: 10 },
    { key: 'xaropeBranco', quantity: 10 },
    { key: 'xaropeAmarelo', quantity: 10 },
  ],
  caixaConsumiveisG: [
    { key: 'dogao', quantity: 2 },
    { key: 'bencaoTyr', quantity: 2 },
    { key: 'caixinhaNoiteFeliz', quantity: 2 },
    { key: 'sucoGato', quantity: 2 },
  ],
  trouxinhaComidas: [
    { key: 'linguaVapor', quantity: 1 },
    { key: 'escorpioesVapor', quantity: 1 },
    { key: 'cozidoImortal', quantity: 1 },
    { key: 'coquetelSoproDragao', quantity: 1 },
    { key: 'tonicoHwergelmir', quantity: 1 },
    { key: 'noveCaudasCozidas', quantity: 1 },
  ],
}

async function fetchPrices(): Promise<Record<string, number>> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rifa_prices?select=item_key,price,avg_price`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    })
    
    if (!response.ok) return {}
    
    const data = await response.json()
    const prices: Record<string, number> = {}
    
    for (const item of data) {
      // Usa avg_price se disponível, senão price
      prices[item.item_key] = item.avg_price || item.price || 0
    }
    
    return prices
  } catch {
    return {}
  }
}

function calculateCaixaValue(caixaKey: string, prices: Record<string, number>): number {
  const items = CAIXAS[caixaKey]
  if (!items) return 0
  
  let total = 0
  for (const item of items) {
    const price = prices[item.key] || 0
    total += price * item.quantity
  }
  return total
}

function calculateItemValue(item: RifaItem, prices: Record<string, number>): number {
  // Se for uma caixa, calcula valor dos itens dentro
  if (CAIXAS[item.key]) {
    return calculateCaixaValue(item.key, prices)
  }
  // Se for item único
  const price = prices[item.key] || 0
  return price * item.quantity
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rifaId = parseInt(id)
  
  if (isNaN(rifaId) || rifaId < 1 || rifaId > 14) {
    return NextResponse.json(
      { error: 'ID da rifa inválido. Use 1-14.' },
      { status: 400 }
    )
  }
  
  const rifa = RIFAS.find(r => r.id === rifaId)
  if (!rifa) {
    return NextResponse.json(
      { error: 'Rifa não encontrada' },
      { status: 404 }
    )
  }
  
  // Busca preços do Supabase
  const prices = await fetchPrices()
  const hasAnyPrice = Object.values(prices).some(p => p > 0)
  
  // Calcula valores
  const valorPrincipal = calculateItemValue(rifa.premioPrincipal, prices)
  const valorConsolacao = calculateItemValue(rifa.premioConsolacao, prices)
  
  // Valor esperado = (chance_principal * valor_principal + chance_consolacao * valor_consolacao) / 100
  const valorEsperado = (rifa.chancePrincipal * valorPrincipal + rifa.chanceConsolacao * valorConsolacao) / 100
  
  // Lucro esperado
  const lucroEsperado = valorEsperado - rifa.preco
  
  // Lucro se pegar só consolação
  const lucroConsolacao = valorConsolacao - rifa.preco
  
  // Vale a pena se:
  // 1. Lucro esperado > 0, OU
  // 2. Lucro de consolação > 0 (lucro garantido)
  const lucroGarantido = lucroConsolacao > 0
  const valeAPena = lucroEsperado > 0 || lucroGarantido
  
  return NextResponse.json({
    rifa_id: rifaId,
    preco: rifa.preco,
    premio_principal: {
      nome: rifa.premioPrincipal.name,
      quantidade: rifa.premioPrincipal.quantity,
      valor_total: valorPrincipal,
      chance: rifa.chancePrincipal,
    },
    premio_consolacao: {
      nome: rifa.premioConsolacao.name,
      quantidade: rifa.premioConsolacao.quantity,
      valor_total: valorConsolacao,
      chance: rifa.chanceConsolacao,
    },
    calculos: {
      valor_esperado: Math.round(valorEsperado),
      lucro_esperado: Math.round(lucroEsperado),
      lucro_consolacao: Math.round(lucroConsolacao),
      lucro_garantido: lucroGarantido,
    },
    vale_a_pena: valeAPena,
    tem_precos: hasAnyPrice,
    motivo: !hasAnyPrice 
      ? 'Sem preços cadastrados'
      : valeAPena 
        ? (lucroGarantido ? 'Lucro garantido na consolação!' : 'Valor esperado positivo')
        : 'Custo maior que valor esperado',
  })
}
