import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        pedido: {
          select: {
            id: true,
            valorTotal: true,
            status: true
          }
        }
      },
      orderBy: { ultimaInteracao: 'desc' }
    })
    
    return NextResponse.json(leads)
  } catch (error: any) {
    console.error('Erro ao buscar leads:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { discordUserId, discordUsername, mensagem } = body

    // Buscar ou criar lead
    let lead = await prisma.lead.findFirst({
      where: { discordUserId }
    })

    if (lead) {
      // Atualizar existente
      const historico = lead.conversaHistorico 
        ? JSON.parse(lead.conversaHistorico) 
        : []
      
      historico.push({
        timestamp: new Date().toISOString(),
        mensagem
      })

      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          ultimaInteracao: new Date(),
          conversaHistorico: JSON.stringify(historico)
        }
      })
    } else {
      // Criar novo
      lead = await prisma.lead.create({
        data: {
          discordUserId,
          discordUsername,
          conversaHistorico: JSON.stringify([{
            timestamp: new Date().toISOString(),
            mensagem
          }])
        }
      })
    }

    return NextResponse.json(lead)
  } catch (error: any) {
    console.error('Erro ao criar/atualizar lead:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

