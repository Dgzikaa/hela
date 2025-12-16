import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, motivoAusencia } = body
    
    const inscricao = await prisma.inscricaoCarryGratis.update({
      where: { id: parseInt(id) },
      data: {
        status,
        motivoAusencia,
        dataResposta: new Date()
      }
    })
    
    return NextResponse.json(inscricao)
  } catch (error) {
    console.error('Erro ao atualizar inscrição:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar inscrição' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.inscricaoCarryGratis.delete({
      where: { id: parseInt(id) }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar inscrição:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar inscrição' },
      { status: 500 }
    )
  }
}
