import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar todos os jogadores principais (essenciais + Pablo)
    const jogadores = await prisma.jogador.findMany({
      where: {
        ativo: true,
        OR: [
          { essencial: true },
          { nick: 'Pablo' }
        ]
      },
      orderBy: {
        nick: 'asc'
      }
    })

    // Buscar todos os pedidos concluídos e agendados
    const pedidosConcluidos = await prisma.pedido.findMany({
      where: {
        status: 'CONCLUIDO'
      },
      include: {
        participacoes: {
          include: {
            jogador: true
          }
        }
      }
    })

    const pedidosAgendados = await prisma.pedido.findMany({
      where: {
        status: {
          in: ['AGENDADO', 'EM_ANDAMENTO']
        }
      },
      include: {
        participacoes: {
          include: {
            jogador: true
          }
        }
      }
    })

    // Calcular estatísticas por jogador
    const estatisticas = jogadores.map(jogador => {
      // Carrys concluídos
      const carrysConcluidos = pedidosConcluidos.filter(p => 
        p.participacoes.some(part => part.jogadorId === jogador.id)
      )
      
      const valorRecebido = carrysConcluidos.reduce((sum, pedido) => {
        // Dividir valor pelo número de jogadores (11)
        return sum + Math.floor(pedido.valorFinal / 11)
      }, 0)

      // Carrys futuros
      const carrysFuturos = pedidosAgendados.filter(p => 
        p.participacoes.some(part => part.jogadorId === jogador.id)
      )
      
      const valorAReceber = carrysFuturos.reduce((sum, pedido) => {
        // Dividir valor pelo número de jogadores (11)
        return sum + Math.floor(pedido.valorFinal / 11)
      }, 0)

      return {
        jogador: {
          id: jogador.id,
          nick: jogador.nick,
          essencial: jogador.essencial
        },
        carrysConcluidos: carrysConcluidos.length,
        carrysFuturos: carrysFuturos.length,
        totalCarrys: carrysConcluidos.length + carrysFuturos.length,
        valorRecebido,
        valorAReceber,
        valorTotal: valorRecebido + valorAReceber
      }
    })

    // Ordenar por valor total (maior para menor)
    estatisticas.sort((a, b) => b.valorTotal - a.valorTotal)

    // Calcular totais gerais
    const totais = {
      totalCarrysConcluidos: pedidosConcluidos.length,
      totalCarrysFuturos: pedidosAgendados.length,
      totalCarrys: pedidosConcluidos.length + pedidosAgendados.length,
      valorTotalRecebido: estatisticas.reduce((sum, e) => sum + e.valorRecebido, 0),
      valorTotalAReceber: estatisticas.reduce((sum, e) => sum + e.valorAReceber, 0),
      valorTotalGeral: estatisticas.reduce((sum, e) => sum + e.valorTotal, 0)
    }

    return NextResponse.json({
      estatisticas,
      totais
    })
  } catch (error: any) {
    console.error('Erro ao buscar recebimentos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

