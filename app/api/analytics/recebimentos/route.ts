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
      // Carrys concluídos - verifica se jogador participou OU se carry não tem participações (carrys antigos)
      const carrysConcluidos = pedidosConcluidos.filter(p => {
        // Se não tem participações, considerar que todos os 11 participaram
        if (!p.participacoes || p.participacoes.length === 0) {
          return true
        }
        // Se tem participações, verificar se o jogador está nelas
        return p.participacoes.some(part => part.jogadorId === jogador.id)
      })
      
      const valorRecebido = carrysConcluidos.reduce((sum, pedido) => {
        // Dividir valor pelo número de jogadores (11)
        return sum + Math.floor(pedido.valorFinal / 11)
      }, 0)

      // Carrys futuros - verifica se jogador participou OU se carry não tem participações
      const carrysFuturos = pedidosAgendados.filter(p => {
        // Se não tem participações, considerar que todos os 11 participaram
        if (!p.participacoes || p.participacoes.length === 0) {
          return true
        }
        // Se tem participações, verificar se o jogador está nelas
        return p.participacoes.some(part => part.jogadorId === jogador.id)
      })
      
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

    // Calcular totais gerais (soma direta dos pedidos, não dos jogadores)
    const valorTotalRecebido = pedidosConcluidos.reduce((sum, p) => sum + p.valorFinal, 0)
    const valorTotalAReceber = pedidosAgendados.reduce((sum, p) => sum + p.valorFinal, 0)
    
    const totais = {
      totalCarrysConcluidos: pedidosConcluidos.length,
      totalCarrysFuturos: pedidosAgendados.length,
      totalCarrys: pedidosConcluidos.length + pedidosAgendados.length,
      valorTotalRecebido,
      valorTotalAReceber,
      valorTotalGeral: valorTotalRecebido + valorTotalAReceber
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

