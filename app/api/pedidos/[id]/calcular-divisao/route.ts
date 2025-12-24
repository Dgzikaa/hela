import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { calcularDivisaoPagamento } from '@/lib/payment-calculator'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pedidoId = parseInt(params.id)
    const body = await request.json()
    
    const { 
      jogadoresIds, 
      taxaSistema = 0, 
      bonusEssencial = 10, 
      bonusHela = 15,
      aplicar = false 
    } = body

    // Buscar pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId }
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Buscar jogadores
    const jogadores = await prisma.jogador.findMany({
      where: {
        id: { in: jogadoresIds }
      }
    })

    if (jogadores.length === 0) {
      return NextResponse.json({ error: 'Nenhum jogador encontrado' }, { status: 400 })
    }

    // Calcular divisão
    const resultado = calcularDivisaoPagamento(
      pedido.valorTotal,
      jogadores,
      { taxaSistema, bonusEssencial, bonusHela }
    )

    // Se aplicar = true, salvar no banco
    if (aplicar) {
      // Deletar participações antigas
      await prisma.participacaoCarry.deleteMany({
        where: { pedidoId }
      })

      // Criar novas participações com valores calculados
      await prisma.participacaoCarry.createMany({
        data: resultado.divisoes.map(div => ({
          pedidoId,
          jogadorId: div.jogadorId,
          valorRecebido: div.valorRecebido,
          pago: false
        }))
      })

      return NextResponse.json({
        success: true,
        message: 'Divisão aplicada com sucesso',
        resultado
      })
    }

    // Apenas retornar preview
    return NextResponse.json({ 
      preview: true,
      resultado 
    })
  } catch (error) {
    console.error('Erro ao calcular divisão:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular divisão' },
      { status: 500 }
    )
  }
}

