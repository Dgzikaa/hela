'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UserPlus, Trash2, Edit, Mail, Shield, ArrowLeft } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Button } from '@/app/components/Button'
import { Input } from '@/app/components/Input'
import { Badge } from '@/app/components/Badge'

interface Usuario {
  id: number
  nome: string
  email: string
  role: string
  createdAt: string
}

export default function UsuariosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  
  // Form state
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [role, setRole] = useState('ADMIN')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      carregarUsuarios()
    }
  }, [status, router])

  const carregarUsuarios = async () => {
    try {
      const res = await fetch('/api/usuarios')
      if (res.ok) {
        const data = await res.json()
        setUsuarios(data)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !email || (!editando && !senha)) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const method = editando ? 'PATCH' : 'POST'
      const body: any = { nome, email, role }
      if (editando) body.id = editando.id
      if (senha) body.senha = senha

      const res = await fetch('/api/usuarios', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        await carregarUsuarios()
        resetForm()
        alert(editando ? 'Usuário atualizado!' : 'Usuário criado!')
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao salvar usuário')
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      alert('Erro ao salvar usuário')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const res = await fetch(`/api/usuarios?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await carregarUsuarios()
        alert('Usuário excluído!')
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário')
    }
  }

  const handleEdit = (usuario: Usuario) => {
    setEditando(usuario)
    setNome(usuario.nome)
    setEmail(usuario.email)
    setRole(usuario.role)
    setSenha('')
    setShowForm(true)
  }

  const resetForm = () => {
    setNome('')
    setEmail('')
    setSenha('')
    setRole('ADMIN')
    setEditando(null)
    setShowForm(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-600">Carregando...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                👥 Gerenciar Usuários
              </h1>
              <p className="text-slate-600">
                Adicione e gerencie usuários que podem acessar o painel admin
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <UserPlus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editando ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Senha {editando && '(deixe em branco para não alterar)'}
                </label>
                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="********"
                  required={!editando}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Função
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="GERENTE">Gerente</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" fullWidth>
                  {editando ? 'Salvar Alterações' : 'Criar Usuário'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  fullWidth
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Lista de Usuários */}
        <Card>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Usuários Cadastrados ({usuarios.length})
          </h2>

          <div className="space-y-3">
            {usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-900">
                        {usuario.nome}
                      </h3>
                      <Badge variant={usuario.role === 'ADMIN' ? 'default' : 'info'}>
                        <Shield className="w-3 h-3" />
                        {usuario.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {usuario.email}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Criado em: {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(usuario)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {usuarios.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Nenhum usuário cadastrado</p>
                <p className="text-sm text-slate-400">
                  Clique em "Novo Usuário" para adicionar
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

