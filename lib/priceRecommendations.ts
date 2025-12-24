/**
 * Sistema de Recomendações Inteligentes de Preços
 * Usa análise de tendências e padrões para sugerir compra/venda
 */

export interface PriceRecommendation {
  itemName: string
  currentPrice: number
  recommendation: 'comprar' | 'vender' | 'aguardar'
  confidence: number // 0-100
  reasons: string[]
  targetPrice?: number
  timeframe?: string
}

export interface PriceHistory {
  date: string
  price: number
}

/**
 * Analisa histórico de preços e gera recomendação
 */
export function analyzePriceAndRecommend(
  itemName: string,
  currentPrice: number,
  history: PriceHistory[]
): PriceRecommendation {
  if (history.length < 7) {
    return {
      itemName,
      currentPrice,
      recommendation: 'aguardar',
      confidence: 30,
      reasons: ['Dados insuficientes para análise confiável']
    }
  }

  const reasons: string[] = []
  let recommendationScore = 0 // Positivo = comprar, Negativo = vender

  // 1. Análise de Tendência (últimos 7 dias vs últimos 30 dias)
  const last7Days = history.slice(-7)
  const last30Days = history.slice(-30)
  
  const avg7 = calculateAverage(last7Days.map(h => h.price))
  const avg30 = calculateAverage(last30Days.map(h => h.price))
  
  if (avg7 < avg30 * 0.9) {
    recommendationScore += 2
    reasons.push(`Preço 10%+ abaixo da média de 30 dias (${avg30.toFixed(0)}kk)`)
  } else if (avg7 > avg30 * 1.1) {
    recommendationScore -= 2
    reasons.push(`Preço 10%+ acima da média de 30 dias (${avg30.toFixed(0)}kk)`)
  }

  // 2. Análise de Volatilidade
  const volatility = calculateVolatility(history.map(h => h.price))
  if (volatility > 0.2) {
    recommendationScore -= 1
    reasons.push('Alta volatilidade detectada - risco elevado')
  }

  // 3. Análise de Momentum (últimos 3 dias)
  const last3Days = history.slice(-3)
  const momentum = calculateMomentum(last3Days.map(h => h.price))
  
  if (momentum > 0.05) {
    recommendationScore -= 1
    reasons.push('Tendência de alta recente - pode estar no pico')
  } else if (momentum < -0.05) {
    recommendationScore += 1
    reasons.push('Tendência de baixa recente - oportunidade de compra')
  }

  // 4. Análise de Mínimo/Máximo Histórico
  const historicalPrices = history.map(h => h.price)
  const minPrice = Math.min(...historicalPrices)
  const maxPrice = Math.max(...historicalPrices)
  const priceRange = maxPrice - minPrice

  if (currentPrice < minPrice + priceRange * 0.2) {
    recommendationScore += 2
    reasons.push(`Próximo do mínimo histórico (${minPrice}kk)`)
  } else if (currentPrice > maxPrice - priceRange * 0.2) {
    recommendationScore -= 2
    reasons.push(`Próximo do máximo histórico (${maxPrice}kk)`)
  }

  // 5. Análise de Suporte e Resistência
  const support = findSupport(historicalPrices)
  const resistance = findResistance(historicalPrices)

  if (currentPrice <= support * 1.05) {
    recommendationScore += 1
    reasons.push(`Próximo do nível de suporte (${support}kk)`)
  } else if (currentPrice >= resistance * 0.95) {
    recommendationScore -= 1
    reasons.push(`Próximo do nível de resistência (${resistance}kk)`)
  }

  // Determinar recomendação final
  let recommendation: 'comprar' | 'vender' | 'aguardar'
  let confidence: number
  let targetPrice: number | undefined
  let timeframe: string | undefined

  if (recommendationScore >= 3) {
    recommendation = 'comprar'
    confidence = Math.min(70 + recommendationScore * 5, 95)
    targetPrice = Math.round(currentPrice * 1.15) // Alvo 15% acima
    timeframe = '7-14 dias'
    reasons.push(`✅ Forte oportunidade de compra identificada`)
  } else if (recommendationScore <= -3) {
    recommendation = 'vender'
    confidence = Math.min(70 + Math.abs(recommendationScore) * 5, 95)
    reasons.push(`⚠️ Momento favorável para venda`)
  } else {
    recommendation = 'aguardar'
    confidence = 50 - Math.abs(recommendationScore) * 5
    reasons.push('Mercado indefinido - aguarde sinais mais claros')
  }

  return {
    itemName,
    currentPrice,
    recommendation,
    confidence,
    reasons,
    targetPrice,
    timeframe
  }
}

function calculateAverage(prices: number[]): number {
  return prices.reduce((sum, p) => sum + p, 0) / prices.length
}

function calculateVolatility(prices: number[]): number {
  const avg = calculateAverage(prices)
  const squaredDiffs = prices.map(p => Math.pow(p - avg, 2))
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / prices.length
  const stdDev = Math.sqrt(variance)
  return stdDev / avg // Coeficiente de variação
}

function calculateMomentum(prices: number[]): number {
  if (prices.length < 2) return 0
  const firstPrice = prices[0]
  const lastPrice = prices[prices.length - 1]
  return (lastPrice - firstPrice) / firstPrice
}

function findSupport(prices: number[]): number {
  // Simplificado: retorna o percentil 25
  const sorted = [...prices].sort((a, b) => a - b)
  const index = Math.floor(sorted.length * 0.25)
  return sorted[index]
}

function findResistance(prices: number[]): number {
  // Simplificado: retorna o percentil 75
  const sorted = [...prices].sort((a, b) => a - b)
  const index = Math.floor(sorted.length * 0.75)
  return sorted[index]
}

/**
 * Gera múltiplas recomendações para uma lista de itens
 */
export function generateBulkRecommendations(
  items: Array<{ name: string; currentPrice: number; history: PriceHistory[] }>
): PriceRecommendation[] {
  return items
    .map(item => analyzePriceAndRecommend(item.name, item.currentPrice, item.history))
    .sort((a, b) => {
      // Ordenar por confiança e recomendação
      if (a.recommendation === 'comprar' && b.recommendation !== 'comprar') return -1
      if (a.recommendation !== 'comprar' && b.recommendation === 'comprar') return 1
      return b.confidence - a.confidence
    })
}

