'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from '../../components/AdminSidebar'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Toast } from '../../components/Toast'
import {
  Gift,
  Users,
  Calendar,
  Clock,
  Settings,
  Shuffle,
  Check,
  X,
  Crown,
  AlertCircle,
  RefreshCw,
  Send
} from 'lucide-react'

interface Inscrito {
  id: number
  discordName: string
  nickIngame: string
  status: string
  posicaoSorteio: number | null
  createdAt: string
}

interface Config {
  id: number
  diaSorteio: number
  horaSorteio: string
  diaCarry: number
  horaCarry: string
  vagasTitulares: number
  vagasReservas: number
  bossesInclusos: string
  horasParaConfirmar: number
  ativo: boolean
}

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const STATUS_LABELS: Record<string, { label: string; cor: string }> = {
  INSCRITO: { label: 'Inscrito', cor: 'bg-slate-500/20 text-slate-300' },
  SORTEADO: { label: 'Sorteado', cor: 'bg-amber-500/20 text-amber-300' },
  CONFIRMADO: { label: 'Confirmado', cor: 'bg-emerald-500/20 text-emerald-300' },
  NAO_PODE: { label: 'Não pode', cor: 'bg-red-500/20 text-red-300' },
  SUBSTITUIDO: { label: 'Substituído', cor: 'bg-purple-500/20 text-purple-300' },
  PARTICIPOU: { label: 'Participou', cor: 'bg-blue-500/20 text-blue-300' },
  FALTOU: { label: 'Faltou', cor: 'bg-orange-500/20 text-orange-300' },
}

export default function AdminCarryGratisPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [inscritos, setInscritos] = useState<Inscrito[]>([])
  const [loading, setLoading] = useState(true)
  const [sorteando, setSorteando] = useState(false)
  const [editingConfig, setEditingConfig] = useState(false)
  const [configForm, setConfigForm] = useState<Partial<Config>>({})
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMsg({ message, type })
    setTimeout(() => setToastMsg(null), 3000)
  }
  
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
        setConfigForm(configData)
      }
      
      if (inscritosRes.ok) {
        const inscritosData = await inscritosRes.json()
        setInscritos(inscritosData)
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSortear = async () => {
    if (!confirm('Tem certeza que deseja realizar o sorteio? Isso notificará os sorteados no Discord.')) {
      return
    }
    
    setSorteando(true)
    try {
      const res = await fetch('/api/carry-gratis/sortear', { method: 'POST' })
      
      if (res.ok) {
        const data = await res.json()
        showToast(`Sorteio realizado! ${data.sorteados} sorteados de ${data.total} inscritos.`, 'success')
        fetchDados()
      } else {
        const error = await res.json()
        showToast(error.error || 'Erro ao sortear', 'error')
      }
    } catch (err) {
      showToast('Erro de conexão', 'error')
    } finally {
      setSorteando(false)
    }
  }
  
  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/carry-gratis/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm)
      })
      
      if (res.ok) {
        showToast('Configurações salvas!', 'success')
        fetchDados()
        setEditingConfig(false)
      } else {
        showToast('Erro ao salvar', 'error')
      }
    } catch (err) {
      showToast('Erro de conexão', 'error')
    }
  }
  
  const handleUpdateStatus = async (inscritoId: number, novoStatus: string) => {
    try {
      const res = await fetch(`/api/carry-gratis/inscritos/${inscritoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      })
      
      if (res.ok) {
        showToast('Status atualizado!', 'success')
        fetchDados()
      }
    } catch (err) {
      showToast('Erro ao atualizar', 'error')
    }
  }
  
  const titulares = inscritos.filter(i => i.posicaoSorteio && i.posicaoSorteio <= (config?.vagasTitulares || 4))
  const reservas = inscritos.filter(i => i.posicaoSorteio && i.posicaoSorteio > (config?.vagasTitulares || 4))
  const naoSorteados = inscritos.filter(i => !i.posicaoSorteio)

  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSidebar />
      
      <main className="flex-1 p-4 lg:p-8 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Gift className="w-7 h-7 text-purple-400" />
                Carry Grátis Semanal
              </h1>
              <p className="text-slate-400 mt-1">Gerencie inscrições e sorteios</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="secondary" onClick={fetchDados}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button 
                onClick={handleSortear}
                disabled={sorteando || inscritos.filter(i => i.status === 'INSCRITO').length === 0}
                className="bg-gradient-to-r from-purple-500 to-pink-600"
              >
                {sorteando ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sorteando...
                  </>
                ) : (
                  <>
                    <Shuffle className="w-4 h-4 mr-2" />
                    Realizar Sorteio
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Inscritos</p>
                  <p className="text-xl font-bold text-white">{inscritos.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Sorteados</p>
                  <p className="text-xl font-bold text-white">{titulares.length + reservas.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Confirmados</p>
                  <p className="text-xl font-bold text-white">
                    {inscritos.filter(i => i.status === 'CONFIRMADO').length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Próximo Carry</p>
                  <p className="text-lg font-bold text-white">
                    {config ? `${DIAS_SEMANA[config.diaCarry]} ${config.horaCarry}` : '-'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Configurações */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações
                </h2>
                {!editingConfig ? (
                  <Button size="sm" variant="secondary" onClick={() => setEditingConfig(true)}>
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveConfig}>Salvar</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingConfig(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {loading ? (
                <p className="text-slate-400">Carregando...</p>
              ) : editingConfig ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400">Dia do Sorteio</label>
                    <select
                      value={configForm.diaSorteio}
                      onChange={(e) => setConfigForm({ ...configForm, diaSorteio: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      {DIAS_SEMANA.map((dia, i) => (
                        <option key={i} value={i}>{dia}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400">Hora do Sorteio</label>
                    <Input
                      type="time"
                      value={configForm.horaSorteio || ''}
                      onChange={(e) => setConfigForm({ ...configForm, horaSorteio: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400">Dia do Carry</label>
                    <select
                      value={configForm.diaCarry}
                      onChange={(e) => setConfigForm({ ...configForm, diaCarry: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      {DIAS_SEMANA.map((dia, i) => (
                        <option key={i} value={i}>{dia}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400">Hora do Carry</label>
                    <Input
                      type="time"
                      value={configForm.horaCarry || ''}
                      onChange={(e) => setConfigForm({ ...configForm, horaCarry: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-400">Vagas Titulares</label>
                      <Input
                        type="number"
                        min={1}
                        value={configForm.vagasTitulares || ''}
                        onChange={(e) => setConfigForm({ ...configForm, vagasTitulares: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Vagas Reservas</label>
                      <Input
                        type="number"
                        min={0}
                        value={configForm.vagasReservas || ''}
                        onChange={(e) => setConfigForm({ ...configForm, vagasReservas: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400">Horas para Confirmar</label>
                    <Input
                      type="number"
                      min={1}
                      value={configForm.horasParaConfirmar || ''}
                      onChange={(e) => setConfigForm({ ...configForm, horasParaConfirmar: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dia do Sorteio</span>
                    <span className="text-white">{DIAS_SEMANA[config?.diaSorteio || 0]} às {config?.horaSorteio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dia do Carry</span>
                    <span className="text-white">{DIAS_SEMANA[config?.diaCarry || 6]} às {config?.horaCarry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vagas</span>
                    <span className="text-white">{config?.vagasTitulares} titulares + {config?.vagasReservas} reservas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Prazo Confirmação</span>
                    <span className="text-white">{config?.horasParaConfirmar}h</span>
                  </div>
                </div>
              )}
            </Card>
            
            {/* Lista de Inscritos */}
            <Card className="p-4 lg:col-span-2">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Inscritos da Semana ({inscritos.length})
              </h2>
              
              {loading ? (
                <p className="text-slate-400">Carregando...</p>
              ) : inscritos.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma inscrição ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Titulares */}
                  {titulares.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Titulares ({titulares.length})
                      </h3>
                      <div className="space-y-2">
                        {titulares.map(inscrito => (
                          <InscritoRow 
                            key={inscrito.id} 
                            inscrito={inscrito} 
                            onUpdateStatus={handleUpdateStatus}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Reservas */}
                  {reservas.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-blue-400 mb-2">
                        Reservas ({reservas.length})
                      </h3>
                      <div className="space-y-2">
                        {reservas.map(inscrito => (
                          <InscritoRow 
                            key={inscrito.id} 
                            inscrito={inscrito} 
                            onUpdateStatus={handleUpdateStatus}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Não sorteados */}
                  {naoSorteados.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">
                        Aguardando Sorteio ({naoSorteados.length})
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {naoSorteados.map(inscrito => (
                          <InscritoRow 
                            key={inscrito.id} 
                            inscrito={inscrito} 
                            onUpdateStatus={handleUpdateStatus}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      
      {toastMsg && <Toast id="admin-toast" message={toastMsg.message} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
    </div>
  )
}

// Componente de linha do inscrito
function InscritoRow({ 
  inscrito, 
  onUpdateStatus,
  compact = false
}: { 
  inscrito: Inscrito
  onUpdateStatus: (id: number, status: string) => void
  compact?: boolean
}) {
  const statusInfo = STATUS_LABELS[inscrito.status] || STATUS_LABELS.INSCRITO
  
  return (
    <div className={`flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg ${compact ? 'py-1.5' : ''}`}>
      {inscrito.posicaoSorteio && (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
          inscrito.posicaoSorteio <= 4 
            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' 
            : 'bg-slate-700 text-slate-300'
        }`}>
          {inscrito.posicaoSorteio}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate text-sm">{inscrito.nickIngame}</p>
        {!compact && (
          <p className="text-xs text-slate-400 truncate">{inscrito.discordName}</p>
        )}
      </div>
      
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.cor}`}>
        {statusInfo.label}
      </span>
      
      {inscrito.posicaoSorteio && inscrito.status === 'SORTEADO' && (
        <div className="flex gap-1">
          <button
            onClick={() => onUpdateStatus(inscrito.id, 'CONFIRMADO')}
            className="p-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded text-emerald-400"
            title="Confirmar"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUpdateStatus(inscrito.id, 'NAO_PODE')}
            className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400"
            title="Não pode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

