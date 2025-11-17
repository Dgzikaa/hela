import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notificarNovoCarry, notificarCarryAgendado, notificarCarryConcluido, notificarJogadoresNovoCarry } from '@/lib/discord-webhook'

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
      jogadores // Array de IDs dos jogadores participantes
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
          create: bossesData.map(boss => ({
            bossId: boss.id,
            preco: boss.preco
          }))
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
      const bossesNomes = pedido.itens.map((i: any) => i.boss.nome)
      await notificarNovoCarry({
        id: pedido.id,
        nomeCliente: pedido.nomeCliente,
        contatoCliente: pedido.contatoCliente,
        valorTotal: pedido.valorTotal,
        bosses: bossesNomes,
        pacoteCompleto: pedido.pacoteCompleto,
        conquistaSemMorrer: pedido.conquistaSemMorrer
      })

      // Notificar jogadores participantes via DM
      if (pedido.participacoes && pedido.participacoes.length > 0) {
        const jogadoresParaNotificar = pedido.participacoes.map((p: any) => ({
          discordId: p.jogador.discordId,
          nick: p.jogador.nick
        }))

        await notificarJogadoresNovoCarry(jogadoresParaNotificar, {
          id: pedido.id,
          nomeCliente: pedido.nomeCliente,
          dataAgendada: pedido.dataAgendada ? pedido.dataAgendada.toISOString() : null,
          bosses: bossesNomes,
          valorTotal: pedido.valorTotal
        })
      }
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
    const { id, status, dataAgendada, aprovadoPor } = body

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
        }
      }
    })

    // Notificar no Discord baseado no status
    try {
      const bossesNomes = pedido.itens.map((i: any) => i.boss.nome)

      if (status === 'AGENDADO' && dataAgendada) {
        await notificarCarryAgendado({
          id: pedido.id,
          nomeCliente: pedido.nomeCliente,
          dataAgendada: dataAgendada,
          bosses: bossesNomes,
          valorTotal: pedido.valorTotal
        })
      } else if (status === 'CONCLUIDO') {
        await notificarCarryConcluido({
          id: pedido.id,
          nomeCliente: pedido.nomeCliente,
          valorTotal: pedido.valorTotal,
          bosses: bossesNomes
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

