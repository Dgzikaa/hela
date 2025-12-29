import { prisma } from './prisma'

/**
 * Escala automaticamente jogadores em um carry
 * 
 * Novo sistema (Dez/2025):
 * - SEMPRE escala 11 jogadores (10 essenciais + Pablo)
 * - TODOS recebem, independente da quantidade de carrys
 * - 9 jogadores fazem o carry (sem Pablo e Lazo)
 * - Valor sempre dividido por 11
 */
export async function escalarJogadoresAutomaticamente(
  pedidoId: number,
  dataAgendada: Date
): Promise<{ success: boolean; jogadoresEscalados: number; erro?: string }> {
  try {
    // 1. Buscar jogadores principais (essenciais) ativos
    const jogadoresPrincipais = await prisma.jogador.findMany({
      where: {
        essencial: true,
        ativo: true
      },
      select: {
        id: true,
        nick: true
      }
    })

    if (jogadoresPrincipais.length !== 10) {
      return {
        success: false,
        jogadoresEscalados: 0,
        erro: `Erro: Esperado 10 jogadores principais, encontrados ${jogadoresPrincipais.length}`
      }
    }

    // 2. Buscar Pablo
    const pablo = await prisma.jogador.findFirst({
      where: {
        nick: 'Pablo',
        ativo: true
      },
      select: {
        id: true
      }
    })

    if (!pablo) {
      return {
        success: false,
        jogadoresEscalados: 0,
        erro: 'Pablo não encontrado no banco'
      }
    }

    // 3. SEMPRE escalar 11 jogadores (todos)
    const jogadoresParaEscalar = [...jogadoresPrincipais, { id: pablo.id, nick: 'Pablo' }]
    
    console.log(`✅ Escalando 11 jogadores (TODOS recebem, 9 fazem o carry)`)

    // 5. Buscar pedido para calcular valorRecebido
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { valorFinal: true }
    })

    if (!pedido) {
      return {
        success: false,
        jogadoresEscalados: 0,
        erro: 'Pedido não encontrado'
      }
    }

    const valorPorJogador = Math.floor(pedido.valorFinal / jogadoresParaEscalar.length)

    console.log(`💰 Valor por jogador: ${valorPorJogador}kk (${pedido.valorFinal}kk / ${jogadoresParaEscalar.length} jogadores)`)

    // 6. Verificar se já existem participações (evitar duplicatas)
    const participacoesExistentes = await prisma.participacaoCarry.count({
      where: { pedidoId }
    })

    if (participacoesExistentes > 0) {
      return {
        success: true,
        jogadoresEscalados: participacoesExistentes,
        erro: 'Jogadores já escalados'
      }
    }

    // 7. Criar participações
    await prisma.participacaoCarry.createMany({
      data: jogadoresParaEscalar.map(jogador => ({
        pedidoId,
        jogadorId: jogador.id,
        valorRecebido: valorPorJogador,
        pago: false
      }))
    })

    console.log(`✅ Escalados ${jogadoresParaEscalar.length} jogadores para pedido ${pedidoId}:`, 
      jogadoresParaEscalar.map(j => j.nick).join(', ')
    )

    return {
      success: true,
      jogadoresEscalados: jogadoresParaEscalar.length
    }
  } catch (error: any) {
    console.error('❌ Erro ao escalar jogadores:', error)
    return {
      success: false,
      jogadoresEscalados: 0,
      erro: error.message
    }
  }
}

