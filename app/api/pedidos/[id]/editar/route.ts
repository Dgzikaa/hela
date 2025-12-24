import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const pedidoId = parseInt(resolvedParams.id)
    const body = await request.json()

    const {
      valorTotal,
      valorFinal,
      valorReserva,
      statusPagamento,
      reservaPaga,
      horario,
      observacoes,
      itens
    } = body

    // Validar e formatar horário
    let horarioParaSalvar = null
    if (horario && typeof horario === 'string' && horario.trim() !== '') {
      try {
        const horarioDate = new Date(`2000-01-01T${horario}`)
        if (!isNaN(horarioDate.getTime())) {
          horarioParaSalvar = horarioDate
        }
      } catch (e) {
        console.error('Horário inválido, salvando como null:', horario)
      }
    }

    // Atualizar pedido
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        valorTotal,
        valorFinal,
        valorReserva,
        reservaPaga,
        horario: horarioParaSalvar,
        observacoes: observacoes || null,
        updatedAt: new Date()
      }
    })

    // Atualizar statusPagamento via SQL direto (workaround temporário)
    if (statusPagamento) {
      await prisma.$executeRaw`
        UPDATE "Pedido" 
        SET "statusPagamento" = ${statusPagamento}::"StatusPagamento"
        WHERE id = ${pedidoId}
      `
    }

    // Deletar itens antigos
    await prisma.itensPedido.deleteMany({
      where: { pedidoId }
    })

    // Criar novos itens
    if (itens && itens.length > 0) {
      await prisma.itensPedido.createMany({
        data: itens.map((item: any) => ({
          pedidoId,
          bossId: item.bossId,
          preco: item.preco
        }))
      })
    }

    // Buscar pedido atualizado com itens
    const pedidoAtualizado = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        itens: {
          include: {
            boss: true
          }
        }
      }
    })

    return NextResponse.json(pedidoAtualizado)
  } catch (error) {
    console.error('Erro ao editar pedido:', error)
    return NextResponse.json(
      { error: 'Erro ao editar pedido', details: error instanceof Error ? error.message : 'Desconhecido' },
      { status: 500 }
    )
  }
}

