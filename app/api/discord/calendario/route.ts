import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarCalendarioSemanal } from '@/lib/discord-webhook'

// GET - Enviar calendário para o Discord
export async function GET() {
  try {
    // Buscar carrys agendados para os próximos 7 dias
    const hoje = new Date()
    const proximaSemana = new Date(hoje)
    proximaSemana.setDate(proximaSemana.getDate() + 7)

    const carrys = await prisma.pedido.findMany({
      where: {
        dataAgendada: {
          gte: hoje,
          lte: proximaSemana
        },
        status: {
          notIn: ['CANCELADO', 'CONCLUIDO']
        }
      },
      include: {
        itens: {
          include: {
            boss: true
          }
        }
      },
      orderBy: {
        dataAgendada: 'asc'
      }
    })

    const carrysFormatados = carrys.map(carry => ({
      id: carry.id,
      nomeCliente: carry.nomeCliente,
      dataAgendada: carry.dataAgendada!,
      bosses: carry.itens.map(i => i.boss.nome),
      valorTotal: carry.valorTotal
    }))

    await enviarCalendarioSemanal(carrysFormatados)

    return NextResponse.json({
      success: true,
      message: `Calendário enviado! ${carrysFormatados.length} carry(s) na próxima semana.`
    })
  } catch (error) {
    console.error('Erro ao enviar calendário:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar calendário' },
      { status: 500 }
    )
  }
}

