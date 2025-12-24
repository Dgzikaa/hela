'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { User, Mail, Shield, Calendar, Edit2, Save, X } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Button } from '@/app/components/Button'
import { Badge } from '@/app/components/Badge'

export default function PerfilPage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  })

  const handleSave = () => {
    // TODO: Implementar atualização de perfil
    console.log('Salvando perfil:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || '',
      email: session?.user?.email || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        {/* Card Principal */}
        <Card className="mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar Grande */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{session?.user?.name}</h2>
                <p className="text-gray-600">{session?.user?.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="success">✅ Ativo</Badge>
                  <Badge variant="primary">👑 Admin</Badge>
                </div>
              </div>
            </div>

            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>

          {/* Informações */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Nome */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{session?.user?.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{session?.user?.email}</p>
                )}
              </div>

              {/* Tipo de Conta */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Shield className="w-4 h-4" />
                  Tipo de Conta
                </label>
                <p className="text-gray-900 font-medium">Administrador</p>
              </div>

              {/* Data de Cadastro */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Membro desde
                </label>
                <p className="text-gray-900 font-medium">
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Botões de Ação */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button variant="secondary" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">12</div>
              <div className="text-sm text-gray-600">Carrys Participados</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">850kk</div>
              <div className="text-sm text-gray-600">Total Recebido</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">3</div>
              <div className="text-sm text-gray-600">Carrys Agendados</div>
            </div>
          </Card>
        </div>

        {/* Alterar Senha */}
        <Card className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Segurança</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                placeholder="Digite sua nova senha"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                placeholder="Confirme sua nova senha"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <Button variant="secondary">
              Alterar Senha
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

