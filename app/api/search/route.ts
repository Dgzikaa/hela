import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const includeClientes = searchParams.get('clientes') === 'true'
    const includePedidos = searchParams.get('pedidos') === 'true'
    const includeJogadores = searchParams.get('jogadores') === 'true'
    const includeItens = searchParams.get('itens') === 'true'

    if (!query.trim()) {
      return NextResponse.json({
        clientes: [],
        pedidos: [],
        jogadores: [],
        itens: []
      })
    }

    const searchTerm = query.toLowerCase()

    // Buscar clientes
    const clientes = includeClientes ? await prisma.cliente.findMany({
      where: {
        OR: [
          { discordUsername: { contains: searchTerm, mode: 'insensitive' } },
          { nome: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { nickIngame: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: 10,
      orderBy: [
        { ultimoContato: 'desc' },
        { totalCompras: 'desc' }
      ],
      select: {
        id: true,
        discordUsername: true,
        nome: true,
        email: true,
        nickIngame: true,
        totalCompras: true,
        totalGasto: true,
        tier: true,
        categoria: true,
        ultimoContato: true
      }
    }) : []

    // Buscar pedidos
    const pedidos = includePedidos ? await prisma.pedido.findMany({
      where: {
        OR: [
          { id: isNaN(Number(searchTerm)) ? undefined : Number(searchTerm) },
          { nomeCliente: { contains: searchTerm, mode: 'insensitive' } },
          { contatoCliente: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: 10,
      orderBy: [
        { dataAgendada: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        itens: {
          include: {
            boss: {
              select: {
                nome: true
              }
            }
          }
        }
      }
    }) : []

    // Buscar jogadores
    const jogadores = includeJogadores ? await prisma.jogador.findMany({
      where: {
        OR: [
          { nick: { contains: searchTerm, mode: 'insensitive' } },
          { discord: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: 10,
      orderBy: [
        { totalCarrys: 'desc' },
        { totalGanho: 'desc' }
      ],
      select: {
        id: true,
        nick: true,
        categorias: true,
        discord: true,
        ativo: true,
        essencial: true,
        totalCarrys: true,
        totalGanho: true
      }
    }) : []

    // Buscar itens (se tiver tabela de itens no futuro)
    const itens: any[] = []

    return NextResponse.json({
      clientes,
      pedidos,
      jogadores,
      itens
    })
  } catch (error) {
    console.error('Erro na busca:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar busca' },
      { status: 500 }
    )
  }
}

