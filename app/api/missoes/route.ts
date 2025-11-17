import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todas as missões
export async function GET() {
  try {
    const missoes = await prisma.missao.findMany({
      include: {
        jogadorFora: true,
        suplente: true
      },
      orderBy: {
        data: 'asc'
      }
    })

    return NextResponse.json(missoes)
  } catch (error) {
    console.error('Erro ao buscar missões:', error)
    return NextResponse.json({ error: 'Erro ao buscar missões' }, { status: 500 })
  }
}

// POST - Criar nova missão
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, tipo, jogadorForaId, suplenteId, carryNome, carryValor, status, observacoes } = body

    if (!data || !tipo || !jogadorForaId || !status) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const missao = await prisma.missao.create({
      data: {
        data: new Date(data),
        tipo,
        jogadorForaId: parseInt(jogadorForaId),
        suplenteId: suplenteId ? parseInt(suplenteId) : null,
        carryNome: carryNome || null,
        carryValor: carryValor ? parseFloat(carryValor) : 0,
        status,
        observacoes: observacoes || null
      },
      include: {
        jogadorFora: true,
        suplente: true
      }
    })

    return NextResponse.json(missao, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar missão:', error)
    return NextResponse.json({ error: 'Erro ao criar missão' }, { status: 500 })
  }
}

