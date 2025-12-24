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
                status: 'CONCLUIDO'
              }
            }
          }
        },
        missoesFora: {
          where: {
            status: {
              in: ['CONCLUIDO', 'AGENDADO']
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
    const { nick, categorias, discord, discordId, ativo, essencial } = body

    if (!nick) {
      return NextResponse.json({ error: 'Nick é obrigatório' }, { status: 400 })
    }

    if (!categorias || (Array.isArray(categorias) && categorias.length === 0)) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 })
    }

    // Garantir que categorias seja string (array separado por vírgula)
    const categoriasStr = Array.isArray(categorias) ? categorias.join(',') : categorias

    const jogador = await prisma.jogador.create({
      data: {
        nick,
        categorias: categoriasStr,
        discord: discord || null,
        discordId: discordId || null,
        ativo: ativo !== undefined ? ativo : true,
        essencial: essencial || false
      }
    })

    return NextResponse.json(jogador, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar jogador:', error)
    return NextResponse.json({ error: 'Erro ao criar jogador' }, { status: 500 })
  }
}

// PATCH - Atualizar jogador
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, nick, categorias, discord, discordId, ativo, essencial } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const data: any = {}
    if (nick) data.nick = nick
    if (categorias) {
      // Garantir que categorias seja string (array separado por vírgula)
      data.categorias = Array.isArray(categorias) ? categorias.join(',') : categorias
    }
    if (discord !== undefined) data.discord = discord || null
    if (discordId !== undefined) data.discordId = discordId || null
    if (ativo !== undefined) data.ativo = ativo
    if (essencial !== undefined) data.essencial = essencial

    const jogador = await prisma.jogador.update({
      where: { id },
      data
    })

    return NextResponse.json(jogador)
  } catch (error) {
    console.error('Erro ao atualizar jogador:', error)
    return NextResponse.json({ error: 'Erro ao atualizar jogador' }, { status: 500 })
  }
}

// DELETE - Excluir jogador
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    await prisma.jogador.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir jogador:', error)
    return NextResponse.json({ error: 'Erro ao excluir jogador' }, { status: 500 })
  }
}

