'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import { Button } from '@/app/components/Button'

interface Jogador {
  id: number
  nick: string
  categoria: string
  discord: string | null
  discordId: string | null
  ativo: boolean
  totalCarrys: number
  totalGanho: number
}

export default function JogadoresPage() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nick: '',
    categoria: 'HELA',
    discord: '',
    discordId: '',
    ativo: true
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
        body: JSON.stringify(editingId ? { id: editingId, ...formData } : formData)
      })

      if (res.ok) {
        alert(editingId ? 'Jogador atualizado!' : 'Jogador criado!')
        setShowForm(false)
        setEditingId(null)
        setFormData({
          nick: '',
          categoria: 'HELA',
          discord: '',
          discordId: '',
          ativo: true
        })
        fetchJogadores()
      } else {
        alert('Erro ao salvar jogador')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar jogador')
    }
  }

  const handleEdit = (jogador: Jogador) => {
    setEditingId(jogador.id)
    setFormData({
      nick: jogador.nick,
      categoria: jogador.categoria,
      discord: jogador.discord || '',
      discordId: jogador.discordId || '',
      ativo: jogador.ativo
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este jogador?')) return

    try {
      const res = await fetch(`/api/jogadores?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('Jogador excluído!')
        fetchJogadores()
      } else {
        alert('Erro ao excluir jogador')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir jogador')
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
              {jogadores.filter(j => j.categoria === 'HELA' && j.ativo).length}
            </div>
          </Card>
          <Card hover>
            <div className="text-blue-600 text-sm font-semibold mb-1">Carrys</div>
            <div className="text-3xl font-bold text-gray-900">
              {jogadores.filter(j => j.categoria === 'CARRYS' && j.ativo).length}
            </div>
          </Card>
          <Card hover>
            <div className="text-yellow-600 text-sm font-semibold mb-1">Suplentes</div>
            <div className="text-3xl font-bold text-gray-900">
              {jogadores.filter(j => j.categoria === 'SUPLENTE' && j.ativo).length}
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
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{jogador.nick}</h3>
                  {getCategoryBadge(jogador.categoria)}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(jogador)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(jogador.id)}>
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
                  <label className="block text-gray-300 mb-2">Categoria</label>
                  <select
                    className="w-full bg-gray-700 text-white rounded px-4 py-2"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    <option value="HELA">⭐ Time Principal (HELA)</option>
                    <option value="CARRYS">🎯 Carrys (Boss 4-6)</option>
                    <option value="SUPLENTE">🔄 Suplente</option>
                  </select>
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

                <div>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>Ativo</span>
                  </label>
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
      </div>
    </div>
  )
}

