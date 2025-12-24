import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notificarNovoCarry, notificarCarryAgendado, notificarCarryConcluido, notificarJogadoresNovoCarry, notificarCarryCancelado } from '@/lib/discord-webhook'
import { escalarJogadoresAutomaticamente } from '@/lib/escalar-jogadores'

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        itens: {
          include: {
            boss: true
          }
        },
        aprovador: {
          select: {
            nome: true,
            email: true
          }
        },
        participacoes: {
          include: {
            jogador: {
              select: {
                id: true,
                nick: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(pedidos)
  } catch (error: any) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      clienteId,
      nomeCliente, 
      contatoCliente, 
      bosses, 
      conquistaSemMorrer, 
      pacoteCompleto, 
      valorTotal,
      desconto,
      descontoTipo,
      origem,
      observacoes,
      jogadores, // Array de IDs dos jogadores participantes
      bossesPrecos, // Mapa de ID do boss -> preço customizado (opcional)
      compradores // Array de compradores (para múltiplos compradores)
    } = body

    // Validações
    if (!nomeCliente || !contatoCliente || !bosses || bosses.length === 0) {
      return NextResponse.json(
        { error: 'Dados incompletos' }, 
        { status: 400 }
      )
    }

    // Buscar preços dos bosses
    const bossesData = await prisma.boss.findMany({
      where: {
        id: { in: bosses }
      }
    })

    // Criar pedido com itens e participações
    const pedido = await prisma.pedido.create({
      data: {
        clienteId,
        nomeCliente,
        contatoCliente,
        status: 'PENDENTE',
        valorTotal,
        desconto: desconto || 0,
        descontoTipo,
        conquistaSemMorrer,
        pacoteCompleto,
        origem: origem || 'WEB',
        observacoes,
        itens: {
          create: bossesData.map(boss => {
            // Se for pacote completo: Hela tem preço, bosses 1-6 são grátis
            let precoFinal = boss.preco
            if (pacoteCompleto) {
              precoFinal = boss.id === 7 ? boss.preco : 0
            } else if (bossesPrecos && bossesPrecos[boss.id] !== undefined) {
              // Usar preço customizado se fornecido
              precoFinal = bossesPrecos[boss.id]
            }
            
            return {
              bossId: boss.id,
              preco: precoFinal
            }
          })
        },
        participacoes: jogadores && jogadores.length > 0 ? {
          create: jogadores.map((jogadorId: number) => ({
            jogadorId,
            valorRecebido: 0 // Será calculado depois
          }))
        } : undefined
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

    // Atualizar ultimoCarry dos jogadores participantes
    if (jogadores && jogadores.length > 0) {
      const agora = new Date()
      await Promise.all(
        jogadores.map((jogadorId: number) =>
          prisma.jogador.update({
            where: { id: jogadorId },
            data: {
              ultimoCarry: agora,
              totalCarrys: { increment: 1 }
            }
          })
        )
      )
    }

    // Atualizar estatísticas do cliente
    if (clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        include: {
          pedidos: {
            where: {
              status: { not: 'CANCELADO' }
            }
          }
        }
      })

      if (cliente) {
        const totalCompras = cliente.pedidos.length
        const totalGasto = cliente.pedidos.reduce((acc, p) => acc + p.valorTotal, 0)

        // Determinar tier
        let tier = 'BRONZE'
        if (totalCompras >= 21) tier = 'DIAMANTE'
        else if (totalCompras >= 11) tier = 'PLATINA'
        else if (totalCompras >= 6) tier = 'OURO'
        else if (totalCompras >= 3) tier = 'PRATA'

        await prisma.cliente.update({
          where: { id: clienteId },
          data: {
            totalCompras,
            totalGasto,
            tier: tier as any,
            ultimaCompra: new Date(),
            primeiraCompra: cliente.primeiraCompra || new Date()
          }
        })
      }
    }

    // Notificar no Discord (webhook público)
    try {
      console.log('🔔 [API] Preparando notificação de NOVO CARRY para Discord...')
      const bossesCompletos = pedido.itens.map((i: any) => ({ id: i.boss.id, nome: i.boss.nome }))
      const jogadoresEscalados = pedido.participacoes.map((p: any) => p.jogador.nick)
      console.log('🔔 [API] Bosses:', bossesCompletos)
      console.log('🔔 [API] Cliente:', pedido.nomeCliente)
      console.log('🔔 [API] Jogadores:', jogadoresEscalados)
      console.log('🔔 [API] DISCORD_WEBHOOK_URL configurado?', !!process.env.DISCORD_WEBHOOK_URL)
      
      await notificarNovoCarry({
        id: pedido.id,
        nomeCliente: pedido.nomeCliente,
        contatoCliente: pedido.contatoCliente,
        valorTotal: pedido.valorTotal,
        bossesCompletos: bossesCompletos,
        pacoteCompleto: pedido.pacoteCompleto,
        conquistaSemMorrer: pedido.conquistaSemMorrer,
        jogadores: jogadoresEscalados,
        compradores: compradores || [{ nome: pedido.nomeCliente }]
      })
      
      console.log('✅ [API] Notificação de NOVO CARRY enviada!')

      // ========================================
      // TEMPORARIAMENTE DESABILITADO - Pode causar rate limit do Discord
      // TODO: Implementar delay entre mensagens quando reativar
      // ========================================
      // Notificar jogadores participantes via DM
      // if (pedido.participacoes && pedido.participacoes.length > 0) {
      //   const jogadoresParaNotificar = pedido.participacoes.map((p: any) => ({
      //     discordId: p.jogador.discordId,
      //     nick: p.jogador.nick
      //   }))

      //   await notificarJogadoresNovoCarry(jogadoresParaNotificar, {
      //     id: pedido.id,
      //     nomeCliente: pedido.nomeCliente,
      //     dataAgendada: pedido.dataAgendada ? pedido.dataAgendada.toISOString() : null,
      //     bosses: bossesNomes,
      //     valorTotal: pedido.valorTotal
      //   })
      // }
    } catch (error) {
      console.error('Erro ao notificar Discord (não crítico):', error)
    }
    
    return NextResponse.json(pedido, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, status, dataAgendada, aprovadoPor, marcarPago } = body

    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        status,
        dataAgendada: dataAgendada ? new Date(dataAgendada) : undefined,
        aprovadoPor
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

    // Se concluir e marcar como pago, processar pagamentos
    if (status === 'CONCLUIDO' && marcarPago && pedido.participacoes.length > 0) {
      // Calcular valor por jogador (dividir igualmente entre participantes)
      const valorPorJogador = Math.floor(pedido.valorTotal / pedido.participacoes.length)

      // Atualizar participações e jogadores
      for (const participacao of pedido.participacoes) {
        // Marcar participação como paga e definir valor recebido
        await prisma.participacaoCarry.update({
          where: { id: participacao.id },
          data: {
            pago: true,
            valorRecebido: valorPorJogador
          }
        })

        // Atualizar totalGanho do jogador
        await prisma.jogador.update({
          where: { id: participacao.jogadorId },
          data: {
            totalGanho: {
              increment: valorPorJogador
            }
          }
        })
      }

      // Enviar notificações de pagamento aos jogadores cadastrados
      try {
        const { notificarJogadoresPagos } = await import('@/lib/discord-webhook')
        const bossesNomes = pedido.itens.map((i: any) => i.boss.nome)
        
        const jogadoresParaNotificar = pedido.participacoes.map(p => ({
          nick: p.jogador.nick,
          discordId: p.jogador.discordId,
          valorRecebido: valorPorJogador,
          valorTotalCarrys: p.jogador.totalGanho + valorPorJogador
        }))

        await notificarJogadoresPagos(jogadoresParaNotificar, {
          id: pedido.id,
          bosses: bossesNomes
        })
      } catch (error) {
        console.error('Erro ao notificar jogadores sobre pagamento:', error)
      }
    }

    // Notificar no Discord baseado no status
    try {
      console.log('🔔 [API] PATCH - Status mudou para:', status)
      const bossesNomes = pedido.itens.map((i: any) => i.boss.nome)

      if (status === 'AGENDADO' && dataAgendada) {
        console.log('📅 [API] Carry AGENDADO - Escalando jogadores automaticamente...')
        
        // Escalar jogadores automaticamente
        const resultadoEscalacao = await escalarJogadoresAutomaticamente(
          id,
          new Date(dataAgendada)
        )
        
        if (resultadoEscalacao.success) {
          console.log(`✅ [API] ${resultadoEscalacao.jogadoresEscalados} jogadores escalados automaticamente`)
        } else {
          console.warn(`⚠️ [API] Aviso na escalação: ${resultadoEscalacao.erro}`)
        }
        
        // Recarregar pedido com participações atualizadas
        const pedidoAtualizado = await prisma.pedido.findUnique({
          where: { id },
          include: {
            participacoes: {
              include: {
                jogador: {
                  select: {
                    nick: true
                  }
                }
              }
            }
          }
        })
        
        const jogadoresEscalados = pedidoAtualizado?.participacoes.map((p: any) => p.jogador.nick) || []
        
        console.log('📅 [API] Enviando notificação de AGENDAMENTO...')
        await notificarCarryAgendado({
          id: pedido.id,
          nomeCliente: pedido.nomeCliente,
          dataAgendada: dataAgendada,
          bosses: bossesNomes,
          valorTotal: pedido.valorTotal,
          jogadores: jogadoresEscalados
        })
        console.log('✅ [API] Notificação de AGENDAMENTO enviada!')
      } else if (status === 'CONCLUIDO') {
        // Sempre notificar conclusão no canal público
        console.log('✅ [API] Enviando notificação de CONCLUSÃO...')
        const jogadoresEscalados = pedido.participacoes.map((p: any) => p.jogador.nick)
        await notificarCarryConcluido({
          id: pedido.id,
          nomeCliente: pedido.nomeCliente,
          jogadores: jogadoresEscalados,
          valorTotal: pedido.valorTotal,
          bosses: bossesNomes
        })
        console.log('✅ [API] Notificação de CONCLUSÃO enviada!')
      } else if (status === 'CANCELADO') {
        await notificarCarryCancelado({
          id: pedido.id,
          nomeCliente: pedido.nomeCliente,
          dataAgendada: pedido.dataAgendada?.toISOString() || null,
          bosses: bossesNomes,
          valorTotal: pedido.valorTotal,
          motivo: body.motivo
        })
      }
    } catch (error) {
      console.error('Erro ao notificar Discord (não crítico):', error)
    }

    return NextResponse.json(pedido)
  } catch (error: any) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    // Deletar itens e participações relacionadas primeiro
    await prisma.itensPedido.deleteMany({
      where: { pedidoId: id }
    })

    await prisma.participacaoCarry.deleteMany({
      where: { pedidoId: id }
    })

    // Deletar o pedido
    await prisma.pedido.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Pedido excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir pedido:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { 
      id,
      nomeCliente, 
      contatoCliente, 
      bosses, 
      valorTotal,
      observacoes,
      bossesPrecos
    } = body

    // Buscar o pedido atual
    const pedidoAtual = await prisma.pedido.findUnique({
      where: { id },
      include: { itens: true }
    })

    if (!pedidoAtual) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Deletar itens antigos
    await prisma.itensPedido.deleteMany({
      where: { pedidoId: id }
    })

    // Criar novos itens
    const itensData = await Promise.all(
      bosses.map(async (bossId: number) => {
        const boss = await prisma.boss.findUnique({ where: { id: bossId } })
        if (!boss) throw new Error(`Boss não encontrado: ${bossId}`)
        
        // Usar preço customizado se fornecido, senão usar preço padrão do boss
        const preco = bossesPrecos && bossesPrecos[bossId] 
          ? bossesPrecos[bossId] 
          : boss.preco
        
        return {
          bossId,
          preco,
          pedidoId: id
        }
      })
    )

    // Atualizar pedido com novos dados
    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: {
        nomeCliente,
        contatoCliente,
        valorTotal,
        valorFinal: valorTotal, // Assumindo que não há desconto na edição
        observacoes,
        itens: {
          create: itensData
        }
      },
      include: {
        itens: {
          include: {
            boss: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Pedido atualizado com sucesso',
      pedido: pedidoAtualizado
    })
  } catch (error: any) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

