// Sistema de Permissões RBAC

export type Resource = 
  | 'pedidos' 
  | 'jogadores' 
  | 'clientes' 
  | 'precos' 
  | 'backup' 
  | 'auditoria' 
  | 'configuracoes'

export type Action = 'read' | 'write' | 'delete' | 'manage'

export interface Permission {
  resource: Resource
  action: Action
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
}

// Mapeamento de roles e permissões (em produção viria do banco)
export const ROLES: Record<string, Role> = {
  admin: {
    id: 1,
    name: 'admin',
    permissions: [
      { resource: 'pedidos', action: 'manage' },
      { resource: 'jogadores', action: 'manage' },
      { resource: 'clientes', action: 'manage' },
      { resource: 'precos', action: 'manage' },
      { resource: 'backup', action: 'manage' },
      { resource: 'auditoria', action: 'read' },
      { resource: 'configuracoes', action: 'manage' }
    ]
  },
  moderador: {
    id: 2,
    name: 'moderador',
    permissions: [
      { resource: 'pedidos', action: 'manage' },
      { resource: 'jogadores', action: 'write' },
      { resource: 'clientes', action: 'write' },
      { resource: 'precos', action: 'read' }
    ]
  },
  jogador: {
    id: 3,
    name: 'jogador',
    permissions: [
      { resource: 'pedidos', action: 'read' },
      { resource: 'jogadores', action: 'read' },
      { resource: 'clientes', action: 'read' },
      { resource: 'precos', action: 'read' }
    ]
  },
  visualizador: {
    id: 4,
    name: 'visualizador',
    permissions: [
      { resource: 'pedidos', action: 'read' },
      { resource: 'clientes', action: 'read' }
    ]
  }
}

/**
 * Verifica se um usuário tem permissão para realizar uma ação em um recurso
 */
export function hasPermission(
  userRole: string,
  resource: Resource,
  action: Action
): boolean {
  const role = ROLES[userRole]
  if (!role) return false

  // Admin tem acesso total
  if (role.name === 'admin') return true

  // Verificar permissões específicas
  return role.permissions.some(
    p => p.resource === resource && (p.action === action || p.action === 'manage')
  )
}

/**
 * Verifica se usuário pode gerenciar um recurso (create, read, update, delete)
 */
export function canManage(userRole: string, resource: Resource): boolean {
  return hasPermission(userRole, resource, 'manage')
}

/**
 * Pega todas as permissões de um role
 */
export function getRolePermissions(roleName: string): Permission[] {
  const role = ROLES[roleName]
  return role ? role.permissions : []
}

/**
 * Middleware helper para verificar permissões em API routes
 */
export function requirePermission(resource: Resource, action: Action) {
  return (userRole: string) => {
    if (!hasPermission(userRole, resource, action)) {
      throw new Error(`Permissão negada: ${action} em ${resource}`)
    }
  }
}

/**
 * Lista todos os recursos disponíveis
 */
export const RESOURCES: Resource[] = [
  'pedidos',
  'jogadores',
  'clientes',
  'precos',
  'backup',
  'auditoria',
  'configuracoes'
]

/**
 * Lista todas as ações disponíveis
 */
export const ACTIONS: Action[] = ['read', 'write', 'delete', 'manage']

/**
 * Descrições amigáveis para recursos
 */
export const RESOURCE_LABELS: Record<Resource, string> = {
  pedidos: 'Pedidos e Carrys',
  jogadores: 'Jogadores e Membros',
  clientes: 'Clientes',
  precos: 'Preços e Mercado',
  backup: 'Backup e Restore',
  auditoria: 'Logs de Auditoria',
  configuracoes: 'Configurações do Sistema'
}

/**
 * Descrições amigáveis para ações
 */
export const ACTION_LABELS: Record<Action, string> = {
  read: 'Visualizar',
  write: 'Criar e Editar',
  delete: 'Deletar',
  manage: 'Gerenciar Tudo'
}

