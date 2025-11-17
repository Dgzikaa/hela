'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import { Button } from '@/app/components/Button'

interface Boss {
  id: number
  nome: string
  preco: number
  ordem: number
}

interface Pedido {
  id: number
  nomeCliente: string
  contatoCliente: string
  status: string
  dataAgendada: string | null
  valorTotal: number
  valorFinal: number
  desconto: number
  conquistaSemMorrer: boolean
  pacoteCompleto: boolean
  origem: string
  createdAt: string
  itens: {
    id: number
    preco: number
    boss: Boss
  }[]
  aprovador?: {
    nome: string
  }
}

export default function PedidosPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  
  // Form state para criar novo pedido
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [bosses, setBosses] = useState<Boss[]>([])
  const [formData, setFormData] = useState({
    nomeCliente: '',
    contatoCliente: '',
    bossesIds: [] as number[],
    conquistaSemMorrer: false,
    pacoteCompleto: false,
    observacoes: ''
  })

  useEffect(() => {
    fetchPedidos()
    fetchBosses()
  }, [])

  const fetchPedidos = async () => {
    try {
      const res = await fetch('/api/pedidos')
      if (res.ok) {
        const data = await res.json()
        setPedidos(data)
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBosses = async () => {
    try {
      const res = await fetch('/api/bosses')
      if (res.ok) {
        const data = await res.json()
        setBosses(data)
      }
    } catch (error) {
      console.error('Erro ao buscar bosses:', error)
    }
  }

  const calcularValorTotal = () => {
    let total = 0
    
    // Somar bosses selecionados
    formData.bossesIds.forEach(bossId => {
      const boss = bosses.find(b => b.id === bossId)
      if (boss) total += boss.preco
    })
    
    // Adicionar conquista sem morrer
    if (formData.conquistaSemMorrer) {
      total += 150
    }
    
    // Pacote completo ganha de brinde a conquista
    if (formData.pacoteCompleto && formData.bossesIds.length === 6) {
      // Conquista grátis, mas adiciona o valor dos bosses
      // O total já está calculado acima
    }
    
    return total
  }

  const handleCreatePedido = async () => {
    try {
      const valorTotal = calcularValorTotal()
      
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCliente: formData.nomeCliente,
          contatoCliente: formData.contatoCliente,
          bosses: formData.bossesIds,
          conquistaSemMorrer: formData.conquistaSemMorrer,
          pacoteCompleto: formData.pacoteCompleto,
          valorTotal,
          desconto: 0,
          origem: 'WEB',
          observacoes: formData.observacoes
        })
      })
      
      if (res.ok) {
        alert('Pedido criado com sucesso!')
        setShowCreateForm(false)
        setFormData({
          nomeCliente: '',
          contatoCliente: '',
          bossesIds: [],
          conquistaSemMorrer: false,
          pacoteCompleto: false,
          observacoes: ''
        })
        fetchPedidos()
      } else {
        alert('Erro ao criar pedido')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar pedido')
    }
  }

  const handleUpdateStatus = async (pedidoId: number, novoStatus: string, dataAgendada?: string) => {
    try {
      const res = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pedidoId,
          status: novoStatus,
          dataAgendada: dataAgendada || null
        })
      })
      
      if (res.ok) {
        alert('Status atualizado!')
        fetchPedidos()
        setSelectedPedido(null)
      } else {
        alert('Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao atualizar status')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any, label: string }> = {
      PENDENTE: { variant: 'warning', label: 'Pendente' },
      APROVADO: { variant: 'info', label: 'Aprovado' },
      AGENDADO: { variant: 'primary', label: 'Agendado' },
      EM_ANDAMENTO: { variant: 'info', label: 'Em Andamento' },
      CONCLUIDO: { variant: 'success', label: 'Concluído' },
      CANCELADO: { variant: 'danger', label: 'Cancelado' }
    }
    const config = statusMap[status] || { variant: 'default', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const toggleBoss = (bossId: number) => {
    setFormData(prev => ({
      ...prev,
      bossesIds: prev.bossesIds.includes(bossId)
        ? prev.bossesIds.filter(id => id !== bossId)
        : [...prev.bossesIds, bossId]
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Pedidos de Carry</h1>
            <p className="text-gray-400">Gerencie todos os pedidos de carry</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Pedido
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-yellow-400 text-sm mb-1">Pendentes</div>
            <div className="text-3xl font-bold text-white">
              {pedidos.filter(p => p.status === 'PENDENTE').length}
            </div>
          </Card>
          <Card>
            <div className="text-blue-400 text-sm mb-1">Agendados</div>
            <div className="text-3xl font-bold text-white">
              {pedidos.filter(p => p.status === 'AGENDADO').length}
            </div>
          </Card>
          <Card>
            <div className="text-green-400 text-sm mb-1">Concluídos</div>
            <div className="text-3xl font-bold text-white">
              {pedidos.filter(p => p.status === 'CONCLUIDO').length}
            </div>
          </Card>
          <Card>
            <div className="text-gray-400 text-sm mb-1">Valor Total</div>
            <div className="text-3xl font-bold text-white">
              {pedidos.reduce((acc, p) => acc + p.valorFinal, 0)}KK
            </div>
          </Card>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {pedidos.map(pedido => (
            <Card key={pedido.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{pedido.nomeCliente}</h3>
                    {getStatusBadge(pedido.status)}
                    <Badge variant="default">{pedido.origem}</Badge>
                  </div>
                  
                  <div className="text-gray-400 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Valor: {pedido.valorTotal}KK | Final: {pedido.valorFinal}KK</span>
                      {pedido.desconto > 0 && (
                        <span className="text-green-400">(Desconto: -{pedido.desconto}KK)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {pedido.dataAgendada 
                          ? new Date(pedido.dataAgendada).toLocaleString('pt-BR')
                          : 'Não agendado'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {pedido.itens.map(item => (
                      <Badge key={item.id} variant="info">
                        {item.boss.nome} ({item.preco}KK)
                      </Badge>
                    ))}
                    {pedido.conquistaSemMorrer && (
                      <Badge variant="warning">Conquista Sem Morrer</Badge>
                    )}
                    {pedido.pacoteCompleto && (
                      <Badge variant="success">Pacote Completo</Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    Contato: {pedido.contatoCliente} • Criado em {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className="flex gap-2">
                  {pedido.status === 'PENDENTE' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleUpdateStatus(pedido.id, 'APROVADO')}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleUpdateStatus(pedido.id, 'CANCELADO')}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {pedido.status === 'APROVADO' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const data = prompt('Data do carry (AAAA-MM-DD HH:MM):')
                        if (data) {
                          handleUpdateStatus(pedido.id, 'AGENDADO', data)
                        }
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Agendar
                    </Button>
                  )}
                  {pedido.status === 'AGENDADO' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdateStatus(pedido.id, 'EM_ANDAMENTO')}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Iniciar
                    </Button>
                  )}
                  {pedido.status === 'EM_ANDAMENTO' && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleUpdateStatus(pedido.id, 'CONCLUIDO')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Concluir
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal Criar Pedido */}
        {showCreateForm && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <div 
              className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header com X */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">Novo Pedido de Carry</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Conteúdo com scroll */}
              <div className="overflow-y-auto p-6 custom-scrollbar"  style={{ maxHeight: 'calc(90vh - 140px)' }}>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Nome do Cliente</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    value={formData.nomeCliente}
                    onChange={(e) => setFormData({ ...formData, nomeCliente: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Contato (Discord/WhatsApp)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    value={formData.contatoCliente}
                    onChange={(e) => setFormData({ ...formData, contatoCliente: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Selecione os Bosses</label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Hela separada - destaque */}
                    {bosses.filter(b => b.ordem === 0).map(boss => (
                      <button
                        key={boss.id}
                        onClick={() => toggleBoss(boss.id)}
                        className={`col-span-2 p-4 rounded border-2 transition-colors ${
                          formData.bossesIds.includes(boss.id)
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-300'
                        }`}
                      >
                        <div className="font-bold text-lg">{boss.nome}</div>
                        <div className="text-sm">{boss.preco}KK</div>
                      </button>
                    ))}
                    
                    {/* Bosses 1-6 */}
                    {bosses.filter(b => b.ordem > 0).map(boss => (
                      <button
                        key={boss.id}
                        onClick={() => toggleBoss(boss.id)}
                        className={`p-3 rounded border-2 transition-colors ${
                          formData.bossesIds.includes(boss.id)
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-300'
                        }`}
                      >
                        <div className="font-bold">{boss.nome}</div>
                        <div className="text-sm">{boss.preco}KK</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.conquistaSemMorrer}
                      onChange={(e) => setFormData({ ...formData, conquistaSemMorrer: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>Conquista Sem Morrer (+150KK)</span>
                  </label>

                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.pacoteCompleto}
                      onChange={(e) => setFormData({ ...formData, pacoteCompleto: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>Pacote Completo 1-6 (Conquista Grátis)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Observações</label>
                  <textarea
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    rows={3}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  />
                </div>

              </div>
              </div>
              
              {/* Footer fixo com total e botões */}
              <div className="border-t border-gray-700 p-6 pt-4 bg-gray-800">
                <div className="bg-gray-700 p-4 rounded mb-4">
                  <div className="text-lg font-bold text-white">
                    Valor Total: {calcularValorTotal()}KK
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleCreatePedido} className="flex-1">
                    Criar Pedido
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

