import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Período: últimos 6 meses
    const hoje = new Date()
    const seiseMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1)
    const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    // 1. MÉTRICAS PRINCIPAIS
    const totalCarrys = await prisma.pedido.count({
      where: {
        status: {
          in: ['CONCLUIDO']
        }
      }
    })

    const receitaTotal = await prisma.pedido.aggregate({
      where: {
        status: {
          in: ['CONCLUIDO']
        }
      },
      _sum: {
        valorTotal: true
      }
    })

    const totalClientes = await prisma.cliente.count()

    const carrysAgendados = await prisma.pedido.count({
      where: {
        status: 'AGENDADO'
      }
    })

    const taxaConclusao = totalCarrys > 0 
      ? Math.round((totalCarrys / (totalCarrys + carrysAgendados)) * 100) 
      : 0

    // 2. GRÁFICO - Carrys por mês (últimos 6 meses)
    const carrysPorMes = await prisma.pedido.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: seiseMesesAtras
        }
      },
      _count: true,
      _sum: {
        valorTotal: true
      }
    })

    // Organizar por mês
    const mesesMap: Record<string, { carrys: number; receita: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mesKey = mes.toLocaleDateString('pt-BR', { month: 'short' })
      mesesMap[mesKey] = { carrys: 0, receita: 0 }
    }

    carrysPorMes.forEach((item) => {
      const mes = new Date(item.createdAt).toLocaleDateString('pt-BR', { month: 'short' })
      if (mesesMap[mes]) {
        mesesMap[mes].carrys += item._count
        mesesMap[mes].receita += (item._sum.valorTotal || 0) / 1000 // Converter para bilhões
      }
    })

    const dadosGrafico = Object.entries(mesesMap).map(([mes, dados]) => ({
      mes,
      carrys: dados.carrys,
      receita: parseFloat(dados.receita.toFixed(2))
    }))

    // 3. ATIVIDADES RECENTES
    const pedidosRecentes = await prisma.pedido.findMany({
      where: {
        createdAt: {
          gte: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000) // últimos 7 dias
        }
      },
      include: {
        cliente: true,
        itens: {
          include: {
            boss: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const atividades = pedidosRecentes.map((pedido) => {
      const tempoDecorrido = Math.floor((hoje.getTime() - new Date(pedido.createdAt).getTime()) / (1000 * 60 * 60)) // horas
      let tempoTexto = `${tempoDecorrido}h atrás`
      if (tempoDecorrido > 24) {
        tempoTexto = `${Math.floor(tempoDecorrido / 24)} dia${Math.floor(tempoDecorrido / 24) > 1 ? 's' : ''} atrás`
      }

      let tipo: 'concluido' | 'carry' | 'pagamento' | 'jogador' = 'carry'
      let titulo = 'Novo carry agendado'
      let descricao = `Bosses para ${pedido.dataAgendada ? new Date(pedido.dataAgendada).toLocaleDateString('pt-BR') : 'a definir'}`

      if (pedido.status === 'CONCLUIDO') {
        tipo = 'concluido'
        titulo = 'Carry concluído'
        descricao = `Cliente: ${pedido.cliente?.nome || pedido.nomeCliente}`
      }

      return {
        id: pedido.id,
        tipo,
        titulo,
        descricao,
        tempo: tempoTexto,
        valor: pedido.valorTotal
      }
    })

    // 4. TOP JOGADORES (por participações e ganhos)
    const jogadoresStats = await prisma.jogador.findMany({
      include: {
        participacoes: {
          where: {
            valorRecebido: {
              gt: 0
            }
          }
        }
      }
    })

    const topJogadores = jogadoresStats
      .map((jogador) => {
        const totalCarrysJogador = jogador.participacoes.length
        const totalGanhos = jogador.participacoes.reduce(
          (sum, p) => sum + (p.valorRecebido || 0),
          0
        )

        return {
          id: jogador.id,
          nome: jogador.nick,
          carrys: totalCarrysJogador,
          ganhos: totalGanhos,
          posicao: 0
        }
      })
      .sort((a, b) => b.ganhos - a.ganhos)
      .slice(0, 5)
      .map((jogador, index) => ({
        ...jogador,
        posicao: index + 1
      }))

    // 5. METAS (baseadas nos dados do mês atual)
    const carrysMesAtual = await prisma.pedido.count({
      where: {
        createdAt: {
          gte: mesAtual
        }
      }
    })

    const receitaMesAtual = await prisma.pedido.aggregate({
      where: {
        createdAt: {
          gte: mesAtual
        },
        status: {
          in: ['CONCLUIDO']
        }
      },
      _sum: {
        valorTotal: true
      }
    })

    const clientesMesAtual = await prisma.cliente.count({
      where: {
        createdAt: {
          gte: mesAtual
        }
      }
    })

    const metas = [
      {
        id: 1,
        titulo: 'Carrys do Mês',
        atual: carrysMesAtual,
        objetivo: 50,
        unidade: 'carrys',
        cor: 'purple' as const
      },
      {
        id: 2,
        titulo: 'Receita Mensal',
        atual: parseFloat(((receitaMesAtual._sum.valorTotal || 0) / 1000).toFixed(2)),
        objetivo: 4.0,
        unidade: 'b',
        cor: 'green' as const
      },
      {
        id: 3,
        titulo: 'Novos Clientes',
        atual: clientesMesAtual,
        objetivo: 20,
        unidade: 'clientes',
        cor: 'blue' as const
      },
      {
        id: 4,
        titulo: 'Taxa de Conclusão',
        atual: taxaConclusao,
        objetivo: 100,
        unidade: '%',
        cor: 'orange' as const
      }
    ]

    // 6. MÉTRICAS COMPARATIVAS (mês atual vs mês anterior)
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    const inicioMesPassado = new Date(mesPassado.getFullYear(), mesPassado.getMonth(), 1)
    const fimMesPassado = new Date(mesPassado.getFullYear(), mesPassado.getMonth() + 1, 0, 23, 59, 59)

    const carrysMesPassado = await prisma.pedido.count({
      where: {
        createdAt: {
          gte: inicioMesPassado,
          lte: fimMesPassado
        }
      }
    })

    const receitaMesPassado = await prisma.pedido.aggregate({
      where: {
        createdAt: {
          gte: inicioMesPassado,
          lte: fimMesPassado
        },
        status: {
          in: ['CONCLUIDO']
        }
      },
      _sum: {
        valorTotal: true
      }
    })

    const variacaoCarrys = carrysMesPassado > 0
      ? Math.round(((carrysMesAtual - carrysMesPassado) / carrysMesPassado) * 100)
      : 0

    const receitaAtual = receitaMesAtual._sum.valorTotal || 0
    const receitaAnterior = receitaMesPassado._sum.valorTotal || 0
    const variacaoReceita = receitaAnterior > 0
      ? Math.round(((receitaAtual - receitaAnterior) / receitaAnterior) * 100)
      : 0

    return NextResponse.json({
      metricas: {
        totalCarrys,
        receitaTotal: parseFloat(((receitaTotal._sum.valorTotal || 0) / 1000).toFixed(2)),
        totalClientes,
        taxaConclusao,
        variacaoCarrys,
        variacaoReceita
      },
      dadosGrafico,
      atividades,
      topJogadores,
      metas
    })
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 }
    )
  }
}

