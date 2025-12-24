'use client'

import { useState, useEffect, useMemo } from 'react'
import { AdminSidebar } from '../../components/AdminSidebar'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Toast } from '../../components/Toast'
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Crown,
  Star,
  UserPlus,
  MessageCircle,
  Phone,
  Mail,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target,
  Clock,
  DollarSign,
  Eye
} from 'lucide-react'

interface Cliente {
  id: number
  discordUserId: string
  discordUsername: string
  nome: string | null
  email: string | null
  telefone: string | null
  nickIngame: string | null
  categoria: string
  tier: string
  totalCompras: number
  totalGasto: number
  totalContatos: number
  ultimoContato: string | null
  primeiraCompra: string | null
  ultimaCompra: string | null
  observacoes: string | null
  origem: string | null
  indicadoPor: string | null
  createdAt: string
}

const CATEGORIAS = [
  { value: 'POTENCIAL', label: 'Potencial', cor: 'slate', desc: 'Nunca comprou' },
  { value: 'AVENTUREIRO', label: 'Aventureiro', cor: 'yellow', desc: 'Pergunta mas não fecha' },
  { value: 'COMPRADOR', label: 'Comprador', cor: 'emerald', desc: '1-2 compras' },
  { value: 'FIEL', label: 'Fiel', cor: 'blue', desc: '3+ compras' },
  { value: 'VIP', label: 'VIP', cor: 'purple', desc: 'Alto valor' },
]

const TIERS = [
  { value: 'BRONZE', label: 'Bronze', cor: 'amber' },
  { value: 'PRATA', label: 'Prata', cor: 'slate' },
  { value: 'OURO', label: 'Ouro', cor: 'yellow' },
  { value: 'PLATINA', label: 'Platina', cor: 'cyan' },
  { value: 'DIAMANTE', label: 'Diamante', cor: 'purple' },
]

const getCorCategoria = (categoria: string) => {
  const cat = CATEGORIAS.find(c => c.value === categoria)
  const cores: Record<string, string> = {
    slate: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  }
  return cores[cat?.cor || 'slate']
}

const getCorTier = (tier: string) => {
  const t = TIERS.find(x => x.value === tier)
  const cores: Record<string, string> = {
    amber: 'text-amber-600',
    slate: 'text-slate-400',
    yellow: 'text-yellow-400',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
  }
  return cores[t?.cor || 'amber']
}

export default function CRMPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('')
  const [expandedCliente, setExpandedCliente] = useState<number | null>(null)
  const [editingCliente, setEditingCliente] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Cliente>>({})
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMsg({ message, type })
    setTimeout(() => setToastMsg(null), 3000)
  }
  
  useEffect(() => {
    fetchClientes()
  }, [])
  
  const fetchClientes = async () => {
    try {
      const res = await fetch('/api/clientes')
      if (res.ok) {
        const data = await res.json()
        setClientes(data)
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // Estatísticas do funil
  const estatisticas = useMemo(() => {
    const byCategoria = CATEGORIAS.map(cat => ({
      ...cat,
      count: clientes.filter(c => c.categoria === cat.value).length
    }))
    
    const totalGasto = clientes.reduce((acc, c) => acc + c.totalGasto, 0)
    const totalCompras = clientes.reduce((acc, c) => acc + c.totalCompras, 0)
    const mediaTicket = totalCompras > 0 ? totalGasto / totalCompras : 0
    
    return {
      byCategoria,
      totalClientes: clientes.length,
      totalGasto,
      totalCompras,
      mediaTicket
    }
  }, [clientes])
  
  // Filtros
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
      const matchSearch = 
        c.discordUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nickIngame?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchCategoria = !filtroCategoria || c.categoria === filtroCategoria
      
      return matchSearch && matchCategoria
    })
  }, [clientes, searchTerm, filtroCategoria])
  
  // Editar cliente
  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente.id)
    setEditForm({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      nickIngame: cliente.nickIngame,
      categoria: cliente.categoria,
      observacoes: cliente.observacoes
    })
    setExpandedCliente(cliente.id)
  }
  
  const handleSave = async (clienteId: number) => {
    try {
      const res = await fetch(`/api/clientes/${clienteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      
      if (res.ok) {
        showToast('Cliente atualizado!', 'success')
        fetchClientes()
        setEditingCliente(null)
      } else {
        showToast('Erro ao atualizar', 'error')
      }
    } catch (err) {
      showToast('Erro de conexão', 'error')
    }
  }
  
  const formatZeny = (value: number) => {
    if (value >= 1000) return (value / 1000).toFixed(0) + 'B'
    return value + 'M'
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSidebar />
      
      <main className="flex-1 p-4 lg:p-8 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-7 h-7 text-purple-400" />
                CRM de Clientes
              </h1>
              <p className="text-slate-400 mt-1">Gerencie seus clientes e acompanhe o funil de vendas</p>
            </div>
          </div>
          
          {/* Estatísticas do Funil */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {estatisticas.byCategoria.map(cat => (
              <Card 
                key={cat.value}
                className={`p-4 cursor-pointer transition-all ${
                  filtroCategoria === cat.value 
                    ? 'ring-2 ring-white' 
                    : 'hover:ring-1 hover:ring-slate-600'
                }`}
                onClick={() => setFiltroCategoria(filtroCategoria === cat.value ? '' : cat.value)}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getCorCategoria(cat.value)}`}>
                    {cat.label}
                  </span>
                  <span className="text-2xl font-bold text-white">{cat.count}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{cat.desc}</p>
              </Card>
            ))}
          </div>
          
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Clientes</p>
                  <p className="text-xl font-bold text-white">{estatisticas.totalClientes}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Faturado</p>
                  <p className="text-xl font-bold text-white">{formatZeny(estatisticas.totalGasto)}KK</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Pedidos</p>
                  <p className="text-xl font-bold text-white">{estatisticas.totalCompras}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Ticket Médio</p>
                  <p className="text-xl font-bold text-white">{formatZeny(Math.round(estatisticas.mediaTicket))}KK</p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Busca e filtros */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, discord, nick ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {filtroCategoria && (
                <Button 
                  variant="secondary" 
                  onClick={() => setFiltroCategoria('')}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpar filtro
                </Button>
              )}
            </div>
          </Card>
          
          {/* Lista de Clientes */}
          <Card>
            {loading ? (
              <div className="p-8 text-center text-slate-400">Carregando...</div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum cliente encontrado</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {clientesFiltrados.map(cliente => (
                  <div key={cliente.id} className="hover:bg-slate-800/50 transition-colors">
                    {/* Linha principal */}
                    <div 
                      className="p-4 flex items-center gap-4 cursor-pointer"
                      onClick={() => setExpandedCliente(expandedCliente === cliente.id ? null : cliente.id)}
                    >
                      {/* Avatar/Tier */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        cliente.tier === 'DIAMANTE' ? 'bg-purple-500/20' :
                        cliente.tier === 'PLATINA' ? 'bg-cyan-500/20' :
                        cliente.tier === 'OURO' ? 'bg-yellow-500/20' :
                        cliente.tier === 'PRATA' ? 'bg-slate-500/20' :
                        'bg-amber-500/20'
                      }`}>
                        <Crown className={`w-5 h-5 ${getCorTier(cliente.tier)}`} />
                      </div>
                      
                      {/* Info principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white truncate">
                            {cliente.nome || cliente.discordUsername}
                          </p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getCorCategoria(cliente.categoria)}`}>
                            {CATEGORIAS.find(c => c.value === cliente.categoria)?.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">
                          {cliente.discordUsername} {cliente.nickIngame && `• ${cliente.nickIngame}`}
                        </p>
                      </div>
                      
                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-slate-400">Compras</p>
                          <p className="font-bold text-white">{cliente.totalCompras}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Total</p>
                          <p className="font-bold text-emerald-400">{cliente.totalGasto}KK</p>
                        </div>
                      </div>
                      
                      {/* Expand */}
                      <div className="text-slate-400">
                        {expandedCliente === cliente.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    
                    {/* Detalhes expandidos */}
                    {expandedCliente === cliente.id && (
                      <div className="px-4 pb-4 pt-0 bg-slate-800/30">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Dados do cliente */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-white flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Dados do Cliente
                            </h4>
                            
                            {editingCliente === cliente.id ? (
                              <div className="space-y-3">
                                <Input
                                  placeholder="Nome"
                                  value={editForm.nome || ''}
                                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                                />
                                <Input
                                  placeholder="Email"
                                  type="email"
                                  value={editForm.email || ''}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                                <Input
                                  placeholder="Telefone/WhatsApp"
                                  value={editForm.telefone || ''}
                                  onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                                />
                                <Input
                                  placeholder="Nick no jogo"
                                  value={editForm.nickIngame || ''}
                                  onChange={(e) => setEditForm({ ...editForm, nickIngame: e.target.value })}
                                />
                                <select
                                  value={editForm.categoria || cliente.categoria}
                                  onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                >
                                  {CATEGORIAS.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                  ))}
                                </select>
                                <textarea
                                  placeholder="Observações"
                                  value={editForm.observacoes || ''}
                                  onChange={(e) => setEditForm({ ...editForm, observacoes: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none"
                                  rows={3}
                                />
                                
                                <div className="flex gap-2">
                                  <Button onClick={() => handleSave(cliente.id)} className="flex-1">
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar
                                  </Button>
                                  <Button variant="secondary" onClick={() => setEditingCliente(null)}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-300">
                                  <MessageCircle className="w-4 h-4 text-slate-500" />
                                  {cliente.discordUsername}
                                </div>
                                {cliente.email && (
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                    {cliente.email}
                                  </div>
                                )}
                                {cliente.telefone && (
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                    {cliente.telefone}
                                  </div>
                                )}
                                {cliente.observacoes && (
                                  <div className="mt-2 p-2 bg-slate-700/50 rounded text-slate-300">
                                    {cliente.observacoes}
                                  </div>
                                )}
                                
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  onClick={() => handleEdit(cliente)}
                                  className="mt-2"
                                >
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Editar
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {/* Histórico */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-white flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Histórico
                            </h4>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Primeira compra</span>
                                <span className="text-white">
                                  {cliente.primeiraCompra 
                                    ? new Date(cliente.primeiraCompra).toLocaleDateString('pt-BR')
                                    : '-'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Última compra</span>
                                <span className="text-white">
                                  {cliente.ultimaCompra 
                                    ? new Date(cliente.ultimaCompra).toLocaleDateString('pt-BR')
                                    : '-'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Total de contatos</span>
                                <span className="text-white">{cliente.totalContatos}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Último contato</span>
                                <span className="text-white">
                                  {cliente.ultimoContato 
                                    ? new Date(cliente.ultimoContato).toLocaleDateString('pt-BR')
                                    : '-'}
                                </span>
                              </div>
                              {cliente.origem && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Origem</span>
                                  <span className="text-white">{cliente.origem}</span>
                                </div>
                              )}
                              {cliente.indicadoPor && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Indicado por</span>
                                  <span className="text-white">{cliente.indicadoPor}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
      
      {toastMsg && <Toast id="crm-toast" message={toastMsg.message} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
    </div>
  )
}

