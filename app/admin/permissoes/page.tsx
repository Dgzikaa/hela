'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import {
  Shield,
  Users,
  Lock,
  Check,
  X,
  Edit,
  Save,
  AlertCircle
} from 'lucide-react'
import { 
  ROLES, 
  RESOURCES, 
  ACTIONS, 
  RESOURCE_LABELS, 
  ACTION_LABELS,
  hasPermission,
  type Resource,
  type Action
} from '@/lib/permissions'

export default function PermissoesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string>('jogador')
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  const currentRole = ROLES[selectedRole]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Gerenciamento de Permissões
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Sistema RBAC (Role-Based Access Control)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Sistema de Controle de Acesso:</strong> Define quais ações cada tipo de usuário pode realizar no sistema.
              Em produção, estas configurações são armazenadas no banco de dados.
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Seletor de Roles */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Perfis de Acesso
                </h2>
              </div>

              <div className="space-y-2">
                {Object.entries(ROLES).map(([key, role]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedRole(key)}
                    className={`
                      w-full p-3 rounded-lg text-left transition-all
                      ${selectedRole === key
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 text-purple-900 dark:text-purple-100'
                        : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <div className="font-semibold capitalize">{role.name}</div>
                    <div className="text-xs mt-1 opacity-75">
                      {role.permissions.length} permissões
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Matriz de Permissões */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Permissões: <span className="capitalize text-purple-600 dark:text-purple-400">{currentRole.name}</span>
                  </h2>
                </div>
              </div>

              {/* Tabela de Permissões */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Recurso
                      </th>
                      {ACTIONS.map(action => (
                        <th key={action} className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          {ACTION_LABELS[action]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RESOURCES.map(resource => (
                      <tr
                        key={resource}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {RESOURCE_LABELS[resource]}
                        </td>
                        {ACTIONS.map(action => {
                          const allowed = hasPermission(selectedRole, resource, action)
                          return (
                            <td key={action} className="py-3 px-4 text-center">
                              {allowed ? (
                                <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full">
                                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full">
                                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resumo de Permissões */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  📋 Resumo de Acesso
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {currentRole.permissions.map((perm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <Badge variant="success" className="text-xs">
                        {ACTION_LABELS[perm.action]}
                      </Badge>
                      <span>{RESOURCE_LABELS[perm.resource]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Legenda */}
            <Card className="p-4 mt-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    💡 Sobre os Perfis
                  </h3>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• <strong>Admin:</strong> Acesso total ao sistema</li>
                    <li>• <strong>Moderador:</strong> Gerencia pedidos e jogadores</li>
                    <li>• <strong>Jogador:</strong> Visualiza dados e gerencia seu perfil</li>
                    <li>• <strong>Visualizador:</strong> Apenas leitura de pedidos e clientes</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

