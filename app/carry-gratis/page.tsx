'use client'

import { useState, useEffect } from 'react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { 
  Gift, 
  Users, 
  Calendar, 
  Trophy, 
  Sparkles, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sword,
  Shield,
  Crown
} from 'lucide-react'
import Link from 'next/link'
import { ToolsLayout } from '../components/ToolsLayout'

interface ConfiguracaoCarry {
  diaCarry: number
  horaCarry: string
  vagasTitulares: number
  vagasReservas: number
  bossesInclusos: string
}

interface Inscrito {
  id: number
  discordName: string
  nickIngame: string
  status: string
  posicaoSorteio: number | null
}

export default function CarryGratisPage() {
  const [config, setConfig] = useState<ConfiguracaoCarry | null>(null)
  const [inscritos, setInscritos] = useState<Inscrito[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  // Form
  const [discordName, setDiscordName] = useState('')
  const [nickIngame, setNickIngame] = useState('')
  
  // Calcular próxima semana (segunda-feira)
  const getProximaSegunda = () => {
    const hoje = new Date()
    const dia = hoje.getDay()
    const diff = dia === 0 ? 1 : 8 - dia // Se domingo, próxima é amanhã
    const proxima = new Date(hoje)
    proxima.setDate(hoje.getDate() + diff)
    proxima.setHours(0, 0, 0, 0)
    return proxima
  }
  
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  
  useEffect(() => {
    fetchDados()
  }, [])
  
  const fetchDados = async () => {
    try {
      const [configRes, inscritosRes] = await Promise.all([
        fetch('/api/carry-gratis/config'),
        fetch('/api/carry-gratis/inscritos')
      ])
      
      if (configRes.ok) {
        const configData = await configRes.json()
        setConfig(configData)
      }
      
      if (inscritosRes.ok) {
        const inscritosData = await inscritosRes.json()
        setInscritos(inscritosData)
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    
    try {
      const res = await fetch('/api/carry-gratis/inscrever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordName,
          nickIngame,
          semana: getProximaSegunda().toISOString()
        })
      })
      
      if (res.ok) {
        setSuccess(true)
        setDiscordName('')
        setNickIngame('')
        fetchDados()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao se inscrever')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setSubmitting(false)
    }
  }
  
  const proximaData = config ? (() => {
    const hoje = new Date()
    const diaAtual = hoje.getDay()
    const diasAte = (config.diaCarry - diaAtual + 7) % 7 || 7
    const data = new Date(hoje)
    data.setDate(hoje.getDate() + diasAte)
    return data
  })() : null

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-gray-900">
              <Gift className="w-8 h-8 text-purple-600" />
              Carry Grátis Semanal
            </h1>
            <p className="text-gray-500 mt-1">Sorteio de vagas para bosses 1-6 toda semana!</p>
          </div>
        </div>
        
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-white shadow-sm border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Próximo Carry</p>
                <p className="font-bold text-gray-900">
                  {proximaData ? (
                    <>
                      {diasSemana[config?.diaCarry || 6]} - {proximaData.toLocaleDateString('pt-BR')}
                    </>
                  ) : (
                    'Carregando...'
                  )}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm border-amber-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Horário</p>
                <p className="font-bold text-gray-900">{config?.horaCarry || '21:00'}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white shadow-sm border-emerald-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Vagas</p>
                <p className="font-bold text-gray-900">
                  {config?.vagasTitulares || 4} titulares + {config?.vagasReservas || 2} reservas
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário de Inscrição */}
          <Card className="p-6 bg-white shadow-sm border-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-gray-900" />
              </div>
              <h2 className="text-xl font-bold">Inscreva-se</h2>
            </div>
            
            {success ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-emerald-400 mb-2">Inscrição Confirmada!</h3>
                <p className="text-gray-500 mb-4">
                  Você está participando do sorteio. Boa sorte! 🍀
                </p>
                <p className="text-sm text-slate-500">
                  O resultado será divulgado no Discord.
                </p>
                <Button 
                  onClick={() => setSuccess(false)} 
                  variant="secondary"
                  className="mt-4"
                >
                  Nova Inscrição
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nome no Discord
                  </label>
                  <Input
                    type="text"
                    value={discordName}
                    onChange={(e) => setDiscordName(e.target.value)}
                    placeholder="Ex: SeuNome#1234 ou @seunome"
                    required
                    className="bg-gray-100/50 border-slate-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nick no Jogo
                  </label>
                  <Input
                    type="text"
                    value={nickIngame}
                    onChange={(e) => setNickIngame(e.target.value)}
                    placeholder="Seu personagem no RagnaTales"
                    required
                    className="bg-gray-100/50 border-slate-600"
                  />
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500"
                >
                  {submitting ? 'Inscrevendo...' : '🎲 Participar do Sorteio'}
                </Button>
                
                <p className="text-xs text-slate-500 text-center">
                  Ao se inscrever, você concorda em participar caso seja sorteado.
                </p>
              </form>
            )}
          </Card>
          
          {/* Lista de Inscritos */}
          <Card className="p-6 bg-white shadow-sm border-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Users className="w-5 h-5 text-gray-900" />
                </div>
                <h2 className="text-xl font-bold">Inscritos ({inscritos.length})</h2>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Carregando...
              </div>
            ) : inscritos.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-gray-500">Nenhuma inscrição ainda</p>
                <p className="text-sm text-slate-500">Seja o primeiro!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {inscritos.map((inscrito, index) => (
                  <div 
                    key={inscrito.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      inscrito.status === 'SORTEADO' || inscrito.status === 'CONFIRMADO'
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-gray-100/50 border border-gray-200/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      inscrito.posicaoSorteio && inscrito.posicaoSorteio <= 4
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-gray-900'
                        : 'bg-slate-700 text-gray-600'
                    }`}>
                      {inscrito.posicaoSorteio || index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{inscrito.nickIngame}</p>
                      <p className="text-xs text-gray-500 truncate">{inscrito.discordName}</p>
                    </div>
                    
                    {inscrito.status === 'SORTEADO' && (
                      <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded">
                        🎉 Sorteado!
                      </span>
                    )}
                    {inscrito.status === 'CONFIRMADO' && (
                      <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded">
                        ✓ Confirmado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        
        {/* Como Funciona */}
        <Card className="mt-8 p-6 bg-white shadow-sm border-gray-200/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Como Funciona
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-xl">1️⃣</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Inscreva-se</h3>
              <p className="text-sm text-gray-500">
                Preencha o formulário com seu Discord e nick
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-amber-500/20 rounded-full flex items-center justify-center">
                <span className="text-xl">2️⃣</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Sorteio</h3>
              <p className="text-sm text-gray-500">
                Domingo às 20h sorteamos os participantes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-xl">3️⃣</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Confirme</h3>
              <p className="text-sm text-gray-500">
                Confirme sua presença em até 24h
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-pink-500/20 rounded-full flex items-center justify-center">
                <span className="text-xl">4️⃣</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Participe</h3>
              <p className="text-sm text-gray-500">
                Entre no horário e ganhe as recompensas!
              </p>
            </div>
          </div>
          
          {/* Recompensas */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Recompensas (Bosses 1-6)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { nome: 'Godly', desc: 'Ingredientes para craft' },
                { nome: 'Força Heróica', desc: 'Materiais raros' },
                { nome: 'Conquistas', desc: 'Títulos e bônus' },
                { nome: 'Pets', desc: 'Companheiros únicos' },
                { nome: 'Montarias', desc: 'Transporte exclusivo' },
                { nome: 'Experiência', desc: 'Aprenda com os melhores' },
              ].map((item) => (
                <div key={item.nome} className="flex items-center gap-2 p-2 bg-gray-100/50 rounded-lg">
                  <Sword className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
          {/* Footer */}
          <div className="text-center mt-8 text-slate-500 text-sm">
            <p>Hela Carrys © 2025 - Apoiando novos jogadores 💜</p>
          </div>
        </div>
      </div>
    </ToolsLayout>
  )
}

