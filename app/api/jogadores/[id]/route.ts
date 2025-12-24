import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Buscar jogador específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const jogadorId = parseInt(resolvedParams.id)

    const jogador = await prisma.jogador.findUnique({
      where: { id: jogadorId },
      include: {
        participacoes: {
          include: {
            pedido: true
          }
        }
      }
    })

    if (!jogador) {
      return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 })
    }

    return NextResponse.json(jogador)
  } catch (error) {
    console.error('Erro ao buscar jogador:', error)
    return NextResponse.json({ error: 'Erro ao buscar jogador' }, { status: 500 })
  }
}

// PATCH - Atualizar jogador
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const jogadorId = parseInt(resolvedParams.id)
    const body = await request.json()

    const jogador = await prisma.jogador.update({
      where: { id: jogadorId },
      data: {
        nick: body.nick,
        categorias: body.categorias,
        essencial: body.essencial,
        ativo: body.ativo,
        discord: body.discord,
        discordId: body.discordId
      }
    })

    return NextResponse.json(jogador)
  } catch (error) {
    console.error('Erro ao atualizar jogador:', error)
    return NextResponse.json({ error: 'Erro ao atualizar jogador' }, { status: 500 })
  }
}

// DELETE - Excluir jogador (ou desativar se tiver participações)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const jogadorId = parseInt(resolvedParams.id)

    // Verificar se tem participações
    const jogador = await prisma.jogador.findUnique({
      where: { id: jogadorId },
      include: {
        participacoes: true
      }
    })

    if (!jogador) {
      return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 })
    }

    // Se tem participações, apenas desativa
    if (jogador.participacoes.length > 0) {
      await prisma.jogador.update({
        where: { id: jogadorId },
        data: { ativo: false }
      })
      return NextResponse.json({ 
        message: 'Jogador desativado (tem participações em carrys)',
        desativado: true
      })
    }

    // Se não tem participações, pode excluir
    await prisma.jogador.delete({
      where: { id: jogadorId }
    })

    return NextResponse.json({ 
      message: 'Jogador excluído com sucesso',
      excluido: true
    })
  } catch (error) {
    console.error('Erro ao excluir jogador:', error)
    return NextResponse.json({ 
      error: 'Erro ao excluir jogador',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

