import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todos os jogadores
export async function GET() {
  try {
    const jogadores = await prisma.jogador.findMany({
      include: {
        _count: {
          select: {
            missoesFora: {
              where: {
                status: 'Concluído'
              }
            }
          }
        },
        missoesFora: {
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

    const jogadoresComEstatisticas = jogadores.map(j => ({
      ...j,
      vezesFora: j._count.missoesFora,
      ultimaMissao: j.missoesFora[0]?.data || null
    }))

    return NextResponse.json(jogadoresComEstatisticas)
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error)
    return NextResponse.json({ error: 'Erro ao buscar jogadores' }, { status: 500 })
  }
}

// POST - Criar novo jogador
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nick } = body

    if (!nick) {
      return NextResponse.json({ error: 'Nick é obrigatório' }, { status: 400 })
    }

    const jogador = await prisma.jogador.create({
      data: {
        nick
      }
    })

    return NextResponse.json(jogador, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar jogador:', error)
    return NextResponse.json({ error: 'Erro ao criar jogador' }, { status: 500 })
  }
}

