import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jogadorId = parseInt(params.id)

    const jogador = await prisma.jogador.findUnique({
      where: { id: jogadorId },
      include: {
        participacoes: {
          include: {
            pedido: {
              include: {
                itens: {
                  include: {
                    boss: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!jogador) {
      return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 })
    }

    // Estatísticas detalhadas
    const totalCarrys = jogador.participacoes.length
    const totalGanho = jogador.participacoes.reduce((sum, p) => sum + (p.valorRecebido || 0), 0)
    
    // Carrys por boss
    const carrysPorBoss: Record<string, number> = {}
    jogador.participacoes.forEach(p => {
      p.pedido.itens.forEach(item => {
        const bossNome = item.boss.nome
        carrysPorBoss[bossNome] = (carrysPorBoss[bossNome] || 0) + 1
      })
    })

    // Média de ganho por carry
    const mediaGanhoPorCarry = totalCarrys > 0 ? totalGanho / totalCarrys : 0

    // Carrys por mês (últimos 6 meses)
    const carrysPorMes: Record<string, number> = {}
    const hoje = new Date()
    for (let i = 0; i < 6; i++) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mesKey = mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      carrysPorMes[mesKey] = 0
    }
    
    jogador.participacoes.forEach(p => {
      const data = new Date(p.pedido.dataCriacao)
      const mesKey = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      if (mesKey in carrysPorMes) {
        carrysPorMes[mesKey]++
      }
    })

    // Taxa de participação em Hela
    const carrysHela = jogador.participacoes.filter(p => 
      p.pedido.itens.some(item => item.boss.nome.toLowerCase().includes('hela'))
    ).length
    const taxaHela = totalCarrys > 0 ? (carrysHela / totalCarrys) * 100 : 0

    return NextResponse.json({
      jogador: {
        id: jogador.id,
        nick: jogador.nick,
        categorias: jogador.categorias,
        essencial: jogador.essencial
      },
      stats: {
        totalCarrys,
        totalGanho,
        mediaGanhoPorCarry: Math.round(mediaGanhoPorCarry),
        carrysHela,
        taxaHela: Math.round(taxaHela),
        carrysPorBoss,
        carrysPorMes
      }
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas do jogador:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}

