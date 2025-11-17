import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lead = await prisma.lead.findFirst({
      where: { discordUserId: id },
      include: {
        pedido: true
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error: any) {
    console.error('Erro ao buscar lead:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status } = body

    const lead = await prisma.lead.update({
      where: { id: parseInt(id) },
      data: { status }
    })

    return NextResponse.json(lead)
  } catch (error: any) {
    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

