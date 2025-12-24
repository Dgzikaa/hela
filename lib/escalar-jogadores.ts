import { prisma } from './prisma'

/**
 * Escala automaticamente jogadores em um carry
 * 
 * Regras:
 * - Sempre escala os 10 jogadores principais (essencial: true)
 * - SEMPRE adiciona Pablo (11 jogadores no total)
 * - Pablo ainda está ativo e recebendo em todos os carrys
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

    // 2. Buscar Pablo (jogador rotativo)
    const pablo = await prisma.jogador.findFirst({
      where: {
        nick: 'Pablo',
        ativo: true
      },
      select: {
        id: true
      }
    })

    // 3. Determinar quem escalar
    const jogadoresParaEscalar = [...jogadoresPrincipais]
    
    // SEMPRE adiciona Pablo (ele ainda está recebendo)
    if (pablo) {
      jogadoresParaEscalar.push({ id: pablo.id, nick: 'Pablo' })
    }

    // 4. Buscar pedido para calcular valorRecebido
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

    // 5. Verificar se já existem participações (evitar duplicatas)
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

    // 6. Criar participações
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

