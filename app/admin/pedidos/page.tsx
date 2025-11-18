'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, CheckCircle, XCircle, Clock, DollarSign, Edit2, Ban, Trash2 } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import { Button } from '@/app/components/Button'
import { ToastContainer } from '@/app/components/Toast'
import { useToast } from '@/app/hooks/useToast'

interface Boss {
  id: number
  nome: string
  preco: number
  ordem: number
}

interface Jogador {
  id: number
  nick: string
  categorias: string // String separada por vírgula: "HELA,CARRYS"
  discord: string | null
  ativo: boolean
  essencial: boolean
  ultimoCarry: string | null
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
  const toast = useToast()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  
  // Modal de agendamento
  const [showAgendarModal, setShowAgendarModal] = useState(false)
  const [pedidoParaAgendar, setPedidoParaAgendar] = useState<Pedido | null>(null)
  const [dataAgendamento, setDataAgendamento] = useState('')
  const [horaAgendamento, setHoraAgendamento] = useState('')
  
  // Modal de cancelamento
  const [showCancelarModal, setShowCancelarModal] = useState(false)
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState<Pedido | null>(null)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')

  // Modal de conclusão/pagamento
  const [showConcluirModal, setShowConcluirModal] = useState(false)
  const [pedidoParaConcluir, setPedidoParaConcluir] = useState<Pedido | null>(null)
  
  // Modal de exclusão
  const [showExcluirModal, setShowExcluirModal] = useState(false)
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState<Pedido | null>(null)
  
  // Modal de edição
  const [showEditModal, setShowEditModal] = useState(false)
  const [pedidoParaEditar, setPedidoParaEditar] = useState<Pedido | null>(null)
  
  // Form state para criar novo pedido
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [bosses, setBosses] = useState<Boss[]>([])
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [formData, setFormData] = useState({
    nomeCliente: '',
    contatoCliente: '',
    bossesIds: [] as number[],
    jogadoresIds: [] as number[],
    jogadoresNaoCadastrados: '', // Nomes separados por vírgula
    conquistaSemMorrer: false,
    pacoteCompleto: false,
    observacoes: '',
    precoCustomizado: false,
    bossesPrecos: {} as Record<number, number>, // ID do boss -> preço customizado
    numeroCompradores: 1, // Quantos compradores participarão (default 1)
    compradores: [
      { nome: '', contato: '', bossesIds: [] as number[] }
    ] // Dados de cada comprador individual
  })

  useEffect(() => {
    fetchPedidos()
    fetchBosses()
    fetchJogadores()
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

  const selecionarJogadoresAutomatico = () => {
    // Determinar qual time usar baseado nos bosses selecionados
    const helaId = bosses.find(b => b.nome === 'Hela')?.id
    const temHela = formData.bossesIds.includes(helaId || 0)
    
    // Se selecionou HELA → time HELA
    // Se não tem HELA → time CARRYS (boss 4-6)
    const categoriaTime = temHela ? 'HELA' : 'CARRYS'
    
    const timeCategoria = jogadores.filter((j: Jogador) => 
      j.categorias?.includes(categoriaTime) && j.ativo
    )
    
    // 1. Pegar TODOS os essenciais (sempre vão)
    const essenciais = timeCategoria.filter((j: Jogador) => j.essencial)
    
    // 2. Pegar não-essenciais ordenados por último carry (rodízio)
    const naoEssenciais = timeCategoria
      .filter((j: Jogador) => !j.essencial)
      .sort((a: any, b: any) => {
        // Quem nunca participou vai primeiro
        if (!a.ultimoCarry && !b.ultimoCarry) return 0
        if (!a.ultimoCarry) return -1
        if (!b.ultimoCarry) return 1
        // Depois ordena por data (mais antigo primeiro)
        return new Date(a.ultimoCarry).getTime() - new Date(b.ultimoCarry).getTime()
      })
    
    // 3. Calcular slots disponíveis (12 - compradores)
    const slotsCompradores = formData.numeroCompradores || 1
    const totalSlots = 12 - slotsCompradores
    const slotsRestantes = totalSlots - essenciais.length
    const naoEssenciaisSelecionados = naoEssenciais.slice(0, Math.max(0, slotsRestantes))
    
    // SELECIONAR JOGADORES DO TIME (HELA ou CARRYS baseado nos bosses)
    const jogadoresSelecionados = [
      ...essenciais.map((j: Jogador) => j.id),
      ...naoEssenciaisSelecionados.map((j: Jogador) => j.id)
    ]
    
    setFormData(prev => ({
      ...prev,
      jogadoresIds: jogadoresSelecionados
    }))
  }

  const fetchJogadores = async () => {
    try {
      const res = await fetch('/api/jogadores')
      if (res.ok) {
        const data = await res.json()
        
        // Separar jogadores ativos por categoria
        const jogadoresAtivos = data.filter((j: Jogador) => j.ativo)
        setJogadores(jogadoresAtivos)
        
        // NÃO chamar selecionarJogadoresAutomatico aqui
        // Será chamado quando o usuário selecionar um boss
      }
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error)
    }
  }

  const calcularValorTotal = () => {
    let total = 0
    
    // Somar bosses selecionados (com preços customizados se houver)
    formData.bossesIds.forEach(bossId => {
      if (formData.precoCustomizado && formData.bossesPrecos[bossId] !== undefined) {
        total += formData.bossesPrecos[bossId]
      } else {
        const boss = bosses.find(b => b.id === bossId)
        if (boss) total += boss.preco
      }
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
  
  const getBossPreco = (bossId: number) => {
    if (formData.precoCustomizado && formData.bossesPrecos[bossId] !== undefined) {
      return formData.bossesPrecos[bossId]
    }
    const boss = bosses.find(b => b.id === bossId)
    return boss?.preco || 0
  }
  
  const setBossPreco = (bossId: number, preco: number) => {
    setFormData({
      ...formData,
      bossesPrecos: {
        ...formData.bossesPrecos,
        [bossId]: preco
      }
    })
  }

  const handleCreatePedido = async () => {
    try {
      const valorTotal = calcularValorTotal()
      
      // Pegar dados do primeiro comprador (principal)
      const primeiroComprador = formData.compradores[0]
      
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCliente: primeiroComprador.nome,
          contatoCliente: primeiroComprador.contato,
          bosses: formData.bossesIds,
          jogadores: formData.jogadoresIds,
          jogadoresNaoCadastrados: formData.jogadoresNaoCadastrados,
          conquistaSemMorrer: formData.conquistaSemMorrer,
          pacoteCompleto: formData.pacoteCompleto,
          valorTotal,
          desconto: 0,
          origem: 'WEB',
          observacoes: formData.observacoes,
          bossesPrecos: formData.precoCustomizado ? formData.bossesPrecos : null
        })
      })
      
      if (res.ok) {
        toast.success('🎉 Pedido criado com sucesso!')
        setShowCreateForm(false)
        
        // Resetar form mantendo o time HELA selecionado
        const timeHela = jogadores.filter(j => j.categorias?.includes('HELA') && j.ativo)
        setFormData({
          nomeCliente: '',
          contatoCliente: '',
          bossesIds: [],
          jogadoresIds: timeHela.map(j => j.id),
          jogadoresNaoCadastrados: '',
          conquistaSemMorrer: false,
          pacoteCompleto: false,
          observacoes: '',
          precoCustomizado: false,
          bossesPrecos: {},
          numeroCompradores: 1,
          compradores: [{ nome: '', contato: '', bossesIds: [] }]
        })
        fetchPedidos()
      } else {
        toast.error('❌ Erro ao criar pedido')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('❌ Erro ao criar pedido')
    }
  }

  const handleUpdateStatus = async (pedidoId: number, novoStatus: string, dataAgendada?: string, motivo?: string, marcarPago?: boolean) => {
    try {
      const res = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pedidoId,
          status: novoStatus,
          dataAgendada: dataAgendada || null,
          motivo: motivo || null,
          marcarPago: marcarPago || false
        })
      })
      
      if (res.ok) {
        if (novoStatus === 'CANCELADO') {
          toast.warning('⚠️ Carry cancelado e notificação enviada ao Discord')
        } else if (novoStatus === 'AGENDADO') {
          toast.success('📅 Carry agendado com sucesso!')
        } else if (novoStatus === 'CONCLUIDO' && marcarPago) {
          toast.success('💰 Carry concluído e jogadores pagos!')
        } else {
          toast.success('✅ Status atualizado!')
        }
        fetchPedidos()
        setSelectedPedido(null)
      } else {
        toast.error('❌ Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('❌ Erro ao atualizar status')
    }
  }

  const handleDeletePedido = async (pedidoId: number) => {
    try {
      const res = await fetch('/api/pedidos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pedidoId })
      })
      
      if (res.ok) {
        toast.success('🗑️ Pedido excluído com sucesso!')
        fetchPedidos()
      } else {
        toast.error('❌ Erro ao excluir pedido')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('❌ Erro ao excluir pedido')
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
    const boss = bosses.find(b => b.id === bossId)
    setFormData(prev => {
      const isAdding = !prev.bossesIds.includes(bossId)
      const newBossesIds = isAdding 
        ? [...prev.bossesIds, bossId]
        : prev.bossesIds.filter(id => id !== bossId)
      
      // Inicializar preço customizado com o preço padrão ao adicionar
      const newBossesPrecos = { ...prev.bossesPrecos }
      if (isAdding && boss && prev.precoCustomizado) {
        newBossesPrecos[bossId] = boss.preco
      }
      
      return {
        ...prev,
        bossesIds: newBossesIds,
        bossesPrecos: newBossesPrecos
      }
    })
    
    // Reselecionar jogadores baseado nos bosses
    setTimeout(() => selecionarJogadoresAutomatico(), 100)
  }

  const toggleJogador = (jogadorId: number) => {
    setFormData(prev => ({
      ...prev,
      jogadoresIds: prev.jogadoresIds.includes(jogadorId)
        ? prev.jogadoresIds.filter(id => id !== jogadorId)
        : [...prev.jogadoresIds, jogadorId]
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
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedidos de Carry</h1>
            <p className="text-gray-600">Gerencie todos os pedidos de carry</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-5 h-5" />
            Novo Pedido
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card hover>
            <div className="text-yellow-600 text-sm font-semibold mb-1">Pendentes</div>
            <div className="text-3xl font-bold text-gray-900">
              {pedidos.filter(p => p.status === 'PENDENTE').length}
            </div>
          </Card>
          <Card hover>
            <div className="text-blue-600 text-sm font-semibold mb-1">Agendados</div>
            <div className="text-3xl font-bold text-gray-900">
              {pedidos.filter(p => p.status === 'AGENDADO').length}
            </div>
          </Card>
          <Card hover>
            <div className="text-green-600 text-sm font-semibold mb-1">Concluídos</div>
            <div className="text-3xl font-bold text-gray-900">
              {pedidos.filter(p => p.status === 'CONCLUIDO').length}
            </div>
          </Card>
          <Card hover>
            <div className="text-purple-600 text-sm font-semibold mb-1">Valor Total</div>
            <div className="text-3xl font-bold text-gray-900">
              {pedidos.reduce((acc, p) => acc + p.valorFinal, 0)}KK
            </div>
          </Card>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {pedidos.map(pedido => (
            <Card key={pedido.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{pedido.nomeCliente}</h3>
                    {getStatusBadge(pedido.status)}
                    <Badge variant="default">{pedido.origem}</Badge>
                  </div>
                  
                  <div className="text-gray-600 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Valor: {pedido.valorTotal}KK | Final: {pedido.valorFinal}KK</span>
                      {pedido.desconto > 0 && (
                        <span className="text-green-600 font-semibold">(Desconto: -{pedido.desconto}KK)</span>
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

                  <div className="text-sm text-gray-500 font-medium">
                    Contato: {pedido.contatoCliente} • Criado em {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {/* Botão Excluir - aparece em todos */}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setPedidoParaExcluir(pedido)
                      setShowExcluirModal(true)
                    }}
                    title="Excluir pedido"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  {/* Botão Editar - aparece sempre exceto quando concluído ou cancelado */}
                  {!['CONCLUIDO', 'CANCELADO'].includes(pedido.status) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setPedidoParaEditar(pedido)
                        setShowEditModal(true)
                      }}
                      title="Editar pedido"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}

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
                        onClick={() => {
                          setPedidoParaCancelar(pedido)
                          setShowCancelarModal(true)
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {pedido.status === 'APROVADO' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          setPedidoParaAgendar(pedido)
                          // Pré-preencher com data de hoje + 1 dia
                          const amanha = new Date()
                          amanha.setDate(amanha.getDate() + 1)
                          setDataAgendamento(amanha.toISOString().split('T')[0])
                          setHoraAgendamento('20:00')
                          setShowAgendarModal(true)
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Agendar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setPedidoParaCancelar(pedido)
                          setShowCancelarModal(true)
                        }}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  {pedido.status === 'AGENDADO' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(pedido.id, 'EM_ANDAMENTO')}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Iniciar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setPedidoParaCancelar(pedido)
                          setShowCancelarModal(true)
                        }}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  {pedido.status === 'EM_ANDAMENTO' && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => {
                        setPedidoParaConcluir(pedido)
                        setShowConcluirModal(true)
                      }}
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
                {/* Número de compradores */}
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">👥 Quantos compradores?</label>
                  <select
                    value={formData.numeroCompradores}
                    onChange={(e) => {
                      const num = Number(e.target.value)
                      const novosCompradores = Array.from({ length: num }, (_, i) => 
                        formData.compradores[i] || { nome: '', contato: '', bossesIds: [] }
                      )
                      setFormData({ 
                        ...formData, 
                        numeroCompradores: num,
                        compradores: novosCompradores
                      })
                      setTimeout(() => selecionarJogadoresAutomatico(), 100)
                    }}
                    className="w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600"
                  >
                    <option value={1}>1 comprador (carry solo)</option>
                    <option value={2}>2 compradores (carry duplo)</option>
                    <option value={3}>3 compradores (carry trio)</option>
                    <option value={4}>4 compradores (carry grupo)</option>
                  </select>
                </div>

                {/* Dados de cada comprador */}
                {formData.numeroCompradores === 1 ? (
                  // Comprador único (modo simples)
                  <>
                    <div>
                      <label className="block text-gray-300 mb-2">Nome do Cliente</label>
                      <input
                        type="text"
                        className="w-full bg-gray-700 text-white rounded px-4 py-2"
                        value={formData.compradores[0].nome}
                        onChange={(e) => {
                          const novosCompradores = [...formData.compradores]
                          novosCompradores[0] = { ...novosCompradores[0], nome: e.target.value }
                          setFormData({ ...formData, compradores: novosCompradores })
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Contato (Discord/WhatsApp)</label>
                      <input
                        type="text"
                        className="w-full bg-gray-700 text-white rounded px-4 py-2"
                        value={formData.compradores[0].contato}
                        onChange={(e) => {
                          const novosCompradores = [...formData.compradores]
                          novosCompradores[0] = { ...novosCompradores[0], contato: e.target.value }
                          setFormData({ ...formData, compradores: novosCompradores })
                        }}
                      />
                    </div>
                  </>
                ) : (
                  // Múltiplos compradores (modo detalhado)
                  <div className="space-y-4">
                    <div className="bg-blue-900/20 border border-blue-500/50 p-3 rounded">
                      <p className="text-blue-300 text-sm">
                        💡 <strong>Carry com múltiplos compradores:</strong> Preencha os dados de cada pessoa abaixo. 
                        Cada um pode escolher bosses diferentes!
                      </p>
                    </div>
                    
                    {formData.compradores.map((comprador, index) => (
                      <div key={index} className="bg-gray-700/50 p-4 rounded border border-gray-600">
                        <div className="font-semibold text-white mb-3">
                          👤 Comprador {index + 1}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Nome</label>
                            <input
                              type="text"
                              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600"
                              placeholder={`Nome do comprador ${index + 1}`}
                              value={comprador.nome}
                              onChange={(e) => {
                                const novosCompradores = [...formData.compradores]
                                novosCompradores[index] = { ...novosCompradores[index], nome: e.target.value }
                                setFormData({ ...formData, compradores: novosCompradores })
                              }}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Contato</label>
                            <input
                              type="text"
                              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600"
                              placeholder="Discord ou WhatsApp"
                              value={comprador.contato}
                              onChange={(e) => {
                                const novosCompradores = [...formData.compradores]
                                novosCompradores[index] = { ...novosCompradores[index], contato: e.target.value }
                                setFormData({ ...formData, compradores: novosCompradores })
                              }}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm mb-2">
                              🎯 Bosses que {comprador.nome || `Comprador ${index + 1}`} quer fazer:
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {bosses.map(boss => (
                                <button
                                  key={boss.id}
                                  type="button"
                                  onClick={() => {
                                    const novosCompradores = [...formData.compradores]
                                    const bossesAtuais = novosCompradores[index].bossesIds
                                    novosCompradores[index] = {
                                      ...novosCompradores[index],
                                      bossesIds: bossesAtuais.includes(boss.id)
                                        ? bossesAtuais.filter(id => id !== boss.id)
                                        : [...bossesAtuais, boss.id]
                                    }
                                    
                                    // Atualizar bosses totais do pedido
                                    const todosBosses = Array.from(new Set(
                                      novosCompradores.flatMap(c => c.bossesIds)
                                    ))
                                    
                                    setFormData({ 
                                      ...formData, 
                                      compradores: novosCompradores,
                                      bossesIds: todosBosses
                                    })
                                    
                                    setTimeout(() => selecionarJogadoresAutomatico(), 100)
                                  }}
                                  className={`p-2 rounded text-sm border-2 transition-colors ${
                                    comprador.bossesIds.includes(boss.id)
                                      ? boss.ordem === 0
                                        ? 'bg-purple-600 border-purple-500 text-white'
                                        : 'bg-blue-600 border-blue-500 text-white'
                                      : 'bg-gray-700 border-gray-600 text-gray-300'
                                  }`}
                                >
                                  <div className="font-bold">{boss.nome}</div>
                                  <div className="text-xs">{boss.preco}KK</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Só mostra seleção de bosses se for comprador único */}
                {formData.numeroCompradores === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-gray-300 font-semibold">Selecione os Bosses</label>
                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-gray-200">
                      <input
                        type="checkbox"
                        checked={formData.precoCustomizado}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setFormData(prev => {
                            // Inicializar preços customizados com valores padrão
                            const newBossesPrecos: Record<number, number> = {}
                            if (checked) {
                              prev.bossesIds.forEach(bossId => {
                                const boss = bosses.find(b => b.id === bossId)
                                if (boss) newBossesPrecos[bossId] = boss.preco
                              })
                            }
                            return {
                              ...prev,
                              precoCustomizado: checked,
                              bossesPrecos: newBossesPrecos
                            }
                          })
                        }}
                        className="w-4 h-4"
                      />
                      <span>💰 Preço Customizado (Amigos, Parcerias, etc)</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Hela separada - destaque */}
                    {bosses.filter(b => b.ordem === 0).map(boss => (
                      <div key={boss.id} className="col-span-2">
                        <button
                          type="button"
                          onClick={() => {
                            const novosCompradores = [...formData.compradores]
                            const bossesAtuais = novosCompradores[0].bossesIds
                            const incluiBoss = bossesAtuais.includes(boss.id)
                            
                            // Toggle boss no comprador
                            novosCompradores[0] = {
                              ...novosCompradores[0],
                              bossesIds: incluiBoss
                                ? bossesAtuais.filter(id => id !== boss.id)
                                : [...bossesAtuais, boss.id]
                            }
                            
                            // Atualizar bosses do pedido
                            const novosBossesIds = incluiBoss
                              ? formData.bossesIds.filter(id => id !== boss.id)
                              : [...formData.bossesIds, boss.id]
                            
                            setFormData({ 
                              ...formData, 
                              bossesIds: novosBossesIds,
                              compradores: novosCompradores 
                            })
                            
                            setTimeout(() => selecionarJogadoresAutomatico(), 100)
                          }}
                          className={`w-full p-4 rounded border-2 transition-colors ${
                            formData.bossesIds.includes(boss.id)
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : 'bg-gray-700 border-gray-600 text-gray-300'
                          }`}
                        >
                          <div className="font-bold text-lg">{boss.nome}</div>
                          <div className="text-sm">{boss.preco}KK (padrão)</div>
                        </button>
                        {formData.precoCustomizado && formData.bossesIds.includes(boss.id) && (
                          <input
                            type="number"
                            value={getBossPreco(boss.id)}
                            onChange={(e) => setBossPreco(boss.id, Number(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full mt-2 bg-gray-700 text-white rounded px-4 py-2 border border-gray-600"
                            placeholder="Preço customizado (KK)"
                          />
                        )}
                      </div>
                    ))}
                    
                    {/* Bosses 1-6 */}
                    {bosses.filter(b => b.ordem > 0).map(boss => (
                      <div key={boss.id}>
                        <button
                          type="button"
                          onClick={() => {
                            const novosCompradores = [...formData.compradores]
                            const bossesAtuais = novosCompradores[0].bossesIds
                            const incluiBoss = bossesAtuais.includes(boss.id)
                            
                            // Toggle boss no comprador
                            novosCompradores[0] = {
                              ...novosCompradores[0],
                              bossesIds: incluiBoss
                                ? bossesAtuais.filter(id => id !== boss.id)
                                : [...bossesAtuais, boss.id]
                            }
                            
                            // Atualizar bosses do pedido
                            const novosBossesIds = incluiBoss
                              ? formData.bossesIds.filter(id => id !== boss.id)
                              : [...formData.bossesIds, boss.id]
                            
                            setFormData({ 
                              ...formData, 
                              bossesIds: novosBossesIds,
                              compradores: novosCompradores 
                            })
                            
                            setTimeout(() => selecionarJogadoresAutomatico(), 100)
                          }}
                          className={`w-full p-3 rounded border-2 transition-colors ${
                            formData.bossesIds.includes(boss.id)
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-gray-700 border-gray-600 text-gray-300'
                          }`}
                        >
                          <div className="font-bold">{boss.nome}</div>
                          <div className="text-sm">{boss.preco}KK</div>
                        </button>
                        {formData.precoCustomizado && formData.bossesIds.includes(boss.id) && (
                          <input
                            type="number"
                            value={getBossPreco(boss.id)}
                            onChange={(e) => setBossPreco(boss.id, Number(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full mt-1 bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600"
                            placeholder="KK"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  {formData.precoCustomizado && (
                    <div className="mt-2 text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
                      💡 Modo customizado ativo - edite os valores acima para carry com desconto, amigos, parcerias, etc
                    </div>
                  )}
                </div>
                )}

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
                  <div className="mb-3">
                    <label className="block text-gray-300 font-semibold">
                      Jogadores Participantes ({formData.jogadoresIds.length}/{12 - formData.numeroCompradores})
                    </label>
                  </div>
                  
                  {/* MOSTRAR JOGADORES APENAS SE TIVER BOSSES SELECIONADOS */}
                  {formData.bossesIds.length === 0 ? (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">
                        ⬆️ Selecione pelo menos 1 boss acima para ver os jogadores disponíveis
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400 mb-3">
                        ⭐ Essenciais nunca saem • 💫 Por rodízio • {formData.numeroCompradores} slot(s) para comprador(es)
                        <br />
                        {formData.bossesIds.includes(bosses.find(b => b.nome === 'Hela')?.id || 0) 
                          ? '🔴 Selecionou HELA → Time HELA automático' 
                          : '🔵 Sem HELA → Time CARRYS automático'}
                      </p>
                      
                      {/* TIME PRINCIPAL (HELA) - Só mostra se tiver HELA selecionado */}
                  {formData.bossesIds.includes(bosses.find(b => b.nome === 'Hela')?.id || 0) && 
                   jogadores.filter((j: Jogador) => j.categorias?.includes('HELA')).length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-green-400 mb-2">
                      ⚔️ Time Principal (HELA)
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {jogadores.filter((j: Jogador) => j.categorias?.includes('HELA')).map((jogador: any) => {
                        const isEssencial = jogador.essencial
                        const isSelected = formData.jogadoresIds.includes(jogador.id)
                        
                        return (
                          <button
                            key={jogador.id}
                            onClick={() => toggleJogador(jogador.id)}
                            disabled={isEssencial}
                            className={`p-3 rounded border-2 transition-colors text-left ${
                              isSelected
                                ? isEssencial
                                  ? 'bg-yellow-600 border-yellow-500 text-white cursor-not-allowed'
                                  : 'bg-green-600 border-green-500 text-white'
                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                            }`}
                          >
                            <div className="flex items-center gap-1 font-bold">
                              {isEssencial && <span>⭐</span>}
                              {jogador.nick}
                            </div>
                            <div className="text-xs">
                              {isEssencial ? 'Essencial (fixo)' : 'Principal'}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  )}

                  {/* CARRYS (Boss 4-6) - Só mostra se não tiver HELA */}
                  {!formData.bossesIds.includes(bosses.find(b => b.nome === 'Hela')?.id || 0) &&
                   jogadores.filter((j: Jogador) => j.categorias?.includes('CARRYS')).length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-blue-400 mb-2">
                        🎯 Time Carrys (Boss 4-6)
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {jogadores.filter((j: Jogador) => j.categorias?.includes('CARRYS')).map((jogador: any) => {
                          const isSelected = formData.jogadoresIds.includes(jogador.id)
                          
                          return (
                            <button
                              key={jogador.id}
                              onClick={() => toggleJogador(jogador.id)}
                              className={`p-3 rounded border-2 transition-colors text-left ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-500 text-white'
                                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-blue-500'
                              }`}
                            >
                              <div className="flex items-center gap-1 font-bold">
                                🎯 {jogador.nick}
                              </div>
                              <div className="text-xs">Carrys</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* JOGADORES FORA DO RODÍZIO */}
                  {(() => {
                    const helaId = bosses.find(b => b.nome === 'Hela')?.id
                    const temHela = formData.bossesIds.includes(helaId || 0)
                    const categoriaTime = temHela ? 'HELA' : 'CARRYS'
                    
                    const timeCategoria = jogadores.filter((j: Jogador) => 
                      j.categorias?.includes(categoriaTime) && j.ativo && !j.essencial
                    )
                    
                    const jogadoresForaRodizio = timeCategoria.filter(j => 
                      !formData.jogadoresIds.includes(j.id)
                    )
                    
                    return jogadoresForaRodizio.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                          😴 Fora do Rodízio (Não participam deste carry)
                          <span className="text-xs font-normal text-gray-400">
                            Clique para adicionar manualmente
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {jogadoresForaRodizio.map((jogador: any) => {
                            const isSelected = formData.jogadoresIds.includes(jogador.id)
                            
                            return (
                              <button
                                key={jogador.id}
                                onClick={() => toggleJogador(jogador.id)}
                                className={`p-3 rounded border-2 transition-colors text-left ${
                                  isSelected
                                    ? 'bg-orange-600 border-orange-500 text-white'
                                    : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:border-orange-500'
                                }`}
                              >
                                <div className="flex items-center gap-1 font-bold">
                                  😴 {jogador.nick}
                                </div>
                                <div className="text-xs">Fora do rodízio</div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}

                  {/* SUPLENTES (APENAS PARA HELA E SUBSTITUIÇÃO MANUAL) */}
                  {formData.bossesIds.includes(bosses.find(b => b.nome === 'Hela')?.id || 0) && 
                   jogadores.filter((j: Jogador) => j.categorias?.includes('SUPLENTE')).length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                        🔄 Suplentes (APENAS para HELA - Use se alguém faltar)
                        <span className="text-xs font-normal text-gray-400">
                          Clique para substituir manualmente
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {jogadores.filter((j: Jogador) => j.categorias?.includes('SUPLENTE')).map((jogador: any) => {
                          const isSelected = formData.jogadoresIds.includes(jogador.id)
                          
                          return (
                            <button
                              key={jogador.id}
                              onClick={() => toggleJogador(jogador.id)}
                              className={`p-3 rounded border-2 transition-colors text-left ${
                                isSelected
                                  ? 'bg-yellow-600 border-yellow-500 text-white'
                                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-yellow-500'
                              }`}
                            >
                              <div className="flex items-center gap-1 font-bold">
                                🔄 {jogador.nick}
                              </div>
                              <div className="text-xs">Suplente</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                      <div className="mt-2 text-sm text-gray-400">
                        {formData.jogadoresIds.length} jogador(es) • {formData.numeroCompradores} comprador(es) • {12 - formData.jogadoresIds.length - formData.numeroCompradores} slot(s) vazios
                      </div>
                      
                      {/* JOGADORES NÃO CADASTRADOS (MANUAL) */}
                      {!formData.bossesIds.includes(bosses.find(b => b.nome === 'Hela')?.id || 0) && (
                        <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <label className="block text-gray-300 mb-2">
                            👤 Jogadores Não Cadastrados (opcional)
                          </label>
                          <p className="text-xs text-gray-400 mb-2">
                            Para carrys de Boss 1-6, você pode adicionar jogadores que não estão no sistema. 
                            Separe os nomes por vírgula (ex: Jogador1, Jogador2, Jogador3)
                          </p>
                          <input
                            type="text"
                            className="w-full bg-gray-700 text-white rounded px-4 py-2"
                            placeholder="Nome1, Nome2, Nome3..."
                            value={formData.jogadoresNaoCadastrados}
                            onChange={(e) => setFormData({ ...formData, jogadoresNaoCadastrados: e.target.value })}
                          />
                          {formData.jogadoresNaoCadastrados && (
                            <p className="text-xs text-yellow-400 mt-2">
                              ⚠️ Jogadores não cadastrados serão considerados pagos automaticamente
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
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

        {/* Modal Agendar Carry */}
        {showAgendarModal && pedidoParaAgendar && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAgendarModal(false)}
          >
            <div 
              className="bg-gray-800 rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Agendar Carry
                </h2>
                <button
                  onClick={() => setShowAgendarModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-300 text-sm mb-1">Cliente</div>
                  <div className="text-white font-bold">{pedidoParaAgendar.nomeCliente}</div>
                  <div className="text-gray-400 text-sm mt-2">
                    {pedidoParaAgendar.itens.map(i => i.boss.nome).join(', ')}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">📅 Data do Carry</label>
                  <input
                    type="date"
                    value={dataAgendamento}
                    onChange={(e) => setDataAgendamento(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none text-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">⏰ Horário</label>
                  <input
                    type="time"
                    value={horaAgendamento}
                    onChange={(e) => setHoraAgendamento(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none text-lg"
                  />
                </div>

                {dataAgendamento && horaAgendamento && (
                  <div className="bg-blue-900/30 border border-blue-500/50 p-3 rounded">
                    <div className="text-blue-300 text-sm mb-1">Carry agendado para:</div>
                    <div className="text-white font-bold">
                      {new Date(`${dataAgendamento}T${horaAgendamento}`).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })} às {horaAgendamento}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (dataAgendamento && horaAgendamento) {
                      const dataCompleta = `${dataAgendamento} ${horaAgendamento}`
                      handleUpdateStatus(pedidoParaAgendar.id, 'AGENDADO', dataCompleta)
                      setShowAgendarModal(false)
                    } else {
                      toast.warning('⚠️ Preencha data e horário!')
                    }
                  }}
                  className="flex-1"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirmar Agendamento
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowAgendarModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Excluir Pedido */}
        {showExcluirModal && pedidoParaExcluir && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowExcluirModal(false)}
          >
            <div 
              className="bg-gray-800 rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-red-500" />
                  Excluir Pedido
                </h2>
                <button
                  onClick={() => setShowExcluirModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-red-900/30 border border-red-500/50 p-4 rounded">
                  <div className="text-red-300 text-sm mb-1">⚠️ ATENÇÃO: Esta ação não pode ser desfeita!</div>
                  <div className="text-white font-bold mt-3">#{pedidoParaExcluir.id} - {pedidoParaExcluir.nomeCliente}</div>
                  <div className="text-gray-400 text-sm mt-2">
                    {pedidoParaExcluir.itens.map(i => i.boss.nome).join(', ')} • {pedidoParaExcluir.valorTotal}KK
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    Status: {pedidoParaExcluir.status}
                  </div>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-500/50 p-3 rounded">
                  <p className="text-yellow-300 text-sm">
                    💡 <strong>Quando usar:</strong> Para remover pedidos de teste ou criados por engano. 
                    Para cancelamentos normais, use o botão "Cancelar" que notifica o Discord.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="danger"
                  onClick={() => {
                    handleDeletePedido(pedidoParaExcluir.id)
                    setShowExcluirModal(false)
                  }}
                  className="flex-1"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Sim, Excluir Definitivamente
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowExcluirModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Cancelar Carry */}
        {showCancelarModal && pedidoParaCancelar && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCancelarModal(false)}
          >
            <div 
              className="bg-gray-800 rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Ban className="w-6 h-6 text-red-500" />
                  Cancelar Carry
                </h2>
                <button
                  onClick={() => setShowCancelarModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-red-900/30 border border-red-500/50 p-4 rounded">
                  <div className="text-red-300 text-sm mb-1">⚠️ Você está prestes a cancelar:</div>
                  <div className="text-white font-bold">{pedidoParaCancelar.nomeCliente}</div>
                  <div className="text-gray-400 text-sm mt-2">
                    {pedidoParaCancelar.itens.map(i => i.boss.nome).join(', ')}
                  </div>
                  {pedidoParaCancelar.dataAgendada && (
                    <div className="text-gray-400 text-sm mt-2">
                      📅 Agendado para: {new Date(pedidoParaCancelar.dataAgendada).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">💬 Motivo do Cancelamento</label>
                  <textarea
                    value={motivoCancelamento}
                    onChange={(e) => setMotivoCancelamento(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded px-4 py-3 border border-gray-600 focus:border-red-500 focus:outline-none"
                    rows={3}
                    placeholder="Explique o motivo do cancelamento..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Este motivo será enviado na notificação do Discord</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="danger"
                  onClick={() => {
                    handleUpdateStatus(pedidoParaCancelar.id, 'CANCELADO', undefined, motivoCancelamento || 'Sem motivo especificado')
                    setShowCancelarModal(false)
                    setMotivoCancelamento('')
                  }}
                  className="flex-1"
                >
                  <Ban className="w-5 h-5 mr-2" />
                  Confirmar Cancelamento
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCancelarModal(false)
                    setMotivoCancelamento('')
                  }}
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Concluir / Pagamento */}
        {showConcluirModal && pedidoParaConcluir && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConcluirModal(false)}
          >
            <div 
              className="bg-gray-800 rounded-lg max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Concluir Carry #{pedidoParaConcluir.id}
                </h2>
                <button
                  onClick={() => setShowConcluirModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-green-900/30 border border-green-500/50 p-4 rounded">
                  <div className="text-green-300 text-sm mb-1">✅ Carry a ser concluído:</div>
                  <div className="text-white font-bold">{pedidoParaConcluir.nomeCliente}</div>
                  <div className="text-gray-400 text-sm mt-2">
                    {pedidoParaConcluir.itens.map(i => i.boss.nome).join(', ')}
                  </div>
                  <div className="text-yellow-400 font-semibold mt-3">
                    💰 {pedidoParaConcluir.valorTotal}KK
                  </div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded">
                  <p className="text-white font-semibold mb-2">💵 Divisão do Pagamento</p>
                  <p className="text-gray-300 text-sm">
                    Valor será dividido igualmente entre todos os jogadores participantes.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    ⚠️ Jogadores não cadastrados serão marcados como pagos automaticamente.
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    ✉️ Jogadores cadastrados com Discord receberão uma mensagem privada sobre o pagamento.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="success"
                  onClick={() => {
                    handleUpdateStatus(pedidoParaConcluir.id, 'CONCLUIDO', undefined, undefined, true)
                    setShowConcluirModal(false)
                  }}
                  className="flex-1"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  💰 Concluir e Pagar Jogadores
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowConcluirModal(false)}
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar - Temporário: avisa que está em desenvolvimento */}
        {showEditModal && pedidoParaEditar && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <div 
              className="bg-gray-800 rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-6 h-6 text-blue-500" />
                  Editar Pedido #{pedidoParaEditar.id}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded">
                  <div className="text-blue-300 text-sm mb-2">📝 Dados do pedido:</div>
                  <div className="text-white font-bold mb-2">{pedidoParaEditar.nomeCliente}</div>
                  <div className="text-gray-300 text-sm">
                    <div>Contato: {pedidoParaEditar.contatoCliente}</div>
                    <div>Valor: {pedidoParaEditar.valorTotal}KK</div>
                    <div>Bosses: {pedidoParaEditar.itens.map(i => i.boss.nome).join(', ')}</div>
                  </div>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded">
                  <div className="text-yellow-300 text-sm">
                    🚧 <strong>Funcionalidade em desenvolvimento!</strong>
                  </div>
                  <p className="text-gray-300 text-sm mt-2">
                    A edição de pedidos estará disponível em breve. Por enquanto, você pode cancelar o pedido e criar um novo.
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </div>
    </div>
  )
}

