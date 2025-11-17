import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const discordUserId = searchParams.get('discordUserId')

    if (discordUserId) {
      // Buscar cliente específico
      const cliente = await prisma.cliente.findUnique({
        where: { discordUserId },
        include: {
          pedidos: {
            include: {
              itens: {
                include: {
                  boss: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      return NextResponse.json(cliente)
    }

    // Listar todos os clientes
    const clientes = await prisma.cliente.findMany({
      include: {
        _count: {
          select: { pedidos: true }
        }
      },
      orderBy: { totalGasto: 'desc' }
    })
    
    return NextResponse.json(clientes)
  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { discordUserId, discordUsername } = body

    // Buscar ou criar cliente
    let cliente = await prisma.cliente.findUnique({
      where: { discordUserId }
    })

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          discordUserId,
          discordUsername
        }
      })
    }

    return NextResponse.json(cliente)
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Atualizar tier do cliente baseado nas compras
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { clienteId } = body

    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        pedidos: {
          where: {
            status: { in: ['CONCLUIDO', 'AGENDADO', 'EM_ANDAMENTO'] }
          }
        }
      }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Calcular estatísticas
    const totalCompras = cliente.pedidos.length
    const totalGasto = cliente.pedidos.reduce((acc, p) => acc + p.valorTotal, 0)

    // Determinar tier
    let tier = 'BRONZE'
    if (totalCompras >= 21) tier = 'DIAMANTE'
    else if (totalCompras >= 11) tier = 'PLATINA'
    else if (totalCompras >= 6) tier = 'OURO'
    else if (totalCompras >= 3) tier = 'PRATA'

    // Atualizar cliente
    const clienteAtualizado = await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        totalCompras,
        totalGasto,
        tier: tier as any,
        ultimaCompra: new Date()
      }
    })

    return NextResponse.json(clienteAtualizado)
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

