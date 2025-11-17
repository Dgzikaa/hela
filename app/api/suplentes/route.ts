import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todos os suplentes
export async function GET() {
  try {
    const suplentes = await prisma.suplente.findMany({
      include: {
        _count: {
          select: {
            missoes: {
              where: {
                status: 'Concluído'
              }
            }
          }
        },
        missoes: {
          where: {
            status: {
              in: ['Concluído', 'Agendado']
            }
          },
          orderBy: {
            data: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        id: 'asc'
      }
    })

    const suplentesComEstatisticas = suplentes.map(s => ({
      ...s,
      vezesJogou: s._count.missoes,
      ultimaMissao: s.missoes[0]?.data || null
    }))

    return NextResponse.json(suplentesComEstatisticas)
  } catch (error) {
    console.error('Erro ao buscar suplentes:', error)
    return NextResponse.json({ error: 'Erro ao buscar suplentes' }, { status: 500 })
  }
}

// POST - Criar novo suplente
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nick } = body

    if (!nick) {
      return NextResponse.json({ error: 'Nick é obrigatório' }, { status: 400 })
    }

    const suplente = await prisma.suplente.create({
      data: {
        nick
      }
    })

    return NextResponse.json(suplente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar suplente:', error)
    return NextResponse.json({ error: 'Erro ao criar suplente' }, { status: 500 })
  }
}

