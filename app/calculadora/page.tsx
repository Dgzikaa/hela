'use client'

import { useState, useEffect } from 'react'

// Dados dos Tesouros
const TREASURES = {
  escarlate: {
    name: "Tesouro Escarlate",
    color: "#DC143C",
    costItemId: 1000398,
    costAmount: 100,
    drops: [
      { name: "Compêndio Aleatório", chance: 100, quantity: 3, avgPrice: 500000 },
      { name: "Compêndio do Espelho Quebrado", chance: 100, quantity: 1, avgPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, avgPrice: 50000 },
      { name: "Bênção do Ferreiro", chance: 10, quantity: 1, avgPrice: 5000000 },
      { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, avgPrice: 50000000 },
      { name: "Espírito Poderoso [1]", chance: 2, quantity: 1, fixedPrice: 2200000000 },
      { name: "Caixa da Força Expedicionária", chance: 1, quantity: 1, fixedPrice: 3500000000 }
    ]
  },
  solar: {
    name: "Tesouro Solar",
    color: "#FFD700",
    costItemId: 1000399,
    costAmount: 100,
    drops: [
      { name: "Compêndio Aleatório", chance: 100, quantity: 3, avgPrice: 500000 },
      { name: "Compêndio do Espelho Fragmentado", chance: 100, quantity: 1, avgPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, avgPrice: 50000 },
      { name: "Bênção do Ferreiro", chance: 10, quantity: 1, avgPrice: 5000000 },
      { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, avgPrice: 50000000 },
      { name: "Talismã Yin Yang", chance: 2, quantity: 1, fixedPrice: 1000000000 },
      { name: "Caixa da Força Expedicionária", chance: 1, quantity: 1, fixedPrice: 3500000000 }
    ]
  },
  verdejante: {
    name: "Tesouro Verdejante",
    color: "#228B22",
    costItemId: 1000400,
    costAmount: 100,
    drops: [
      { name: "Compêndio Aleatório", chance: 100, quantity: 3, avgPrice: 500000 },
      { name: "Compêndio do Espelho Despedaçado", chance: 100, quantity: 1, avgPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, avgPrice: 50000 },
      { name: "Bênção do Ferreiro", chance: 10, quantity: 1, avgPrice: 5000000 },
      { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, avgPrice: 50000000 },
      { name: "Orbe de Yokai", chance: 2, quantity: 1, fixedPrice: 2000000000 },
      { name: "Caixa da Força Expedicionária", chance: 1, quantity: 1, fixedPrice: 3500000000 }
    ]
  },
  celeste: {
    name: "Tesouro Celeste",
    color: "#87CEEB",
    costItemId: 1000401,
    costAmount: 100,
    drops: [
      { name: "Compêndio Aleatório", chance: 100, quantity: 3, avgPrice: 500000 },
      { name: "Compêndio da Resistência Elemental", chance: 100, quantity: 1, avgPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, avgPrice: 50000 },
      { name: "Bênção do Ferreiro", chance: 10, quantity: 1, avgPrice: 5000000 },
      { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, avgPrice: 50000000 },
      { name: "Garra de Prata", chance: 2, quantity: 1, fixedPrice: 2000000000 },
      { name: "Caixa da Força Expedicionária", chance: 1, quantity: 1, fixedPrice: 3500000000 }
    ]
  },
  oceanico: {
    name: "Tesouro Oceânico",
    color: "#0077BE",
    costItemId: 1000402,
    costAmount: 100,
    drops: [
      { name: "Compêndio Aleatório", chance: 100, quantity: 3, avgPrice: 500000 },
      { name: "Compêndio da Magia Absoluta", chance: 100, quantity: 1, avgPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, avgPrice: 50000 },
      { name: "Bênção do Ferreiro", chance: 10, quantity: 1, avgPrice: 5000000 },
      { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, avgPrice: 50000000 },
      { name: "Espírito Astuto [1]", chance: 2, quantity: 1, fixedPrice: 2800000000 }
    ]
  },
  crepuscular: {
    name: "Tesouro Crepuscular",
    color: "#9370DB",
    costItemId: 1000403,
    costAmount: 100,
    drops: [
      { name: "Compêndio Aleatório", chance: 100, quantity: 3, avgPrice: 500000 },
      { name: "Compêndio da Astúcia do Atirador", chance: 100, quantity: 1, avgPrice: 800000 },
      { name: "Desmembrador Químico", chance: 70, quantity: 1, avgPrice: 50000 },
      { name: "Bênção do Ferreiro", chance: 10, quantity: 1, avgPrice: 5000000 },
      { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, avgPrice: 50000000 },
      { name: "Espírito Ligeiro [1]", chance: 2, quantity: 1, fixedPrice: 2200000000 },
      { name: "Caixa da Força Expedicionária", chance: 1, quantity: 1, fixedPrice: 3500000000 }
    ]
  }
}

// Preços padrão dos Pós de Meteorita (editáveis)
const DEFAULT_METEORITE_PRICES: Record<number, number> = {
  1000398: 140000, // Escarlate
  1000399: 140000, // Solar
  1000400: 165000, // Verdejante
  1000401: 145000, // Celeste
  1000402: 210000, // Oceânica
  1000403: 140000, // Crepuscular
}

// Dados da Runa Somatológica
const SOMATOLOGY = {
  name: "Runa Somatológica",
  color: "#8B008B",
  costPerCondensed: 999,
  condensedPerRune: 10,
  totalCost: 9990,
  avgRunaPrice: 15000000, // Média das runas (editável)
  drops: [
    { name: "Runa Somatológica Aleatória", chance: 100, quantity: 1 },
    { name: "Caixa de Somatologia", chance: 10, quantity: 1, fixedPrice: 1000000000 },
    { name: "Aura da Mente Corrompida", chance: 1, quantity: 1, fixedPrice: 5000000000 }
  ]
}

function formatZeny(value: number): string {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + 'B'
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return Math.round(value / 1000) + 'K'
  }
  return value.toLocaleString('pt-BR')
}

interface TreasureResult {
  name: string
  color: string
  totalCost: number
  expectedValue: number
  profit: number
  profitPercent: number
  isWorthIt: boolean
  drops: Array<{
    name: string
    chance: number
    quantity: number
    price: number
    expectedValue: number
  }>
}

export default function CalculadoraPage() {
  const [meteoritePrices, setMeteoritePrices] = useState(DEFAULT_METEORITE_PRICES)
  const [almaPrice, setAlmaPrice] = useState(9500)
  const [avgRunaPrice, setAvgRunaPrice] = useState(15000000)
  const [results, setResults] = useState<Record<string, TreasureResult>>({})
  const [somatologyResult, setSomatologyResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'tesouros' | 'runas'>('tesouros')

  // Calcula resultados dos tesouros
  useEffect(() => {
    const newResults: Record<string, TreasureResult> = {}

    for (const [key, treasure] of Object.entries(TREASURES)) {
      const costPerUnit = meteoritePrices[treasure.costItemId] || 150000
      const totalCost = costPerUnit * treasure.costAmount

      let expectedValue = 0
      const dropDetails = treasure.drops.map(drop => {
        const price = drop.fixedPrice || drop.avgPrice || 0
        const dropValue = (drop.chance / 100) * price * drop.quantity
        expectedValue += dropValue
        return {
          name: drop.name,
          chance: drop.chance,
          quantity: drop.quantity,
          price: price,
          expectedValue: dropValue
        }
      })

      newResults[key] = {
        name: treasure.name,
        color: treasure.color,
        totalCost,
        expectedValue,
        profit: expectedValue - totalCost,
        profitPercent: totalCost > 0 ? ((expectedValue / totalCost) - 1) * 100 : 0,
        isWorthIt: expectedValue > totalCost,
        drops: dropDetails
      }
    }

    setResults(newResults)
  }, [meteoritePrices])

  // Calcula resultado das runas
  useEffect(() => {
    const totalCost = almaPrice * SOMATOLOGY.totalCost
    
    let expectedValue = avgRunaPrice // 100% de chance de uma runa
    expectedValue += 0.10 * 1000000000 // 10% Caixa de Somatologia
    expectedValue += 0.01 * 5000000000 // 1% Aura

    setSomatologyResult({
      totalCost,
      expectedValue,
      profit: expectedValue - totalCost,
      profitPercent: totalCost > 0 ? ((expectedValue / totalCost) - 1) * 100 : 0,
      isWorthIt: expectedValue > totalCost
    })
  }, [almaPrice, avgRunaPrice])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🎰 Calculadora Tigrinho
          </h1>
          <p className="text-gray-400 mt-2">Descubra se vale a pena abrir tesouros e runas</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('tesouros')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'tesouros'
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            💎 Tesouros de Meteorita
          </button>
          <button
            onClick={() => setActiveTab('runas')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'runas'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🧬 Runas Somatológicas
          </button>
        </div>

        {/* Tesouros Tab */}
        {activeTab === 'tesouros' && (
          <div>
            {/* Preços editáveis */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">💰 Preços dos Pós de Meteorita</h3>
              <p className="text-gray-400 text-sm mb-4">Edite os preços conforme o mercado atual</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries({
                  1000398: 'Escarlate',
                  1000399: 'Solar',
                  1000400: 'Verdejante',
                  1000401: 'Celeste',
                  1000402: 'Oceânica',
                  1000403: 'Crepuscular'
                }).map(([id, name]) => (
                  <div key={id} className="flex flex-col">
                    <label className="text-sm text-gray-400 mb-1">{name}</label>
                    <input
                      type="number"
                      value={meteoritePrices[Number(id)]}
                      onChange={(e) => setMeteoritePrices(prev => ({
                        ...prev,
                        [Number(id)]: Number(e.target.value) || 0
                      }))}
                      className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div className="bg-gray-800/30 rounded-xl p-6 mb-8 border border-yellow-500/30">
              <h3 className="text-lg font-bold text-yellow-400 mb-2">📊 Como funciona o cálculo?</h3>
              <p className="text-gray-400">
                <strong>Valor Esperado</strong> = Σ(chance × preço × quantidade)<br/>
                Se <span className="text-green-400">Valor Esperado &gt; Custo</span> → Vale a pena!<br/>
                Se <span className="text-red-400">Valor Esperado &lt; Custo</span> → Não vale!
              </p>
            </div>

            {/* Grid de tesouros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(results).map(([key, treasure]) => (
                <div
                  key={key}
                  className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-all"
                >
                  <div 
                    className="p-4 flex justify-between items-center"
                    style={{ background: `linear-gradient(135deg, ${treasure.color}22, transparent)` }}
                  >
                    <span className="font-bold text-lg" style={{ color: treasure.color }}>
                      {treasure.name}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      treasure.isWorthIt 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {treasure.isWorthIt ? '✓ VALE' : '✗ NÃO VALE'}
                    </span>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-400">Custo</div>
                        <div className="text-orange-400 font-bold">{formatZeny(treasure.totalCost)}z</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Esperado</div>
                        <div className="text-yellow-400 font-bold">{formatZeny(treasure.expectedValue)}z</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Lucro</div>
                        <div className={`font-bold ${treasure.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {treasure.profit >= 0 ? '+' : ''}{formatZeny(treasure.profit)}z
                        </div>
                      </div>
                    </div>

                    <details className="text-sm">
                      <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
                        📋 Ver drops
                      </summary>
                      <div className="mt-2 space-y-1">
                        {treasure.drops.map((drop, i) => (
                          <div key={i} className="flex justify-between text-gray-500">
                            <span>{drop.quantity}x {drop.name}</span>
                            <span>{drop.chance}%</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Runas Tab */}
        {activeTab === 'runas' && (
          <div>
            {/* Preços editáveis */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4">💰 Preços (Edite conforme mercado)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Preço da Alma Sombria</label>
                  <input
                    type="number"
                    value={almaPrice}
                    onChange={(e) => setAlmaPrice(Number(e.target.value) || 0)}
                    className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white w-full"
                  />
                  <span className="text-xs text-gray-500">Total: {(9990).toLocaleString()} almas = {formatZeny(almaPrice * 9990)}z</span>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Média das Runas</label>
                  <input
                    type="number"
                    value={avgRunaPrice}
                    onChange={(e) => setAvgRunaPrice(Number(e.target.value) || 0)}
                    className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white w-full"
                  />
                  <span className="text-xs text-gray-500">Consulte no market as 30 runas</span>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-gray-800/30 rounded-xl p-6 mb-8 border border-purple-500/30">
              <h3 className="text-lg font-bold text-purple-400 mb-2">🧬 Como funciona?</h3>
              <p className="text-gray-400">
                <strong>999 Alma Sombria</strong> → 1 Alma Condensada<br/>
                <strong>10 Almas Condensadas</strong> → 1 Runa Somatológica<br/>
                <strong>Total:</strong> 9.990 Almas Sombrias por abertura<br/><br/>
                <strong>Drops:</strong> 100% Runa aleatória + 10% Caixa + 1% Aura
              </p>
            </div>

            {/* Resultado */}
            {somatologyResult && (
              <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-purple-500/30 max-w-2xl mx-auto">
                <div className="p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 flex justify-between items-center">
                  <span className="font-bold text-2xl text-purple-300">🧬 Runa Somatológica</span>
                  <span className={`px-4 py-2 rounded-full font-bold ${
                    somatologyResult.isWorthIt 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {somatologyResult.isWorthIt ? '✓ VALE A PENA' : '✗ NÃO VALE'}
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Custo (9.990 Almas)</div>
                      <div className="text-2xl text-orange-400 font-bold">{formatZeny(somatologyResult.totalCost)}z</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Valor Esperado</div>
                      <div className="text-2xl text-yellow-400 font-bold">{formatZeny(somatologyResult.expectedValue)}z</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400">Lucro/Prejuízo</div>
                      <div className={`text-2xl font-bold ${somatologyResult.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {somatologyResult.profit >= 0 ? '+' : ''}{formatZeny(somatologyResult.profit)}z
                      </div>
                      <div className="text-sm text-gray-500">
                        ({somatologyResult.profitPercent >= 0 ? '+' : ''}{somatologyResult.profitPercent.toFixed(1)}%)
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-purple-400 font-bold mb-3">📊 Composição do Valor Esperado:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">100% - Runa aleatória</span>
                        <span className="text-white">{formatZeny(avgRunaPrice)}z</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">10% - Caixa de Somatologia (~1B)</span>
                        <span className="text-white">+{formatZeny(0.10 * 1000000000)}z</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">1% - Aura da Mente Corrompida (~5B)</span>
                        <span className="text-white">+{formatZeny(0.01 * 5000000000)}z</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>⚠️ Valores são estatísticos. Você pode ter azar ou sorte!</p>
          <p className="mt-2">
            <a href="/" className="text-purple-400 hover:text-purple-300">← Voltar para Hela Carrys</a>
          </p>
        </div>
      </div>
    </div>
  )
}

