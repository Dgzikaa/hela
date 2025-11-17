import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
                nick: true,
                categoria: true
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
      nomeCliente, 
      contatoCliente, 
      bosses, 
      conquistaSemMorrer, 
      pacoteCompleto, 
      valorTotal,
      observacoes 
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

    // Criar pedido com itens
    const pedido = await prisma.pedido.create({
      data: {
        nomeCliente,
        contatoCliente,
        status: 'PENDENTE',
        valorTotal,
        conquistaSemMorrer,
        pacoteCompleto,
        observacoes,
        itens: {
          create: bossesData.map(boss => ({
            bossId: boss.id,
            preco: boss.preco
          }))
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

    // TODO: Enviar notificação (webhook Discord, email, etc)
    
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

    return NextResponse.json(pedido)
  } catch (error: any) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

