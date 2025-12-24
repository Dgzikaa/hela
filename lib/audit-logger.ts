import { prisma } from './prisma'

export interface AuditLogData {
  usuarioId?: number
  usuarioNome: string
  acao: string
  entidade: string
  entidadeId?: number
  descricao: string
  dadosAntigos?: any
  dadosNovos?: any
  ip?: string
  userAgent?: string
}

export async function registrarLog(data: AuditLogData) {
  try {
    await prisma.logAuditoria.create({
      data: {
        usuarioId: data.usuarioId,
        usuarioNome: data.usuarioNome,
        acao: data.acao,
        entidade: data.entidade,
        entidadeId: data.entidadeId,
        descricao: data.descricao,
        dadosAntigos: data.dadosAntigos ? JSON.stringify(data.dadosAntigos) : null,
        dadosNovos: data.dadosNovos ? JSON.stringify(data.dadosNovos) : null,
        ip: data.ip,
        userAgent: data.userAgent
      }
    })
  } catch (error) {
    console.error('Erro ao registrar log de auditoria:', error)
    // Não deve quebrar a aplicação se o log falhar
  }
}

// Atalhos para ações comuns
export const auditLog = {
  create: (
    usuarioNome: string,
    entidade: string,
    entidadeId: number,
    dados: any,
    options?: Partial<AuditLogData>
  ) => registrarLog({
    usuarioNome,
    acao: 'CREATE',
    entidade,
    entidadeId,
    descricao: `${usuarioNome} criou ${entidade} #${entidadeId}`,
    dadosNovos: dados,
    ...options
  }),

  update: (
    usuarioNome: string,
    entidade: string,
    entidadeId: number,
    dadosAntigos: any,
    dadosNovos: any,
    options?: Partial<AuditLogData>
  ) => registrarLog({
    usuarioNome,
    acao: 'UPDATE',
    entidade,
    entidadeId,
    descricao: `${usuarioNome} atualizou ${entidade} #${entidadeId}`,
    dadosAntigos,
    dadosNovos,
    ...options
  }),

  delete: (
    usuarioNome: string,
    entidade: string,
    entidadeId: number,
    dados: any,
    options?: Partial<AuditLogData>
  ) => registrarLog({
    usuarioNome,
    acao: 'DELETE',
    entidade,
    entidadeId,
    descricao: `${usuarioNome} deletou ${entidade} #${entidadeId}`,
    dadosAntigos: dados,
    ...options
  }),

  login: (
    usuarioNome: string,
    usuarioId?: number,
    options?: Partial<AuditLogData>
  ) => registrarLog({
    usuarioId,
    usuarioNome,
    acao: 'LOGIN',
    entidade: 'Usuario',
    entidadeId: usuarioId,
    descricao: `${usuarioNome} fez login no sistema`,
    ...options
  }),

  logout: (
    usuarioNome: string,
    usuarioId?: number,
    options?: Partial<AuditLogData>
  ) => registrarLog({
    usuarioId,
    usuarioNome,
    acao: 'LOGOUT',
    entidade: 'Usuario',
    entidadeId: usuarioId,
    descricao: `${usuarioNome} fez logout do sistema`,
    ...options
  })
}

