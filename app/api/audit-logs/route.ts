import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const acao = searchParams.get('acao')
    const entidade = searchParams.get('entidade')
    const usuarioId = searchParams.get('usuarioId')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    const skip = (page - 1) * limit

    // Construir where clause
    const where: any = {}

    if (acao) {
      where.acao = acao
    }

    if (entidade) {
      where.entidade = entidade
    }

    if (usuarioId) {
      where.usuarioId = parseInt(usuarioId)
    }

    if (dataInicio || dataFim) {
      where.createdAt = {}
      if (dataInicio) {
        where.createdAt.gte = new Date(dataInicio)
      }
      if (dataFim) {
        where.createdAt.lte = new Date(dataFim)
      }
    }

    const [logs, total] = await Promise.all([
      prisma.logAuditoria.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.logAuditoria.count({ where })
    ])

    // Estatísticas gerais
    const stats = {
      totalLogs: await prisma.logAuditoria.count(),
      ultimasHoras: await prisma.logAuditoria.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      ultimosDias: await prisma.logAuditoria.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    }

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats
    })
  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar logs' },
      { status: 500 }
    )
  }
}

