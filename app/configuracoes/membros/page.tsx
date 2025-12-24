'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import { Button } from '@/app/components/Button'
import { ToastContainer } from '@/app/components/Toast'
import { useToast } from '@/app/hooks/useToast'

interface Jogador {
  id: number
  nick: string
  categorias: string // String separada por vírgula: "HELA,CARRYS"
  discord: string | null
  discordId: string | null
  ativo: boolean
  essencial: boolean
  ordemRodizio: number | null
  ultimoCarry: string | null
  totalCarrys: number
  totalGanho: number
}

// Helper para converter string em array
const parseCategorias = (categorias: string): string[] => {
  return categorias ? categorias.split(',') : []
}

// Helper para converter array em string
const stringifyCategorias = (categorias: string[]): string => {
  return categorias.join(',')
}

export default function JogadoresPage() {
  const toast = useToast()
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nick: '',
    categorias: ['HELA'] as string[], // Array de categorias
    discord: '',
    discordId: '',
    ativo: true,
    essencial: false
  })

  useEffect(() => {
    fetchJogadores()
  }, [])

  const fetchJogadores = async () => {
    try {
      const res = await fetch('/api/jogadores')
      if (res.ok) {
        const data = await res.json()
        setJogadores(data)
      }
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/jogadores', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { 
          id: editingId, 
          ...formData,
          categorias: formData.categorias // Já é array, API converte
        } : {
          ...formData,
          categorias: formData.categorias
        })
      })

      if (res.ok) {
        toast.success(editingId ? '✅ Jogador atualizado!' : '🎉 Jogador criado!')
        setShowForm(false)
        setEditingId(null)
        setFormData({
          nick: '',
          categorias: ['HELA'],
          discord: '',
          discordId: '',
          ativo: true,
          essencial: false
        })
        fetchJogadores()
      } else {
        toast.error('❌ Erro ao salvar jogador')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('❌ Erro ao salvar jogador')
    }
  }

  const handleEdit = (jogador: Jogador) => {
    setEditingId(jogador.id)
    setFormData({
      nick: jogador.nick,
      categorias: parseCategorias(jogador.categorias),
      discord: jogador.discord || '',
      discordId: jogador.discordId || '',
      ativo: jogador.ativo,
      essencial: jogador.essencial
    })
    setShowForm(true)
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [jogadorParaExcluir, setJogadorParaExcluir] = useState<Jogador | null>(null)

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/jogadores?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('🗑️ Jogador excluído!')
        fetchJogadores()
        setShowDeleteModal(false)
        setJogadorParaExcluir(null)
      } else {
        toast.error('❌ Erro ao excluir jogador')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('❌ Erro ao excluir jogador')
    }
  }

  const getCategoryBadge = (categoria: string) => {
    const map: Record<string, any> = {
      HELA: { variant: 'success', label: '⭐ Time Principal' },
      CARRYS: { variant: 'info', label: '🎯 Carrys' },
      SUPLENTE: { variant: 'warning', label: '🔄 Suplente' }
    }
    const config = map[categoria] || { variant: 'default', label: categoria }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const renderCategoryBadges = (categoriasStr: string) => {
    const cats = parseCategorias(categoriasStr)
    return cats.map((cat, index) => (
      <span key={index}>{getCategoryBadge(cat)}</span>
    ))
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Jogadores</h1>
            <p className="text-gray-600">Gerencie os jogadores do time</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5" />
            Novo Jogador
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card hover>
            <div className="text-green-600 text-sm font-semibold mb-1">Time HELA</div>
            <div className="text-3xl font-bold text-gray-900">
              {jogadores.filter(j => j.categorias?.includes('HELA') && j.ativo).length}
            </div>
          </Card>
          <Card hover>
            <div className="text-blue-600 text-sm font-semibold mb-1">Carrys</div>
            <div className="text-3xl font-bold text-gray-900">
              {jogadores.filter(j => j.categorias?.includes('CARRYS') && j.ativo).length}
            </div>
          </Card>
          <Card hover>
            <div className="text-yellow-600 text-sm font-semibold mb-1">Suplentes</div>
            <div className="text-3xl font-bold text-gray-900">
              {jogadores.filter(j => j.categorias?.includes('SUPLENTE') && j.ativo).length}
            </div>
          </Card>
          <Card hover>
            <div className="text-purple-600 text-sm font-semibold mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-900">
              {jogadores.filter(j => j.ativo).length}
            </div>
          </Card>
        </div>

        {/* Lista de Jogadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jogadores.map(jogador => (
            <Card key={jogador.id} hover>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">{jogador.nick}</h3>
                    {jogador.essencial && (
                      <span className="text-xl" title="Jogador Essencial - Nunca sai da PT">⭐</span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {renderCategoryBadges(jogador.categorias)}
                    {jogador.essencial && (
                      <Badge variant="warning">⭐ ESSENCIAL</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(jogador)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => {
                    setJogadorParaExcluir(jogador)
                    setShowDeleteModal(true)
                  }}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                {jogador.discord && (
                  <div>💬 Discord: {jogador.discord}</div>
                )}
                {jogador.discordId && (
                  <div className="text-xs">🆔 ID: {jogador.discordId}</div>
                )}
                <div className="flex gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500">Carrys</div>
                    <div className="font-bold text-gray-900">{jogador.totalCarrys}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Ganho</div>
                    <div className="font-bold text-gray-900">{jogador.totalGanho}KK</div>
                  </div>
                </div>
              </div>
              
              {!jogador.ativo && (
                <Badge variant="danger" className="mt-2">Inativo</Badge>
              )}
            </Card>
          ))}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowForm(false)
              setEditingId(null)
            }}
          >
            <div 
              className="bg-gray-800 rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingId ? 'Editar Jogador' : 'Novo Jogador'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Nick</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    value={formData.nick}
                    onChange={(e) => setFormData({ ...formData, nick: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-3">Categorias (selecione uma ou mais)</label>
                  <div className="space-y-3">
                    {['HELA', 'CARRYS', 'SUPLENTE'].map((cat) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                          checked={formData.categorias.includes(cat)}
                          onChange={(e) => {
                            const newCategorias = e.target.checked
                              ? [...formData.categorias, cat]
                              : formData.categorias.filter(c => c !== cat)
                            setFormData({ ...formData, categorias: newCategorias })
                          }}
                        />
                        <span className="text-white">
                          {cat === 'HELA' && '⭐ Time Principal (HELA)'}
                          {cat === 'CARRYS' && '🎯 Carrys (Boss 4-6)'}
                          {cat === 'SUPLENTE' && '🔄 Suplente'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Discord (username)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="exemplo#1234"
                    value={formData.discord}
                    onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Discord ID (para notificações)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    placeholder="123456789012345678"
                    value={formData.discordId}
                    onChange={(e) => setFormData({ ...formData, discordId: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Para receber notificações via DM. Clique com botão direito no usuário e "Copiar ID"
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>Ativo</span>
                  </label>
                  
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.essencial}
                      onChange={(e) => setFormData({ ...formData, essencial: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="flex items-center gap-1">
                      <span className="text-xl">⭐</span>
                      <span>Essencial (Nunca sai da PT)</span>
                    </span>
                  </label>
                  <p className="text-xs text-gray-400 ml-7">
                    Jogadores essenciais são obrigatórios em todos os carries e não entram no rodízio
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingId ? 'Salvar' : 'Criar'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Excluir Jogador */}
        {showDeleteModal && jogadorParaExcluir && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <div 
              className="bg-gray-800 rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trash className="w-6 h-6 text-red-500" />
                  Excluir Jogador
                </h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-red-900/30 border border-red-500/50 p-4 rounded">
                  <div className="text-red-300 text-sm mb-1">⚠️ Esta ação não pode ser desfeita!</div>
                  <div className="text-white font-bold mt-3">{jogadorParaExcluir.nick}</div>
                  <div className="text-gray-400 text-sm mt-2 flex gap-2">
                    {renderCategoryBadges(jogadorParaExcluir.categorias)}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    {jogadorParaExcluir.totalCarrys} carrys • {jogadorParaExcluir.totalGanho}KK ganho
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="danger"
                  onClick={() => handleDelete(jogadorParaExcluir.id)}
                  className="flex-1"
                >
                  <Trash className="w-5 h-5 mr-2" />
                  Sim, Excluir
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </div>
    </div>
  )
}

