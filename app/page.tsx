'use client'

import { useState, useEffect } from 'react'
import { Calendar, UserPlus, Users, ListTodo, TrendingUp, Clock, Trophy } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Button } from './components/Button'
import { Card, CardHeader, CardTitle, CardContent } from './components/Card'
import { Input, Textarea, Select } from './components/Input'
import { Badge } from './components/Badge'

type Jogador = {
  id: number
  nick: string
  ativo: boolean
  vezesFora: number
  ultimaMissao: Date | null
}

type Suplente = {
  id: number
  nick: string
  ativo: boolean
  vezesJogou: number
  ultimaMissao: Date | null
}

type Missao = {
  id: number
  data: Date
  tipo: string
  jogadorFora: Jogador
  suplente?: Suplente | null
  carryNome?: string | null
  carryValor?: number
  status: string
  observacoes?: string | null
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'jogadores' | 'suplentes' | 'carrys'>('jogadores')
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [suplentes, setSuplentes] = useState<Suplente[]>([])
  const [missoes, setMissoes] = useState<Missao[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [novoJogador, setNovoJogador] = useState('')
  const [novoSuplente, setNovoSuplente] = useState('')
  const [novoCarry, setNovoCarry] = useState({
    data: new Date().toISOString().split('T')[0],
    torres: [] as string[], // ['Hela', '4', '5', '6']
    jogadorForaId: '',
    carryNome: '',
    carryValor: '',
    status: 'Agendado',
    observacoes: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [jogadoresRes, suplentesRes, missoesRes] = await Promise.all([
        fetch('/api/jogadores'),
        fetch('/api/suplentes'),
        fetch('/api/missoes')
      ])
      
      const jogadoresData = await jogadoresRes.json()
      const suplentesData = await suplentesRes.json()
      const missoesData = await missoesRes.json()
      
      setJogadores(jogadoresData)
      setSuplentes(suplentesData)
      setMissoes(missoesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const adicionarJogador = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoJogador.trim()) return

    try {
      const res = await fetch('/api/jogadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick: novoJogador })
      })
      
      if (res.ok) {
        setNovoJogador('')
        carregarDados()
      }
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error)
    }
  }

  const adicionarSuplente = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoSuplente.trim()) return

    try {
      const res = await fetch('/api/suplentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick: novoSuplente })
      })
      
      if (res.ok) {
        setNovoSuplente('')
        carregarDados()
      }
    } catch (error) {
      console.error('Erro ao adicionar suplente:', error)
    }
  }

  const adicionarCarry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoCarry.jogadorForaId || novoCarry.torres.length === 0) return

    try {
      const res = await fetch('/api/missoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...novoCarry,
          tipo: novoCarry.torres.join(', '),  // "Hela, 4, 5"
          suplenteId: null
        })
      })
      
      if (res.ok) {
        setNovoCarry({
          data: new Date().toISOString().split('T')[0],
          torres: [],
          jogadorForaId: '',
          carryNome: '',
          carryValor: '',
          status: 'Agendado',
          observacoes: ''
        })
        carregarDados()
      }
    } catch (error) {
      console.error('Erro ao adicionar carry:', error)
    }
  }
  
  const toggleTorre = (torre: string) => {
    setNovoCarry(prev => ({
      ...prev,
      torres: prev.torres.includes(torre)
        ? prev.torres.filter(t => t !== torre)
        : [...prev.torres, torre]
    }))
  }

  const getProximoJogadorFora = () => {
    if (jogadores.length === 0) return null
    
    const sorted = [...jogadores].sort((a, b) => {
      if (a.vezesFora !== b.vezesFora) {
        return a.vezesFora - b.vezesFora
      }
      if (!a.ultimaMissao) return -1
      if (!b.ultimaMissao) return 1
      return new Date(a.ultimaMissao).getTime() - new Date(b.ultimaMissao).getTime()
    })
    
    return sorted[0]
  }

  const proximoJogador = getProximoJogadorFora()
  const totalMissoesConcluidas = missoes.filter(m => m.status === 'Concluído').length
  const missoesAgendadas = missoes.filter(m => m.status === 'Agendado').length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-slate-900 mx-auto mb-4"></div>
          <div className="text-slate-900 text-xl font-semibold">Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1 flex items-center justify-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            Rodízio Ragnatales
          </h1>
          <p className="text-slate-600 text-sm">Sistema de Gerenciamento de Carrys</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <Card gradient hover className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Users className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="text-slate-600 text-xs">Jogadores</p>
                <p className="text-slate-900 text-xl font-bold">{jogadores.length}</p>
              </div>
            </div>
          </Card>
          
          <Card gradient hover className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="text-slate-600 text-xs">Suplentes</p>
                <p className="text-slate-900 text-xl font-bold">{suplentes.length}</p>
              </div>
            </div>
          </Card>
          
          <Card gradient hover className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Trophy className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-slate-600 text-xs">Concluídas</p>
                <p className="text-slate-900 text-xl font-bold">{totalMissoesConcluidas}</p>
              </div>
            </div>
          </Card>
          
          <Card gradient hover className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-slate-600 text-xs">Agendadas</p>
                <p className="text-slate-900 text-xl font-bold">{missoesAgendadas}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Próximo Jogador */}
        {proximoJogador && (
          <Card gradient className="mb-4 bg-slate-900 border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-white text-sm font-semibold">🎯 Próximo a Ficar de Fora</h2>
                <p className="text-xl font-bold text-white">{proximoJogador.nick}</p>
                <p className="text-slate-300 text-xs">
                  {proximoJogador.vezesFora}x fora
                  {proximoJogador.ultimaMissao 
                    ? ` • ${formatDate(proximoJogador.ultimaMissao)}`
                    : ' • Nunca ficou'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 mb-6 shadow-lg border border-slate-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('jogadores')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'jogadores'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm">Jogadores</span>
              <Badge variant="info">{jogadores.length}</Badge>
            </button>
            <button
              onClick={() => setActiveTab('suplentes')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'suplentes'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">Suplentes</span>
              <Badge variant="info">{suplentes.length}</Badge>
            </button>
            <button
              onClick={() => setActiveTab('carrys')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'carrys'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span className="text-sm">Carrys</span>
              <Badge variant="info">{missoes.length}</Badge>
            </button>
          </div>
        </div>

        {/* Content */}
        <Card className="shadow-lg border border-slate-200">
          {/* Jogadores Tab */}
          {activeTab === 'jogadores' && (
            <div>
              <CardHeader className="mb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="w-5 h-5" />
                  Jogadores Principais
                </CardTitle>
              </CardHeader>
              
              {/* Form */}
              <form onSubmit={adicionarJogador} className="mb-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={novoJogador}
                    onChange={(e) => setNovoJogador(e.target.value)}
                    placeholder="Nick do jogador..."
                    className="flex-1 text-sm"
                  />
                  <Button type="submit">
                    <UserPlus className="w-4 h-4" />
                    Adicionar
                  </Button>
                </div>
              </form>

              {/* Lista */}
              <div className="grid gap-3">
                {jogadores.map((jogador, index) => (
                  <Card 
                    key={jogador.id} 
                    hover 
                    className="animate-slide-up p-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">
                          {jogador.vezesFora === 0 ? '⭐' : '👤'}
                        </div>
                        <div>
                          <h3 className="text-slate-900 font-bold text-lg mb-1">{jogador.nick}</h3>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="default">
                              {jogador.vezesFora}x fora
                            </Badge>
                            {jogador.ultimaMissao && (
                              <Badge variant="info">
                                Última: {formatDate(jogador.ultimaMissao)}
                              </Badge>
                            )}
                            {jogador.vezesFora === 0 && (
                              <Badge variant="success">
                                Nunca ficou de fora
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {jogadores.length === 0 && (
                  <div className="text-center py-16">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">Nenhum jogador cadastrado ainda</p>
                    <p className="text-slate-400 text-sm mt-2">Adicione o primeiro jogador acima!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suplentes Tab */}
          {activeTab === 'suplentes' && (
            <div>
              <CardHeader className="mb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <UserPlus className="w-5 h-5" />
                  Suplentes
                </CardTitle>
              </CardHeader>
              
              {/* Form */}
              <form onSubmit={adicionarSuplente} className="mb-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={novoSuplente}
                    onChange={(e) => setNovoSuplente(e.target.value)}
                    placeholder="Nick do suplente..."
                    className="flex-1 text-sm"
                  />
                  <Button type="submit">
                    <UserPlus className="w-4 h-4" />
                    Adicionar
                  </Button>
                </div>
              </form>

              {/* Lista */}
              <div className="grid gap-3">
                {suplentes.map((suplente, index) => (
                  <Card 
                    key={suplente.id} 
                    hover
                    className="animate-slide-up p-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🛡️</div>
                        <div>
                          <h3 className="text-slate-900 font-bold text-lg mb-1">{suplente.nick}</h3>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="default">
                              {suplente.vezesJogou}x jogou
                            </Badge>
                            {suplente.ultimaMissao && (
                              <Badge variant="info">
                                Última: {formatDate(suplente.ultimaMissao)}
                              </Badge>
                            )}
                            {suplente.vezesJogou === 0 && (
                              <Badge variant="warning">
                                Ainda não jogou
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {suplentes.length === 0 && (
                  <div className="text-center py-16">
                    <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">Nenhum suplente cadastrado ainda</p>
                    <p className="text-slate-400 text-sm mt-2">Adicione o primeiro suplente acima!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Carrys Tab */}
          {activeTab === 'carrys' && (
            <div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ListTodo className="w-5 h-5" />
                  Carrys
                </CardTitle>
              </CardHeader>
              
              {/* Form */}
              <Card gradient className="mb-4 p-4">
                <form onSubmit={adicionarCarry} className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      type="date"
                      label="Data"
                      value={novoCarry.data}
                      onChange={(e) => setNovoCarry({ ...novoCarry, data: e.target.value })}
                      className="text-sm"
                    />
                    
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-2">Torres *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Hela', '4', '5', '6'].map((torre) => (
                          <label key={torre} className="flex items-center gap-2 p-2 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={novoCarry.torres.includes(torre)}
                              onChange={() => toggleTorre(torre)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-medium">Torre {torre}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Select
                      label="Jogador de Fora *"
                      value={novoCarry.jogadorForaId}
                      onChange={(e) => setNovoCarry({ ...novoCarry, jogadorForaId: e.target.value })}
                      required
                      className="text-sm"
                    >
                      <option value="">Selecione...</option>
                      {jogadores.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.nick} ({j.vezesFora}x fora)
                        </option>
                      ))}
                    </Select>

                    <Input
                      type="text"
                      label="Cliente"
                      value={novoCarry.carryNome}
                      onChange={(e) => setNovoCarry({ ...novoCarry, carryNome: e.target.value })}
                      placeholder="Nome do cliente"
                      className="text-sm"
                    />
                    
                    <Input
                      type="number"
                      step="0.01"
                      label="Valor (R$)"
                      value={novoCarry.carryValor}
                      onChange={(e) => setNovoCarry({ ...novoCarry, carryValor: e.target.value })}
                      placeholder="0.00"
                      className="text-sm"
                    />

                    <Select
                      label="Status"
                      value={novoCarry.status}
                      onChange={(e) => setNovoCarry({ ...novoCarry, status: e.target.value })}
                      className="text-sm"
                    >
                      <option value="Agendado">Agendado</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </Select>

                    <div className="md:col-span-2">
                      <Textarea
                        label="Observações"
                        value={novoCarry.observacoes}
                        onChange={(e) => setNovoCarry({ ...novoCarry, observacoes: e.target.value })}
                        placeholder="Observações opcionais..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <Button type="submit" fullWidth>
                    <Calendar className="w-4 h-4" />
                    Registrar Carry
                  </Button>
                </form>
              </Card>

              {/* Lista */}
              <div className="grid gap-3">
                {missoes.map((missao, index) => (
                  <Card 
                    key={missao.id} 
                    hover
                    className="animate-slide-up p-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <h3 className="text-slate-900 font-bold text-base">
                          {formatDate(missao.data)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="default">
                          {missao.tipo}
                        </Badge>
                        <Badge variant={
                          missao.status === 'Concluído' ? 'success' : 
                          missao.status === 'Cancelado' ? 'danger' : 
                          'warning'
                        }>
                          {missao.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-slate-600 text-sm">
                      <p className="flex items-center gap-2">
                        <span>👤</span>
                        <strong>Jogador:</strong> {missao.jogadorFora?.nick || 'N/A'}
                      </p>
                      {missao.carryNome && (
                        <p className="flex items-center gap-2">
                          <span>👨‍💼</span>
                          <strong>Cliente:</strong> {missao.carryNome}
                        </p>
                      )}
                      {missao.carryValor && missao.carryValor > 0 && (
                        <p className="flex items-center gap-2">
                          <span>💰</span>
                          <strong>Valor:</strong> {formatCurrency(missao.carryValor)}
                        </p>
                      )}
                      {missao.observacoes && (
                        <p className="flex items-center gap-2 italic text-slate-500 text-xs">
                          <span>📝</span>
                          {missao.observacoes}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
                {missoes.length === 0 && (
                  <div className="text-center py-12">
                    <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">Nenhum carry cadastrado ainda</p>
                    <p className="text-slate-400 text-sm mt-1">Registre o primeiro carry acima!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
        </div>
    </div>
  )
}
