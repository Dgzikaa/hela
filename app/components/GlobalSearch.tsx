'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Search, 
  X, 
  Clock, 
  User, 
  Calendar, 
  Users, 
  DollarSign,
  Package,
  TrendingUp,
  Filter,
  History
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/app/hooks/useToast'

interface SearchResult {
  id: string
  type: 'cliente' | 'pedido' | 'jogador' | 'item'
  title: string
  subtitle?: string
  description?: string
  metadata?: string
  url: string
  icon: React.ReactNode
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

const SEARCH_HISTORY_KEY = 'hela_search_history'
const MAX_HISTORY = 10

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    clientes: true,
    pedidos: true,
    jogadores: true,
    itens: true
  })
  
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { error } = useToast()

  // Carregar histórico de buscas
  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // Focus no input quando abrir
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    } else {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Busca com debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, filters])

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...Object.entries(filters).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value.toString()
        }), {})
      })

      const res = await fetch(`/api/search?${params}`)
      if (res.ok) {
        const data = await res.json()
        setResults(mapResults(data))
      }
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setLoading(false)
    }
  }

  const mapResults = (data: any): SearchResult[] => {
    const mapped: SearchResult[] = []

    // Clientes
    data.clientes?.forEach((cliente: any) => {
      mapped.push({
        id: `cliente-${cliente.id}`,
        type: 'cliente',
        title: cliente.discordUsername,
        subtitle: cliente.nome || 'Cliente',
        description: `${cliente.totalCompras} compras • ${cliente.tier}`,
        metadata: `Último contato: ${cliente.ultimoContato ? new Date(cliente.ultimoContato).toLocaleDateString('pt-BR') : 'Nunca'}`,
        url: `/ferramentas/crm?cliente=${cliente.id}`,
        icon: <User className="w-5 h-5 text-blue-500" />
      })
    })

    // Pedidos
    data.pedidos?.forEach((pedido: any) => {
      mapped.push({
        id: `pedido-${pedido.id}`,
        type: 'pedido',
        title: `Pedido #${pedido.id} - ${pedido.nomeCliente}`,
        subtitle: pedido.itens?.map((i: any) => i.boss.nome).join(', ') || 'Bosses',
        description: `${pedido.status} • ${pedido.valorTotal}kk`,
        metadata: pedido.dataAgendada ? new Date(pedido.dataAgendada).toLocaleDateString('pt-BR') : 'Não agendado',
        url: `/carrys/agendamento?pedido=${pedido.id}`,
        icon: <Calendar className="w-5 h-5 text-purple-500" />
      })
    })

    // Jogadores
    data.jogadores?.forEach((jogador: any) => {
      mapped.push({
        id: `jogador-${jogador.id}`,
        type: 'jogador',
        title: jogador.nick,
        subtitle: jogador.categorias || 'Jogador',
        description: `${jogador.totalCarrys} carrys • ${jogador.totalGanho}kk ganho`,
        metadata: jogador.ativo ? 'Ativo' : 'Inativo',
        url: `/configuracoes/membros?jogador=${jogador.id}`,
        icon: <Users className="w-5 h-5 text-green-500" />
      })
    })

    // Itens (se implementado no futuro)
    data.itens?.forEach((item: any) => {
      mapped.push({
        id: `item-${item.id}`,
        type: 'item',
        title: item.nome,
        subtitle: item.categoria || 'Item',
        description: `${item.preco}z`,
        url: `/ferramentas/precos?item=${item.id}`,
        icon: <Package className="w-5 h-5 text-orange-500" />
      })
    })

    return mapped
  }

  const saveToHistory = (searchQuery: string) => {
    const updated = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, MAX_HISTORY)
    setSearchHistory(updated)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  }

  const handleSelect = (result: SearchResult) => {
    saveToHistory(query)
    router.push(result.url)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 z-[80] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[600px] flex flex-col">
        {/* Header com Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar clientes, pedidos, jogadores..."
              className="flex-1 bg-transparent border-none outline-none text-lg text-gray-900 dark:text-white placeholder-gray-400"
            />
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
              }`}
              title="Filtros"
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setFilters({ ...filters, [key]: !value })}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    value
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {!query && searchHistory.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Buscas Recentes
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  Limpar
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(item)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm transition-colors flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div className="py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum resultado encontrado para "{query}"
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((result, idx) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    idx === selectedIndex
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-750 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{result.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {result.title}
                        </h4>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          {result.type}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {result.subtitle}
                        </p>
                      )}
                      {result.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {result.description}
                        </p>
                      )}
                      {result.metadata && (
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                          {result.metadata}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer com atalhos */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-b-2xl">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↑</kbd>
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↵</kbd>
                selecionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">esc</kbd>
                fechar
              </span>
            </div>
            <span>{results.length} resultados</span>
          </div>
        </div>
      </div>
    </div>
  )
}

