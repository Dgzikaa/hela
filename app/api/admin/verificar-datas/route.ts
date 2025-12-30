import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar todos os pedidos de dezembro 2025
    const pedidos = await prisma.pedido.findMany({
      where: {
        dataAgendada: {
          gte: new Date('2025-12-01'),
          lte: new Date('2025-12-31')
        }
      },
      orderBy: {
        dataAgendada: 'asc'
      },
      select: {
        id: true,
        nomeCliente: true,
        dataAgendada: true,
        horario: true,
        status: true,
        statusPagamento: true,
        createdAt: true
      }
    })

    // Agrupar por data
    const porData: Record<string, any[]> = {}
    pedidos.forEach(p => {
      const data = p.dataAgendada!.toISOString().split('T')[0]
      if (!porData[data]) {
        porData[data] = []
      }
      porData[data].push({
        id: p.id,
        nome: p.nomeCliente,
        horario: p.horario ? p.horario.toString().substring(0, 5) : '21:00',
        status: p.status,
        statusPagamento: p.statusPagamento
      })
    })

    // Formatar resposta
    const resultado = Object.keys(porData).sort().map(data => {
      const carrys = porData[data]
      return {
        data,
        dataFormatada: new Date(data + 'T12:00:00').toLocaleDateString('pt-BR'),
        totalCarrys: carrys.length,
        excedeuLimite: carrys.length > 3,
        carrys
      }
    })

    return NextResponse.json({
      total: pedidos.length,
      datas: resultado
    })

  } catch (error) {
    console.error('Erro ao verificar datas:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar datas' },
      { status: 500 }
    )
  }
}
