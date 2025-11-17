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
  const [activeTab, setActiveTab] = useState<'jogadores' | 'suplentes' | 'missoes'>('jogadores')
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [suplentes, setSuplentes] = useState<Suplente[]>([])
  const [missoes, setMissoes] = useState<Missao[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [novoJogador, setNovoJogador] = useState('')
  const [novoSuplente, setNovoSuplente] = useState('')
  const [novaMissao, setNovaMissao] = useState({
    data: new Date().toISOString().split('T')[0],
    tipo: 'Normal',
    jogadorForaId: '',
    suplenteId: '',
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

  const adicionarMissao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novaMissao.jogadorForaId) return

    try {
      const res = await fetch('/api/missoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaMissao)
      })
      
      if (res.ok) {
        setNovaMissao({
          data: new Date().toISOString().split('T')[0],
          tipo: 'Normal',
          jogadorForaId: '',
          suplenteId: '',
          carryNome: '',
          carryValor: '',
          status: 'Agendado',
          observacoes: ''
        })
        carregarDados()
      }
    } catch (error) {
      console.error('Erro ao adicionar missão:', error)
    }
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold">Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 flex items-center justify-center gap-4 drop-shadow-2xl">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl">
              <Calendar className="w-10 h-10" />
            </div>
            Rodízio Ragnatales
          </h1>
          <p className="text-purple-200 text-lg">Sistema de Gerenciamento de Missões</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card gradient hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-200 text-sm">Jogadores</p>
                <p className="text-white text-2xl font-bold">{jogadores.length}</p>
              </div>
            </div>
          </Card>
          
          <Card gradient hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-200 text-sm">Suplentes</p>
                <p className="text-white text-2xl font-bold">{suplentes.length}</p>
              </div>
            </div>
          </Card>
          
          <Card gradient hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-200 text-sm">Concluídas</p>
                <p className="text-white text-2xl font-bold">{totalMissoesConcluidas}</p>
              </div>
            </div>
          </Card>
          
          <Card gradient hover>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-200 text-sm">Agendadas</p>
                <p className="text-white text-2xl font-bold">{missoesAgendadas}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Próximo Jogador */}
        {proximoJogador && (
          <Card gradient className="mb-6 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-400/50">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-white text-xl font-semibold mb-1">🎯 Próximo a Ficar de Fora</h2>
                <p className="text-3xl font-bold text-white mb-1">{proximoJogador.nick}</p>
                <p className="text-purple-100">
                  Ficou fora <strong>{proximoJogador.vezesFora}x</strong>
                  {proximoJogador.ultimaMissao 
                    ? ` • Última: ${formatDate(proximoJogador.ultimaMissao)}`
                    : ' • Nunca ficou de fora'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 mb-6 shadow-2xl border border-white/20">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('jogadores')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                activeTab === 'jogadores'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Jogadores</span>
              <Badge variant="info">{jogadores.length}</Badge>
            </button>
            <button
              onClick={() => setActiveTab('suplentes')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                activeTab === 'suplentes'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>Suplentes</span>
              <Badge variant="info">{suplentes.length}</Badge>
            </button>
            <button
              onClick={() => setActiveTab('missoes')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                activeTab === 'missoes'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ListTodo className="w-5 h-5" />
              <span>Missões</span>
              <Badge variant="info">{missoes.length}</Badge>
            </button>
          </div>
        </div>

        {/* Content */}
        <Card className="shadow-2xl border border-white/20">
          {/* Jogadores Tab */}
          {activeTab === 'jogadores' && (
            <div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="w-7 h-7" />
                  Jogadores Principais
                </CardTitle>
              </CardHeader>
              
              {/* Form */}
              <form onSubmit={adicionarJogador} className="mb-6">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={novoJogador}
                    onChange={(e) => setNovoJogador(e.target.value)}
                    placeholder="Digite o nick do jogador..."
                    className="flex-1"
                  />
                  <Button type="submit" size="lg">
                    <UserPlus className="w-5 h-5" />
                    Adicionar
                  </Button>
                </div>
              </form>

              {/* Lista */}
              <div className="grid gap-4">
                {jogadores.map((jogador, index) => (
                  <Card 
                    key={jogador.id} 
                    hover 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">
                          {jogador.vezesFora === 0 ? '⭐' : '👤'}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-xl mb-1">{jogador.nick}</h3>
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
                    <Users className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
                    <p className="text-purple-200 text-lg">Nenhum jogador cadastrado ainda</p>
                    <p className="text-purple-300 text-sm mt-2">Adicione o primeiro jogador acima!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suplentes Tab */}
          {activeTab === 'suplentes' && (
            <div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserPlus className="w-7 h-7" />
                  Suplentes
                </CardTitle>
              </CardHeader>
              
              {/* Form */}
              <form onSubmit={adicionarSuplente} className="mb-6">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={novoSuplente}
                    onChange={(e) => setNovoSuplente(e.target.value)}
                    placeholder="Digite o nick do suplente..."
                    className="flex-1"
                  />
                  <Button type="submit" size="lg">
                    <UserPlus className="w-5 h-5" />
                    Adicionar
                  </Button>
                </div>
              </form>

              {/* Lista */}
              <div className="grid gap-4">
                {suplentes.map((suplente, index) => (
                  <Card 
                    key={suplente.id} 
                    hover
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">🛡️</div>
                        <div>
                          <h3 className="text-white font-bold text-xl mb-1">{suplente.nick}</h3>
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
                    <UserPlus className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
                    <p className="text-purple-200 text-lg">Nenhum suplente cadastrado ainda</p>
                    <p className="text-purple-300 text-sm mt-2">Adicione o primeiro suplente acima!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Missões Tab */}
          {activeTab === 'missoes' && (
            <div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <ListTodo className="w-7 h-7" />
                  Missões / Rodízio
                </CardTitle>
              </CardHeader>
              
              {/* Form */}
              <Card gradient className="mb-6">
                <form onSubmit={adicionarMissao} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="Data da Missão"
                      value={novaMissao.data}
                      onChange={(e) => setNovaMissao({ ...novaMissao, data: e.target.value })}
                    />
                    
                    <Select
                      label="Tipo de Missão"
                      value={novaMissao.tipo}
                      onChange={(e) => setNovaMissao({ ...novaMissao, tipo: e.target.value })}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Suplente">Suplente</option>
                      <option value="Carry">Carry</option>
                    </Select>

                    <Select
                      label="Jogador de Fora *"
                      value={novaMissao.jogadorForaId}
                      onChange={(e) => setNovaMissao({ ...novaMissao, jogadorForaId: e.target.value })}
                      required
                    >
                      <option value="">Selecione...</option>
                      {jogadores.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.nick} ({j.vezesFora}x fora)
                        </option>
                      ))}
                    </Select>

                    {novaMissao.tipo === 'Suplente' && (
                      <Select
                        label="Suplente"
                        value={novaMissao.suplenteId}
                        onChange={(e) => setNovaMissao({ ...novaMissao, suplenteId: e.target.value })}
                      >
                        <option value="">Selecione...</option>
                        {suplentes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nick} ({s.vezesJogou}x jogou)
                          </option>
                        ))}
                      </Select>
                    )}

                    {novaMissao.tipo === 'Carry' && (
                      <>
                        <Input
                          type="text"
                          label="Nome do Carry"
                          value={novaMissao.carryNome}
                          onChange={(e) => setNovaMissao({ ...novaMissao, carryNome: e.target.value })}
                          placeholder="Nome do carry"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          label="Valor (R$)"
                          value={novaMissao.carryValor}
                          onChange={(e) => setNovaMissao({ ...novaMissao, carryValor: e.target.value })}
                          placeholder="0.00"
                        />
                      </>
                    )}

                    <Select
                      label="Status"
                      value={novaMissao.status}
                      onChange={(e) => setNovaMissao({ ...novaMissao, status: e.target.value })}
                    >
                      <option value="Agendado">Agendado</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </Select>

                    <div className="md:col-span-2">
                      <Textarea
                        label="Observações"
                        value={novaMissao.observacoes}
                        onChange={(e) => setNovaMissao({ ...novaMissao, observacoes: e.target.value })}
                        placeholder="Observações opcionais..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <Button type="submit" fullWidth size="lg">
                    <Calendar className="w-5 h-5" />
                    Criar Missão
                  </Button>
                </form>
              </Card>

              {/* Lista */}
              <div className="grid gap-4">
                {missoes.map((missao, index) => (
                  <Card 
                    key={missao.id} 
                    hover
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-300" />
                        <h3 className="text-white font-bold text-lg">
                          {formatDate(missao.data)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={missao.tipo === 'Normal' ? 'default' : missao.tipo === 'Carry' ? 'warning' : 'info'}>
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
                    
                    <div className="space-y-2 text-purple-100">
                      <p className="flex items-center gap-2">
                        <span className="text-xl">👤</span>
                        <strong>Ficou de fora:</strong> {missao.jogadorFora?.nick || 'N/A'}
                      </p>
                      {missao.tipo === 'Suplente' && missao.suplente && (
                        <p className="flex items-center gap-2">
                          <span className="text-xl">🛡️</span>
                          <strong>Suplente:</strong> {missao.suplente.nick}
                        </p>
                      )}
                      {missao.tipo === 'Carry' && (
                        <>
                          {missao.carryNome && (
                            <p className="flex items-center gap-2">
                              <span className="text-xl">⚔️</span>
                              <strong>Carry:</strong> {missao.carryNome}
                            </p>
                          )}
                          {missao.carryValor && (
                            <p className="flex items-center gap-2">
                              <span className="text-xl">💰</span>
                              <strong>Valor:</strong> {formatCurrency(missao.carryValor)}
                            </p>
                          )}
                        </>
                      )}
                      {missao.observacoes && (
                        <p className="flex items-center gap-2 italic text-purple-200">
                          <span className="text-xl">📝</span>
                          {missao.observacoes}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
                {missoes.length === 0 && (
                  <div className="text-center py-16">
                    <ListTodo className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
                    <p className="text-purple-200 text-lg">Nenhuma missão cadastrada ainda</p>
                    <p className="text-purple-300 text-sm mt-2">Crie a primeira missão acima!</p>
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
