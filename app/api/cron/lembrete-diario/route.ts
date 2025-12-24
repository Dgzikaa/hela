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

    // Buscar pedidos com horário formatado como string
    const pedidosHoje = await prisma.$queryRaw<Array<any>>`
      SELECT 
        p.*,
        CAST(p.horario AS TEXT) as horario_texto
      FROM "Pedido" p
      WHERE p.status IN ('AGENDADO', 'EM_ANDAMENTO')
        AND p."dataAgendada" >= ${hoje}
        AND p."dataAgendada" < ${amanha}
    `

    // Buscar itens e participações separadamente
    const pedidosComRelacoes = await Promise.all(
      pedidosHoje.map(async (pedido) => {
        const itens = await prisma.itensPedido.findMany({
          where: { pedidoId: pedido.id },
          include: { boss: true }
        })
        
        const participacoes = await prisma.participacaoCarry.findMany({
          where: { pedidoId: pedido.id },
          include: { jogador: true }
        })

        return {
          ...pedido,
          horario: pedido.horario_texto, // Usar horário como texto
          itens,
          participacoes
        }
      })
    )

    if (pedidosComRelacoes.length === 0) {
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

    pedidosComRelacoes.forEach(pedido => {
      if (!pedido.participacoes || pedido.participacoes.length === 0) return

      pedido.participacoes.forEach((participacao: any) => {
        if (!carrysPorJogador.has(participacao.jogadorId)) {
          carrysPorJogador.set(participacao.jogadorId, {
            jogador: participacao.jogador,
            carrys: []
          })
        }

        // Usar horario do pedido (já vem como string "15:00:00")
        let horario = '21:00' // Padrão
        
        if (pedido.horario && typeof pedido.horario === 'string') {
          // Extrair apenas HH:MM de "15:00:00"
          horario = pedido.horario.substring(0, 5)
        }
        
        console.log(`[DEBUG] Pedido ${pedido.id} - horario do banco:`, pedido.horario, '| formatado:', horario)

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
      pedidos: pedidosComRelacoes.length,
      debug: {
        primeiroCarry: jogadoresParaNotificar[0]?.carrys[0],
        horarioTipo: typeof jogadoresParaNotificar[0]?.carrys[0]?.horario
      }
    })
  } catch (error: any) {
    console.error('Erro ao enviar lembrete diário:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

