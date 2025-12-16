import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Retorna a segunda-feira da semana atual
function getSegundaAtual(): Date {
  const hoje = new Date()
  const dia = hoje.getDay()
  const diff = dia === 0 ? -6 : 1 - dia // Se domingo, volta 6 dias
  const segunda = new Date(hoje)
  segunda.setDate(hoje.getDate() + diff)
  segunda.setHours(0, 0, 0, 0)
  return segunda
}

export async function GET() {
  try {
    const semanaAtual = getSegundaAtual()
    
    const inscritos = await prisma.inscricaoCarryGratis.findMany({
      where: {
        semana: semanaAtual
      },
      orderBy: [
        { posicaoSorteio: 'asc' },
        { createdAt: 'asc' }
      ],
      select: {
        id: true,
        discordName: true,
        nickIngame: true,
        status: true,
        posicaoSorteio: true,
        createdAt: true
      }
    })
    
    return NextResponse.json(inscritos)
  } catch (error) {
    console.error('Erro ao buscar inscritos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar inscritos' },
      { status: 500 }
    )
  }
}

