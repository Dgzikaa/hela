'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/app/components/Card'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { ToolsLayout } from '@/app/components/ToolsLayout'

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

interface MarketPrice {
  item_key: string
  item_name: string
  item_id: number
  price: number
  sellers: number
  updated_at: string
}

interface RunaPrice {
  runa_id: number
  runa_name: string
  price: number
  sellers: number
  updated_at: string
}

const formatZeny = (value: number): string => {
  if (value >= 1000000000) return (value / 1000000000).toFixed(2) + 'B'
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return Math.round(value / 1000) + 'K'
  return value.toLocaleString('pt-BR')
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Categorias de itens
const CATEGORIAS = {
  'Pós de Meteorita': ['poEscarlate', 'poSolar', 'poVerdejante', 'poCeleste', 'poOceanica', 'poCrepuscular'],
  'Almas & Materiais': ['almaSombria', 'desmembrador', 'auraMente'],
  'Bençãos': ['bencaoFerreiro', 'bencaoMestreFerreiro'],
  'Caixa Somatologia': ['mantoAbstrato', 'livroPerverso', 'garraFerro', 'jackEstripadora', 'mascaraNobreza', 'livroAmaldicoado', 'quepeGeneral', 'chapeuMaestro', 'botasCapricornio', 'palhetaElunium', 'luvasCorrida'],
}

export default function PrecosPage() {
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [runas, setRunas] = useState<RunaPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategoria, setExpandedCategoria] = useState<string | null>('Pós de Meteorita')
  const [showRunas, setShowRunas] = useState(false)
  
  useEffect(() => {
    fetchPrices()
  }, [])
  
  const fetchPrices = async () => {
    setLoading(true)
    try {
      const [pricesRes, runasRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/market_prices?select=*&order=item_name`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }),
        fetch(`${SUPABASE_URL}/rest/v1/runa_prices?select=*&order=price.desc`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        })
      ])
      
      if (pricesRes.ok) {
        const data = await pricesRes.json()
        setPrices(data)
      }
      
      if (runasRes.ok) {
        const data = await runasRes.json()
        setRunas(data)
      }
    } catch (err) {
      console.error('Erro ao buscar preços:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // Última atualização
  const lastUpdate = useMemo(() => {
    if (prices.length === 0) return null
    const dates = prices.map(p => new Date(p.updated_at).getTime())
    return new Date(Math.max(...dates))
  }, [prices])
  
  // Filtrar por busca
  const filteredPrices = useMemo(() => {
    if (!searchTerm) return prices
    return prices.filter(p => 
      p.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.item_key.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [prices, searchTerm])
  
  // Filtrar runas
  const filteredRunas = useMemo(() => {
    if (!searchTerm) return runas
    return runas.filter(r => 
      r.runa_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [runas, searchTerm])
  
  // Média das runas
  const avgRuna = useMemo(() => {
    if (runas.length === 0) return 0
    return Math.round(runas.reduce((acc, r) => acc + r.price, 0) / runas.length)
  }, [runas])

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gray-50 p-2 md:p-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-gray-900">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                Preços do Mercado
              </h1>
              <p className="text-gray-500 mt-1">Preços atualizados do RagnaTales Market</p>
            </div>
            
            <button
              onClick={fetchPrices}
              disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
        
        {/* Última atualização */}
        {lastUpdate && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Clock className="w-4 h-4" />
            Última atualização: {lastUpdate.toLocaleString('pt-BR')}
          </div>
        )}
        
        {/* Busca */}
        <Card className="p-4 bg-white border-gray-200 shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </Card>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">Total Itens</p>
            <p className="text-2xl font-bold text-gray-900">{prices.length}</p>
          </Card>
          
          <Card className="p-4 bg-white border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">Total Runas</p>
            <p className="text-2xl font-bold text-gray-900">{runas.length}</p>
          </Card>
          
          <Card className="p-4 bg-white border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">Média Runas</p>
            <p className="text-2xl font-bold text-purple-400">{formatZeny(avgRuna)}</p>
          </Card>
          
          <Card className="p-4 bg-white border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">Alma Sombria</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatZeny(prices.find(p => p.item_key === 'almaSombria')?.price || 0)}
            </p>
          </Card>
        </div>
        
        {/* Lista de Preços por Categoria */}
        <div className="space-y-4">
          {Object.entries(CATEGORIAS).map(([categoria, keys]) => {
            const itensCategoria = filteredPrices.filter(p => keys.includes(p.item_key))
            if (itensCategoria.length === 0 && searchTerm) return null
            
            return (
              <Card key={categoria} className="bg-white border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedCategoria(expandedCategoria === categoria ? null : categoria)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="font-bold text-gray-900">{categoria}</h2>
                    <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-300">
                      {itensCategoria.length} itens
                    </span>
                  </div>
                  {expandedCategoria === categoria ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedCategoria === categoria && (
                  <div className="border-t border-gray-200/50">
                    <div className="divide-y divide-slate-700/30">
                      {itensCategoria.map(item => (
                        <div key={item.item_key} className="p-4 flex items-center justify-between hover:bg-gray-100/30">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://api.ragnatales.com.br/database/item/icon?nameid=${item.item_id}`}
                              alt={item.item_name}
                              className="w-8 h-8 object-contain"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <div>
                              <p className="font-medium text-gray-900">{item.item_name}</p>
                              <p className="text-xs text-gray-500">{item.sellers} vendedores</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-emerald-400 text-lg">{formatZeny(item.price)}</p>
                            <p className="text-xs text-gray-400">{formatDate(item.updated_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
          
          {/* Runas */}
          <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowRunas(!showRunas)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-gray-900">🧬 Runas Somatológicas</h2>
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                  {filteredRunas.length} runas
                </span>
                <span className="text-xs text-gray-500">
                  Média: <span className="text-purple-400 font-medium">{formatZeny(avgRuna)}</span>
                </span>
              </div>
              {showRunas ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {showRunas && (
              <div className="border-t border-gray-200/50 max-h-96 overflow-y-auto">
                <div className="divide-y divide-slate-700/30">
                  {filteredRunas.map(runa => (
                    <div key={runa.runa_id} className="p-3 flex items-center justify-between hover:bg-gray-100/30">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{runa.runa_name}</p>
                        <p className="text-xs text-gray-500">{runa.sellers} vendedores</p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-bold ${runa.price > avgRuna ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {formatZeny(runa.price)}
                        </p>
                        {runa.price > avgRuna ? (
                          <span className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
                            <TrendingUp className="w-3 h-3" />
                            +{Math.round(((runa.price - avgRuna) / avgRuna) * 100)}%
                          </span>
                        ) : (
                          <span className="text-xs text-amber-400 flex items-center gap-1 justify-end">
                            <TrendingDown className="w-3 h-3" />
                            {Math.round(((runa.price - avgRuna) / avgRuna) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
        
          {/* Footer */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>Preços sincronizados automaticamente pelo RagnaTales Watcher</p>
            <a 
              href="https://ragnatales.com.br/market" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 mt-2"
            >
              Ver no Market oficial
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </ToolsLayout>
  )
}

