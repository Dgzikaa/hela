import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Busca ou cria configuração padrão
    let config = await prisma.configuracaoCarryGratis.findFirst()
    
    if (!config) {
      config = await prisma.configuracaoCarryGratis.create({
        data: {
          diaSorteio: 0, // Domingo
          horaSorteio: '20:00',
          diaCarry: 6, // Sábado
          horaCarry: '21:00',
          vagasTitulares: 4,
          vagasReservas: 2,
          bossesInclusos: '1,2,3,4,5,6',
          horasParaConfirmar: 24,
          ativo: true
        }
      })
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao buscar config carry grátis:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configuração' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    let config = await prisma.configuracaoCarryGratis.findFirst()
    
    if (config) {
      config = await prisma.configuracaoCarryGratis.update({
        where: { id: config.id },
        data: body
      })
    } else {
      config = await prisma.configuracaoCarryGratis.create({
        data: body
      })
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao atualizar config carry grátis:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configuração' },
      { status: 500 }
    )
  }
}

