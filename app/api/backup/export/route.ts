import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Exportar todos os dados principais
    const [
      jogadores,
      clientes,
      bosses,
      pedidos
    ] = await Promise.all([
      prisma.jogador.findMany({
        include: {
          participacoes: true
        }
      }),
      prisma.cliente.findMany(),
      prisma.boss.findMany(),
      prisma.pedido.findMany({
        include: {
          itens: true,
          participacoes: true
        }
      })
    ])

    const backup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        jogadores,
        clientes,
        bosses,
        pedidos
      },
      metadata: {
        totalJogadores: jogadores.length,
        totalClientes: clientes.length,
        totalBosses: bosses.length,
        totalPedidos: pedidos.length
      }
    }

    return NextResponse.json(backup)
  } catch (error) {
    console.error('Erro ao gerar backup:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar backup' },
      { status: 500 }
    )
  }
}

