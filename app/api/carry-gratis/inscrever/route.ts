import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { discordName, nickIngame, semana, discordId } = body
    
    if (!discordName || !nickIngame || !semana) {
      return NextResponse.json(
        { error: 'Discord e nick são obrigatórios' },
        { status: 400 }
      )
    }
    
    const semanaDate = new Date(semana)
    semanaDate.setHours(0, 0, 0, 0)
    
    // Verifica se já está inscrito nesta semana
    const existente = await prisma.inscricaoCarryGratis.findFirst({
      where: {
        OR: [
          { discordId: discordId || '', semana: semanaDate },
          { discordName: discordName, semana: semanaDate },
          { nickIngame: nickIngame, semana: semanaDate }
        ]
      }
    })
    
    if (existente) {
      return NextResponse.json(
        { error: 'Você já está inscrito nesta semana!' },
        { status: 400 }
      )
    }
    
    // Busca ou cria cliente
    let clienteId: number | null = null
    if (discordId) {
      const cliente = await prisma.cliente.findUnique({
        where: { discordUserId: discordId }
      })
      
      if (cliente) {
        clienteId = cliente.id
        // Atualiza nick do cliente se não tiver
        if (!cliente.nickIngame) {
          await prisma.cliente.update({
            where: { id: cliente.id },
            data: { nickIngame }
          })
        }
      }
    }
    
    // Cria inscrição
    const inscricao = await prisma.inscricaoCarryGratis.create({
      data: {
        discordId: discordId || discordName, // Usa nome como fallback
        discordName,
        nickIngame,
        semana: semanaDate,
        clienteId,
        status: 'INSCRITO'
      }
    })
    
    return NextResponse.json(inscricao)
  } catch (error) {
    console.error('Erro ao inscrever:', error)
    return NextResponse.json(
      { error: 'Erro ao processar inscrição' },
      { status: 500 }
    )
  }
}

