import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarLembreteDiarioCarrys } from '@/lib/discord-webhook'

// GET - Enviar lembrete diário para jogadores
export async function GET(req: Request) {
  try {
    // Verificar se vem da Vercel Cron ou com autorização manual
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron')
    
    // Aceitar se for cron da Vercel OU se tiver autorização correta
    if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar pedidos agendados para hoje
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const pedidosHoje = await prisma.pedido.findMany({
      where: {
        status: {
          in: ['AGENDADO', 'EM_ANDAMENTO']
        },
        dataAgendada: {
          gte: hoje,
          lt: amanha
        }
      },
      include: {
        itens: {
          include: {
            boss: true
          }
        },
        participacoes: {
          include: {
            jogador: true
          }
        }
      }
    })

    if (pedidosHoje.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum carry agendado para hoje',
        pedidos: 0
      })
    }

    // Agrupar carrys por jogador
    const carrysPorJogador = new Map<number, {
      jogador: any
      carrys: Array<{
        id: number
        nomeCliente: string
        dataAgendada: string
        bosses: string[]
        horario: string
        valorTotal: number
      }>
    }>()

    pedidosHoje.forEach(pedido => {
      if (!pedido.participacoes || pedido.participacoes.length === 0) return

      pedido.participacoes.forEach((participacao: any) => {
        if (!carrysPorJogador.has(participacao.jogadorId)) {
          carrysPorJogador.set(participacao.jogadorId, {
            jogador: participacao.jogador,
            carrys: []
          })
        }

        // Usar horario do pedido se existir, senão pegar da dataAgendada
        const horario = (pedido as any).horario
          ? new Date(`2000-01-01T${(pedido as any).horario}`).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : pedido.dataAgendada
          ? new Date(pedido.dataAgendada).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : '21:00'

        carrysPorJogador.get(participacao.jogadorId)!.carrys.push({
          id: pedido.id,
          nomeCliente: pedido.nomeCliente,
          dataAgendada: pedido.dataAgendada!.toISOString(),
          bosses: pedido.itens.map((i: any) => i.boss.nome),
          horario,
          valorTotal: pedido.valorTotal
        })
      })
    })

    // Preparar dados para enviar
    const jogadoresParaNotificar = Array.from(carrysPorJogador.values()).map(({ jogador, carrys }) => ({
      discordId: jogador.discordId,
      nick: jogador.nick,
      carrys
    }))

    // Enviar notificações Discord
    await enviarLembreteDiarioCarrys(jogadoresParaNotificar)

    return NextResponse.json({
      success: true,
      message: `Lembretes enviados para ${jogadoresParaNotificar.length} jogador(es)`,
      jogadores: jogadoresParaNotificar.length,
      pedidos: pedidosHoje.length
    })
  } catch (error: any) {
    console.error('Erro ao enviar lembrete diário:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

