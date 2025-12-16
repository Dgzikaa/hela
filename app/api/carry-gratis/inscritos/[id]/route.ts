import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, motivoAusencia } = body
    
    const inscricao = await prisma.inscricaoCarryGratis.update({
      where: { id: parseInt(params.id) },
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
  { params }: { params: { id: string } }
) {
  try {
    await prisma.inscricaoCarryGratis.delete({
      where: { id: parseInt(params.id) }
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

