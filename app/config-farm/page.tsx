'use client'

import { useState, useEffect } from 'react'
import { ToolsLayout } from '../components/ToolsLayout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { 
  Settings, 
  RefreshCw, 
  Plus, 
  Save,
  Search,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Edit2
} from 'lucide-react'

const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

interface MarketItem {
  item_key: string
  item_name: string
  item_id: number
  price: number
  avg_price?: number
  categoria?: string
  sellers: number
  updated_at: string
  preco_manual?: number
}

interface NovoItem {
  item_key: string
  item_name: string
  item_id: string
  categoria: string
  preco_manual: string
}

const formatZeny = (value: number): string => {
  if (value >= 1000000000) return (value / 1000000000).toFixed(2) + 'B'
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return Math.round(value / 1000) + 'K'
  return value.toLocaleString('pt-BR')
}

const CATEGORIAS = [
  { key: 'consumivel', label: 'Consumível', cor: 'bg-green-100 text-green-700' },
  { key: 'material', label: 'Material', cor: 'bg-blue-100 text-blue-700' },
  { key: 'equip', label: 'Equipamento', cor: 'bg-purple-100 text-purple-700' },
  { key: 'drop_npc', label: 'Drop NPC', cor: 'bg-amber-100 text-amber-700' },
  { key: 'drop_raro', label: 'Drop Raro', cor: 'bg-red-100 text-red-700' },
  { key: 'cash', label: 'Cash', cor: 'bg-pink-100 text-pink-700' },
  { key: 'outros', label: 'Outros', cor: 'bg-gray-100 text-gray-700' },
]

export default function ConfigFarmPage() {
  const [items, setItems] = useState<MarketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MarketItem | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [novoItem, setNovoItem] = useState<NovoItem>({
    item_key: '',
    item_name: '',
    item_id: '',
    categoria: 'consumivel',
    preco_manual: ''
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/market_prices?select=*&order=item_name.asc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (err) {
      console.error('Erro ao buscar itens:', err)
    } finally {
      setLoading(false)
    }
  }

  const syncPrices = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/sync-prices', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`Sincronização concluída!\n${result.message}`)
        await fetchItems()
      } else {
        alert('Erro ao sincronizar preços')
      }
    } catch (err) {
      console.error('Erro ao sincronizar:', err)
      alert('Erro ao sincronizar preços')
    } finally {
      setSyncing(false)
    }
  }

  const salvarPrecoManual = async (itemKey: string, preco: number) => {
    setSaving(true)
    try {
      // Atualiza o preço manual no banco
      const response = await fetch(`${SUPABASE_URL}/rest/v1/market_prices?item_key=eq.${itemKey}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          preco_manual: preco,
          updated_at: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        await fetchItems()
        setEditingItem(null)
      }
    } catch (err) {
      console.error('Erro ao salvar preço:', err)
    } finally {
      setSaving(false)
    }
  }

  const adicionarItem = async () => {
    if (!novoItem.item_key || !novoItem.item_name) {
      alert('Preencha todos os campos obrigatórios')
      return
    }
    
    setSaving(true)
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/market_prices`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          item_key: novoItem.item_key,
          item_name: novoItem.item_name,
          item_id: parseInt(novoItem.item_id) || 0,
          categoria: novoItem.categoria,
          price: 0,
          preco_manual: novoItem.preco_manual ? parseInt(novoItem.preco_manual) : null,
          sellers: 0,
          updated_at: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        await fetchItems()
        setShowAddModal(false)
        setNovoItem({
          item_key: '',
          item_name: '',
          item_id: '',
          categoria: 'consumivel',
          preco_manual: ''
        })
      }
    } catch (err) {
      console.error('Erro ao adicionar item:', err)
    } finally {
      setSaving(false)
    }
  }

  const removerItem = async (itemKey: string) => {
    if (!confirm('Remover este item?')) return
    
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/market_prices?item_key=eq.${itemKey}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })
      await fetchItems()
    } catch (err) {
      console.error('Erro ao remover item:', err)
    }
  }

  const getCategoriaCor = (cat: string) => {
    return CATEGORIAS.find(c => c.key === cat)?.cor || 'bg-gray-100 text-gray-700'
  }

  const filteredItems = items.filter(item => {
    const matchSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.item_key.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = !filterCategoria || item.categoria === filterCategoria
    return matchSearch && matchCategoria
  })

  const getPrecoFinal = (item: MarketItem) => {
    // Prioridade: preço manual > preço do market
    if (item.preco_manual && item.preco_manual > 0) return item.preco_manual
    if (item.price && item.price > 0) return item.price
    return 0
  }

  const lastUpdate = items.length > 0 
    ? new Date(Math.max(...items.map(i => new Date(i.updated_at).getTime())))
    : null

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="w-8 h-8 text-gray-600" />
                Configuração de Preços
              </h1>
              <p className="text-gray-500 mt-1">
                Gerencie os itens e preços do market para cálculo de farm
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={syncPrices}
                disabled={syncing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Atualizar Preços'}
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </div>

          {/* Info */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Como funciona:</p>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  <li>Os preços são buscados automaticamente do market do Ragnatales</li>
                  <li>Se um item não tiver no market, você pode inserir o preço manualmente</li>
                  <li>O preço manual tem prioridade sobre o preço do market</li>
                  <li>Para adicionar um novo item, pegue o ID no site: ragnatales.com.br/db/items/NUMERO</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-white border-gray-200">
              <p className="text-xs text-gray-500">Total de Itens</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <p className="text-xs text-gray-500">Com Preço Market</p>
              <p className="text-2xl font-bold text-green-600">{items.filter(i => i.price > 0).length}</p>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <p className="text-xs text-gray-500">Sem Vendas</p>
              <p className="text-2xl font-bold text-red-600">{items.filter(i => i.price === 0 && !i.preco_manual).length}</p>
            </Card>
            <Card className="p-4 bg-white border-gray-200">
              <p className="text-xs text-gray-500">Última Atualização</p>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastUpdate ? lastUpdate.toLocaleString('pt-BR') : '-'}
              </p>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas categorias</option>
              {CATEGORIAS.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Lista de itens */}
          <Card className="bg-white border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Carregando...</div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm || filterCategoria ? 'Nenhum item encontrado' : 'Nenhum item cadastrado'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço Market</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço Manual</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço Final</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Vendedores</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.item_key} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.item_name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{item.item_key}</span>
                              {item.item_id > 0 && (
                                <a 
                                  href={`https://ragnatales.com.br/db/items/${item.item_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline flex items-center gap-0.5"
                                >
                                  #{item.item_id}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaCor(item.categoria || 'outros')}`}>
                            {CATEGORIAS.find(c => c.key === item.categoria)?.label || 'Outros'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.price > 0 ? (
                            <span className="text-green-600 font-medium">{formatZeny(item.price)}</span>
                          ) : (
                            <span className="text-red-500 text-sm">Sem vendas</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editingItem?.item_key === item.item_key ? (
                            <div className="flex items-center gap-2 justify-end">
                              <input
                                type="number"
                                defaultValue={item.preco_manual || ''}
                                className="w-32 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    salvarPrecoManual(item.item_key, parseInt((e.target as HTMLInputElement).value) || 0)
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingItem(null)
                                  }
                                }}
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  const input = (e.currentTarget.previousSibling as HTMLInputElement)
                                  salvarPrecoManual(item.item_key, parseInt(input.value) || 0)
                                }}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                disabled={saving}
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span 
                              className={`cursor-pointer hover:underline ${item.preco_manual ? 'text-blue-600 font-medium' : 'text-gray-400'}`}
                              onClick={() => setEditingItem(item)}
                            >
                              {item.preco_manual ? formatZeny(item.preco_manual) : 'Definir'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold ${getPrecoFinal(item) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {getPrecoFinal(item) > 0 ? formatZeny(getPrecoFinal(item)) : '-'}
                          </span>
                          {item.preco_manual && item.preco_manual > 0 && (
                            <span className="ml-1 text-xs text-blue-500">(M)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.sellers > 0 ? (
                            <span className="text-gray-600">{item.sellers}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removerItem(item.item_key)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Modal adicionar item */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Adicionar Novo Item</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chave (item_key) *
                  </label>
                  <input
                    type="text"
                    value={novoItem.item_key}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, item_key: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                    placeholder="ex: pocao_branca"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Item *
                  </label>
                  <input
                    type="text"
                    value={novoItem.item_name}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, item_name: e.target.value }))}
                    placeholder="ex: Poção Branca"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID do Ragnatales
                  </label>
                  <input
                    type="text"
                    value={novoItem.item_id}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, item_id: e.target.value }))}
                    placeholder="ex: 547"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pegue em: ragnatales.com.br/db/items/NUMERO
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={novoItem.categoria}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço Manual (opcional)
                  </label>
                  <input
                    type="text"
                    value={novoItem.preco_manual}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, preco_manual: e.target.value }))}
                    placeholder="ex: 5000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use se o item não estiver no market
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={adicionarItem}
                    disabled={saving || !novoItem.item_key || !novoItem.item_name}
                    className="flex-1"
                  >
                    {saving ? 'Salvando...' : 'Adicionar'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </ToolsLayout>
  )
}

