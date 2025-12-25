import { prisma } from './prisma'

/**
 * Escala automaticamente jogadores em um carry
 * 
 * Regras:
 * - Sempre escala os 10 jogadores principais (essencial: true)
 * - Se tiver 2+ carrys no mesmo dia: NÃO escala Pablo (10 jogadores)
 * - Se tiver apenas 1 carry no dia: ESCALA Pablo (11 jogadores)
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

    // 2. Verificar quantos carrys estão agendados para o mesmo dia
    const inicioDia = new Date(dataAgendada)
    inicioDia.setHours(0, 0, 0, 0)
    
    const fimDia = new Date(dataAgendada)
    fimDia.setHours(23, 59, 59, 999)

    const carrysNoDia = await prisma.pedido.count({
      where: {
        dataAgendada: {
          gte: inicioDia,
          lte: fimDia
        },
        status: {
          in: ['AGENDADO', 'EM_ANDAMENTO']
        }
      }
    })

    console.log(`📊 Total de carrys agendados para ${dataAgendada.toLocaleDateString('pt-BR')}: ${carrysNoDia}`)

    // 3. Buscar Pablo (jogador rotativo)
    const pablo = await prisma.jogador.findFirst({
      where: {
        nick: 'Pablo',
        ativo: true
      },
      select: {
        id: true
      }
    })

    // 4. Determinar quem escalar
    const jogadoresParaEscalar = [...jogadoresPrincipais]
    
    // Se tiver apenas 1 carry no dia, adiciona Pablo
    // Se tiver 2+ carrys, NÃO adiciona Pablo (time de 10)
    if (carrysNoDia === 1 && pablo) {
      jogadoresParaEscalar.push({ id: pablo.id, nick: 'Pablo' })
      console.log(`✅ Pablo escalado (1 carry no dia)`)
    } else if (carrysNoDia >= 2) {
      console.log(`⚠️ Pablo NÃO escalado (${carrysNoDia} carrys no dia - time de 10)`)
    }

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

