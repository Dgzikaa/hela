'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MessageSquare, TrendingUp, UserCheck, AlertCircle } from 'lucide-react'
import Card from '@/app/components/Card'
import Badge from '@/app/components/Badge'

interface Lead {
  id: number
  discordUserId: string
  discordUsername: string
  status: string
  conversaHistorico: string | null
  ultimaInteracao: string
  pedido: {
    id: number
    valorTotal: number
    status: string
  } | null
}

export default function LeadsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadSelecionado, setLeadSelecionado] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      carregarLeads()
    }
  }, [status, router])

  const carregarLeads = async () => {
    try {
      const res = await fetch('/api/leads')
      if (res.ok) {
        const data = await res.json()
        setLeads(data)
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      INICIADO: 'info',
      EM_NEGOCIACAO: 'warning',
      AGUARDANDO_CONFIRMACAO: 'warning',
      CONVERTIDO: 'success',
      PERDIDO: 'danger'
    }
    return variants[status] || 'default'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      INICIADO: '🆕 Iniciado',
      EM_NEGOCIACAO: '💬 Negociando',
      AGUARDANDO_CONFIRMACAO: '⏳ Aguardando',
      CONVERTIDO: '✅ Convertido',
      PERDIDO: '❌ Perdido'
    }
    return labels[status] || status
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const agora = new Date()
    const diff = agora.getTime() - d.getTime()
    const minutos = Math.floor(diff / 60000)
    const horas = Math.floor(minutos / 60)
    const dias = Math.floor(horas / 24)

    if (minutos < 60) return `${minutos}min atrás`
    if (horas < 24) return `${horas}h atrás`
    if (dias < 7) return `${dias}d atrás`
    return d.toLocaleDateString('pt-BR')
  }

  const stats = {
    total: leads.length,
    convertidos: leads.filter(l => l.status === 'CONVERTIDO').length,
    emNegociacao: leads.filter(l => l.status === 'EM_NEGOCIACAO' || l.status === 'AGUARDANDO_CONFIRMACAO').length,
    perdidos: leads.filter(l => l.status === 'PERDIDO').length
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-600">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              💬 CRM de Leads (Discord)
            </h1>
            <p className="text-slate-600">
              Acompanhe todas as conversas do bot
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            ← Voltar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Total Leads</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Convertidos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.convertidos}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Em Negociação</p>
                <p className="text-2xl font-bold text-slate-900">{stats.emNegociacao}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Perdidos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.perdidos}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Lista de Leads */}
          <div className="md:col-span-1">
            <Card className="p-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Leads</h2>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {leads.map(lead => (
                  <button
                    key={lead.id}
                    onClick={() => setLeadSelecionado(lead)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      leadSelecionado?.id === lead.id
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {lead.discordUsername}
                      </p>
                      <Badge variant={getStatusBadge(lead.status)} className="text-xs">
                        {getStatusLabel(lead.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDate(lead.ultimaInteracao)}
                    </p>
                    {lead.pedido && (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Pedido #{lead.pedido.id} - {lead.pedido.valorTotal}KK
                      </p>
                    )}
                  </button>
                ))}

                {leads.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Nenhum lead ainda
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Detalhes do Lead */}
          <div className="md:col-span-2">
            <Card className="p-6">
              {leadSelecionado ? (
                <>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">
                        {leadSelecionado.discordUsername}
                      </h2>
                      <p className="text-sm text-slate-500">
                        ID: {leadSelecionado.discordUserId}
                      </p>
                    </div>
                    <Badge variant={getStatusBadge(leadSelecionado.status)}>
                      {getStatusLabel(leadSelecionado.status)}
                    </Badge>
                  </div>

                  {/* Histórico de Conversa */}
                  <div className="mb-6">
                    <h3 className="font-bold text-slate-900 mb-3">Histórico de Conversa</h3>
                    <div className="bg-slate-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                      {leadSelecionado.conversaHistorico ? (
                        JSON.parse(leadSelecionado.conversaHistorico).map((msg: any, idx: number) => (
                          <div key={idx} className="mb-3 pb-3 border-b border-slate-200 last:border-0">
                            <p className="text-xs text-slate-500 mb-1">
                              {new Date(msg.timestamp).toLocaleString('pt-BR')}
                            </p>
                            <p className="text-sm text-slate-700">{msg.mensagem}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">Sem mensagens</p>
                      )}
                    </div>
                  </div>

                  {/* Pedido Convertido */}
                  {leadSelecionado.pedido && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-bold text-green-800 mb-2">✅ Pedido Gerado</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-green-600">Pedido:</p>
                          <p className="font-bold text-green-900">#{leadSelecionado.pedido.id}</p>
                        </div>
                        <div>
                          <p className="text-green-600">Valor:</p>
                          <p className="font-bold text-green-900">{leadSelecionado.pedido.valorTotal}KK</p>
                        </div>
                        <div>
                          <p className="text-green-600">Status:</p>
                          <p className="font-bold text-green-900">{leadSelecionado.pedido.status}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Selecione um lead para ver os detalhes</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

