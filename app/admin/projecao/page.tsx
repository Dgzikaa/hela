'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign, Calendar, Users, Wallet, Target } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import { ToolsLayout } from '@/app/components/ToolsLayout'

interface Jogador {
  id: number
  nick: string
  categorias: string
  totalCarrys: number
  totalGanho: number
  ativo: boolean
  essencial: boolean
}

interface Pedido {
  id: number
  nomeCliente: string
  status: string
  dataAgendada: string | null
  valorTotal: number
  participacoes: {
    jogadorId: number
    jogador: {
      id: number
      nick: string
    }
    valorRecebido: number
    pago: boolean
  }[]
}

interface ProjecaoJogador {
  jogador: Jogador
  ganhosConcluidos: number // Já recebeu (pedidos concluídos)
  projecaoTotal: number // Vai receber (pedidos agendados)
  projecaoSemana: number // Projeção próximos 7 dias
  projecaoMes: number // Projeção próximos 30 dias
  carrysAgendados: number
  carrysConcluidos: number
}

export default function ProjecaoPage() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [projecoes, setProjecoes] = useState<ProjecaoJogador[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODOS')
  const [taxaConversao, setTaxaConversao] = useState<number>(0.35) // 1kk = 0.35 reais
  const [mostrarEmReais, setMostrarEmReais] = useState<boolean>(false)

  useEffect(() => {
    fetchData()
    // Carregar taxa salva do localStorage
    const taxaSalva = localStorage.getItem('taxaConversaoKK')
    if (taxaSalva) {
      setTaxaConversao(parseFloat(taxaSalva))
    }
  }, [])

  useEffect(() => {
    if (jogadores.length > 0 && pedidos.length > 0) {
      calcularProjecoes()
    }
  }, [jogadores, pedidos])

  const fetchData = async () => {
    try {
      const [jogadoresRes, pedidosRes] = await Promise.all([
        fetch('/api/jogadores'),
        fetch('/api/pedidos')
      ])

      if (jogadoresRes.ok && pedidosRes.ok) {
        const jogadoresData = await jogadoresRes.json()
        const pedidosData = await pedidosRes.json()
        
        setJogadores(jogadoresData.filter((j: Jogador) => j.ativo))
        setPedidos(pedidosData)
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularProjecoes = () => {
    const hoje = new Date()
    const umaSemana = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000)
    const umMes = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000)

    const projecoesCalculadas: ProjecaoJogador[] = jogadores.map(jogador => {
      // Pedidos concluídos (já recebeu)
      const pedidosConcluidos = pedidos.filter(p => 
        p.status === 'CONCLUIDO' && 
        p.participacoes && 
        p.participacoes.some(part => part.jogadorId === jogador.id)
      )

      const ganhosConcluidos = pedidosConcluidos.reduce((total, pedido) => {
        const participacao = pedido.participacoes?.find(p => p.jogadorId === jogador.id)
        return total + (participacao?.valorRecebido || 0)
      }, 0)

      // Pedidos agendados (vai receber)
      const pedidosAgendados = pedidos.filter(p => 
        ['PENDENTE', 'APROVADO', 'AGENDADO', 'EM_ANDAMENTO'].includes(p.status) &&
        p.participacoes && 
        p.participacoes.some(part => part.jogadorId === jogador.id)
      )

      const projecaoTotal = pedidosAgendados.reduce((total, pedido) => {
        const numParticipantes = pedido.participacoes?.length || 0
        const valorPorJogador = numParticipantes > 0 ? Math.floor(pedido.valorTotal / numParticipantes) : 0
        return total + valorPorJogador
      }, 0)

      // Projeção próxima semana
      const pedidosSemana = pedidosAgendados.filter(p => {
        if (!p.dataAgendada) return false
        const data = new Date(p.dataAgendada)
        return data >= hoje && data <= umaSemana
      })

      const projecaoSemana = pedidosSemana.reduce((total, pedido) => {
        const numParticipantes = pedido.participacoes?.length || 0
        const valorPorJogador = numParticipantes > 0 ? Math.floor(pedido.valorTotal / numParticipantes) : 0
        return total + valorPorJogador
      }, 0)

      // Projeção próximo mês
      const pedidosMes = pedidosAgendados.filter(p => {
        if (!p.dataAgendada) return false
        const data = new Date(p.dataAgendada)
        return data >= hoje && data <= umMes
      })

      const projecaoMes = pedidosMes.reduce((total, pedido) => {
        const numParticipantes = pedido.participacoes?.length || 0
        const valorPorJogador = numParticipantes > 0 ? Math.floor(pedido.valorTotal / numParticipantes) : 0
        return total + valorPorJogador
      }, 0)

      return {
        jogador,
        ganhosConcluidos,
        projecaoTotal,
        projecaoSemana,
        projecaoMes,
        carrysAgendados: pedidosAgendados.length,
        carrysConcluidos: pedidosConcluidos.length
      }
    })

    // Ordenar por projeção total (maior primeiro)
    projecoesCalculadas.sort((a, b) => b.projecaoTotal - a.projecaoTotal)
    setProjecoes(projecoesCalculadas)
  }

  const formatarValor = (valor: number): string => {
    if (valor === 0) return '0'
    if (valor >= 100000) {
      const bilhoes = (valor / 100000).toFixed(2)
      return `${bilhoes}b`
    }
    return `${valor}kk`
  }

  const formatarValorReais = (valorKK: number): string => {
    const valorReais = valorKK * taxaConversao
    return valorReais.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const salvarTaxaConversao = (novaTaxa: number) => {
    setTaxaConversao(novaTaxa)
    localStorage.setItem('taxaConversaoKK', novaTaxa.toString())
  }

  const getCategoriaColor = (categorias: string) => {
    if (categorias.includes('HELA')) return 'bg-purple-600'
    if (categorias.includes('CARRYS')) return 'bg-blue-600'
    if (categorias.includes('SUPLENTE')) return 'bg-yellow-600'
    return 'bg-gray-600'
  }

  const getCategoriaLabel = (categorias: string) => {
    const cats = categorias.split(',')
    if (cats.includes('HELA') && cats.includes('CARRYS')) return 'HELA + CARRYS'
    if (cats.includes('HELA')) return 'HELA'
    if (cats.includes('CARRYS')) return 'CARRYS'
    if (cats.includes('SUPLENTE')) return 'SUPLENTE'
    return categorias
  }

  // Filtrar por categoria
  const projecoesFiltradas = filtroCategoria === 'TODOS' 
    ? projecoes 
    : projecoes.filter(p => p.jogador.categorias.includes(filtroCategoria))

  // Estatísticas gerais
  const totalGanhosConcluidos = projecoes.reduce((acc, p) => acc + p.ganhosConcluidos, 0)
  const totalProjecao = projecoes.reduce((acc, p) => acc + p.projecaoTotal, 0)
  const totalProjecaoSemana = projecoes.reduce((acc, p) => acc + p.projecaoSemana, 0)
  const totalProjecaoMes = projecoes.reduce((acc, p) => acc + p.projecaoMes, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-400">Carregando...</div>
      </div>
    )
  }

  return (
    <ToolsLayout title="📊 Projeção de Ganhos">
      <div className="max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-end items-center mb-6">
          {/* Configuração de Taxa de Conversão */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs text-gray-600 font-semibold">
                  💱 Taxa de Conversão:
                </label>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm text-gray-600">1kk =</span>
                  <input
                    type="number"
                    step="0.01"
                    value={taxaConversao}
                    onChange={(e) => salvarTaxaConversao(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm font-semibold"
                  />
                  <span className="text-sm text-gray-600">reais</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  1b = R$ {(taxaConversao * 1000).toFixed(2)}
                </div>
              </div>
              
              <div className="border-l border-gray-300 pl-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mostrarEmReais}
                    onChange={(e) => setMostrarEmReais(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">Mostrar em R$</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Ganhos Concluídos</div>
                <div className="text-2xl font-bold text-gray-900">
                  {mostrarEmReais ? formatarValorReais(totalGanhosConcluidos) : formatarValor(totalGanhosConcluidos)}
                </div>
                {mostrarEmReais && (
                  <div className="text-xs text-gray-500 mt-1">{formatarValor(totalGanhosConcluidos)}</div>
                )}
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Projeção Total</div>
                <div className="text-2xl font-bold text-gray-900">
                  {mostrarEmReais ? formatarValorReais(totalProjecao) : formatarValor(totalProjecao)}
                </div>
                {mostrarEmReais && (
                  <div className="text-xs text-gray-500 mt-1">{formatarValor(totalProjecao)}</div>
                )}
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Próximos 7 dias</div>
                <div className="text-2xl font-bold text-gray-900">
                  {mostrarEmReais ? formatarValorReais(totalProjecaoSemana) : formatarValor(totalProjecaoSemana)}
                </div>
                {mostrarEmReais && (
                  <div className="text-xs text-gray-500 mt-1">{formatarValor(totalProjecaoSemana)}</div>
                )}
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Próximos 30 dias</div>
                <div className="text-2xl font-bold text-gray-900">
                  {mostrarEmReais ? formatarValorReais(totalProjecaoMes) : formatarValor(totalProjecaoMes)}
                </div>
                {mostrarEmReais && (
                  <div className="text-xs text-gray-500 mt-1">{formatarValor(totalProjecaoMes)}</div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFiltroCategoria('TODOS')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filtroCategoria === 'TODOS'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos ({projecoes.length})
          </button>
          <button
            onClick={() => setFiltroCategoria('HELA')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filtroCategoria === 'HELA'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            HELA ({projecoes.filter(p => p.jogador.categorias.includes('HELA')).length})
          </button>
          <button
            onClick={() => setFiltroCategoria('CARRYS')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filtroCategoria === 'CARRYS'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            CARRYS ({projecoes.filter(p => p.jogador.categorias.includes('CARRYS')).length})
          </button>
          <button
            onClick={() => setFiltroCategoria('SUPLENTE')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filtroCategoria === 'SUPLENTE'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            SUPLENTES ({projecoes.filter(p => p.jogador.categorias.includes('SUPLENTE')).length})
          </button>
        </div>

        {/* Lista de Projeções por Jogador */}
        <div className="space-y-4">
          {projecoesFiltradas.map(projecao => (
            <Card key={projecao.jogador.id} hover>
              <div className="flex items-start justify-between">
                {/* Info do Jogador */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{projecao.jogador.nick}</h3>
                    <Badge variant="default" className={getCategoriaColor(projecao.jogador.categorias)}>
                      {getCategoriaLabel(projecao.jogador.categorias)}
                    </Badge>
                    {projecao.jogador.essencial && (
                      <Badge variant="warning">⭐ Essencial</Badge>
                    )}
                  </div>

                  {/* Estatísticas em Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Ganhos Concluídos */}
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-xs text-green-600 font-semibold mb-1">✅ Já Recebeu</div>
                      <div className="text-2xl font-bold text-green-700">
                        {mostrarEmReais ? formatarValorReais(projecao.ganhosConcluidos) : formatarValor(projecao.ganhosConcluidos)}
                      </div>
                      {mostrarEmReais && (
                        <div className="text-xs text-green-600">{formatarValor(projecao.ganhosConcluidos)}</div>
                      )}
                      <div className="text-xs text-green-600 mt-1">{projecao.carrysConcluidos} carrys</div>
                    </div>

                    {/* Projeção Total */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-blue-600 font-semibold mb-1">🎯 Vai Receber</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {mostrarEmReais ? formatarValorReais(projecao.projecaoTotal) : formatarValor(projecao.projecaoTotal)}
                      </div>
                      {mostrarEmReais && (
                        <div className="text-xs text-blue-600">{formatarValor(projecao.projecaoTotal)}</div>
                      )}
                      <div className="text-xs text-blue-600 mt-1">{projecao.carrysAgendados} agendados</div>
                    </div>

                    {/* Projeção Semana */}
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-xs text-purple-600 font-semibold mb-1">📅 Próximos 7 dias</div>
                      <div className="text-xl font-bold text-purple-700">
                        {mostrarEmReais ? formatarValorReais(projecao.projecaoSemana) : formatarValor(projecao.projecaoSemana)}
                      </div>
                      {mostrarEmReais && (
                        <div className="text-xs text-purple-600">{formatarValor(projecao.projecaoSemana)}</div>
                      )}
                    </div>

                    {/* Projeção Mês */}
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-xs text-orange-600 font-semibold mb-1">📆 Próximos 30 dias</div>
                      <div className="text-xl font-bold text-orange-700">
                        {mostrarEmReais ? formatarValorReais(projecao.projecaoMes) : formatarValor(projecao.projecaoMes)}
                      </div>
                      {mostrarEmReais && (
                        <div className="text-xs text-orange-600">{formatarValor(projecao.projecaoMes)}</div>
                      )}
                    </div>

                    {/* Total Geral */}
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <div className="text-xs text-gray-300 font-semibold mb-1">💰 Total Geral</div>
                      <div className="text-xl font-bold text-white">
                        {mostrarEmReais 
                          ? formatarValorReais(projecao.ganhosConcluidos + projecao.projecaoTotal)
                          : formatarValor(projecao.ganhosConcluidos + projecao.projecaoTotal)
                        }
                      </div>
                      {mostrarEmReais && (
                        <div className="text-xs text-gray-300">{formatarValor(projecao.ganhosConcluidos + projecao.projecaoTotal)}</div>
                      )}
                      <div className="text-xs text-gray-300 mt-1">
                        {projecao.carrysConcluidos + projecao.carrysAgendados} carrys
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {projecoesFiltradas.length === 0 && (
            <Card>
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Nenhum jogador encontrado nesta categoria</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ToolsLayout>
  )
}

