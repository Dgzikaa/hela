import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar pedidos dos últimos 90 dias
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - 90)

    const pedidos = await prisma.pedido.findMany({
      where: {
        createdAt: {
          gte: dataLimite
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
        createdAt: 'asc'
      }
    })

    // Análise por Boss (contando apenas bosses PAGOS - preco > 0)
    const demandaPorBoss: Record<string, {
      total: number
      porDiaSemana: Record<string, number>
      tendencia: 'crescente' | 'estavel' | 'decrescente'
      mediaUltimos7Dias: number
      mediaUltimos30Dias: number
    }> = {}

    pedidos.forEach(pedido => {
      pedido.itens.forEach(item => {
        // Contar apenas bosses pagos (preco > 0)
        // Bosses grátis no pacote Hela não devem ser contados
        if (item.preco === 0) return

        const bossNome = item.boss.nome
        const diaSemana = new Date(pedido.createdAt).toLocaleDateString('pt-BR', { weekday: 'long' })

        if (!demandaPorBoss[bossNome]) {
          demandaPorBoss[bossNome] = {
            total: 0,
            porDiaSemana: {},
            tendencia: 'estavel',
            mediaUltimos7Dias: 0,
            mediaUltimos30Dias: 0
          }
        }

        demandaPorBoss[bossNome].total++
        demandaPorBoss[bossNome].porDiaSemana[diaSemana] = 
          (demandaPorBoss[bossNome].porDiaSemana[diaSemana] || 0) + 1
      })
    })

    // Calcular tendências
    const agora = new Date()
    const ultimos7Dias = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
    const ultimos30Dias = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)

    Object.keys(demandaPorBoss).forEach(bossNome => {
      // Contar apenas pedidos com boss PAGO (preco > 0)
      const pedidos7Dias = pedidos.filter(p => 
        new Date(p.createdAt) >= ultimos7Dias &&
        p.itens.some(item => item.boss.nome === bossNome && item.preco > 0)
      ).length

      const pedidos30Dias = pedidos.filter(p => 
        new Date(p.createdAt) >= ultimos30Dias &&
        p.itens.some(item => item.boss.nome === bossNome && item.preco > 0)
      ).length

      demandaPorBoss[bossNome].mediaUltimos7Dias = pedidos7Dias / 7
      demandaPorBoss[bossNome].mediaUltimos30Dias = pedidos30Dias / 30

      // Determinar tendência
      const razao = demandaPorBoss[bossNome].mediaUltimos7Dias / (demandaPorBoss[bossNome].mediaUltimos30Dias || 1)
      
      if (razao > 1.2) {
        demandaPorBoss[bossNome].tendencia = 'crescente'
      } else if (razao < 0.8) {
        demandaPorBoss[bossNome].tendencia = 'decrescente'
      } else {
        demandaPorBoss[bossNome].tendencia = 'estavel'
      }
    })

    // Horários de pico
    const pedidosPorHora: Record<number, number> = {}
    pedidos.forEach(pedido => {
      const hora = new Date(pedido.createdAt).getHours()
      pedidosPorHora[hora] = (pedidosPorHora[hora] || 0) + 1
    })

    const horarioPico = Object.entries(pedidosPorHora)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hora]) => parseInt(hora))

    // Dia da semana com mais demanda
    const pedidosPorDiaSemana: Record<string, number> = {}
    pedidos.forEach(pedido => {
      const diaSemana = new Date(pedido.createdAt).toLocaleDateString('pt-BR', { weekday: 'long' })
      pedidosPorDiaSemana[diaSemana] = (pedidosPorDiaSemana[diaSemana] || 0) + 1
    })

    const diaComMaisDemanda = Object.entries(pedidosPorDiaSemana)
      .sort(([,a], [,b]) => b - a)[0]

    // Previsão para próximos 7 dias (baseada na média diária de PEDIDOS)
    const pedidosUltimos7Dias = pedidos.filter(p => 
      new Date(p.createdAt) >= ultimos7Dias
    ).length
    const mediaDiaria7Dias = pedidosUltimos7Dias / 7
    const previsaoProximos7Dias = Math.round(mediaDiaria7Dias * 7)

    return NextResponse.json({
      demandaPorBoss,
      horariosPico: horarioPico,
      diaComMaisDemanda: {
        dia: diaComMaisDemanda?.[0] || 'N/A',
        quantidade: diaComMaisDemanda?.[1] || 0
      },
      previsaoProximos7Dias,
      totalPedidosUltimos90Dias: pedidos.length,
      mediaDiaria: (pedidos.length / 90).toFixed(2)
    })
  } catch (error) {
    console.error('Erro na análise preditiva:', error)
    return NextResponse.json(
      { error: 'Erro ao analisar demanda' },
      { status: 500 }
    )
  }
}

