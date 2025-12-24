import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { agendamentos } = await request.json()

    const resultados = []

    for (const agendamento of agendamentos) {
      const { data, clientes, sinal, observacoes } = agendamento

      // VALIDAÇÃO: Máximo 2 clientes por data
      if (clientes.length > 2) {
        console.warn(`⚠️ Data ${data} tem ${clientes.length} clientes. Limite: 2. Considerando apenas os 2 primeiros.`)
        clientes.splice(2) // Remove do índice 2 em diante
      }

      // Para cada cliente no mesmo dia (máximo 2)
      for (const clienteNome of clientes) {
        // Criar ou buscar cliente
        let cliente = await prisma.cliente.findFirst({
          where: {
            OR: [
              { nome: clienteNome },
              { nickIngame: clienteNome }
            ]
          }
        })

        if (!cliente) {
          // Criar cliente novo
          cliente = await prisma.cliente.create({
            data: {
              discordUserId: `temp_${Date.now()}_${Math.random()}`,
              discordUsername: clienteNome,
              nome: clienteNome,
              nickIngame: clienteNome,
              categoria: 'COMPRADOR',
              totalCompras: 0,
              totalGasto: 0
            }
          })
        }

        // Buscar todos os bosses (Hela completa = 1-6)
        const bosses = await prisma.boss.findMany({
          orderBy: { ordem: 'asc' }
        })

        const valorTotal = bosses.reduce((sum, boss) => sum + boss.preco, 0)

        // Determinar status e statusPagamento baseado no sinal
        let status: 'PENDENTE' | 'AGENDADO' = 'AGENDADO' // Sempre agendado (tem data)
        let statusPagamento: 'NAO_PAGO' | 'SINAL' | 'PAGO' = 'NAO_PAGO'
        let reservaPaga = false
        let valorReserva = 0

        if (sinal === 'sinal OK') {
          statusPagamento = 'SINAL'
          reservaPaga = true
          valorReserva = 2000 // 2b
        } else if (sinal === 'pago todo' || sinal === 'pago tudo') {
          statusPagamento = 'PAGO'
          reservaPaga = true
          valorReserva = valorTotal
        } else if (sinal === 'aguardando sinal' || sinal === 'aguardando') {
          statusPagamento = 'NAO_PAGO'
          status = 'PENDENTE' // Ainda não confirmou
        }

        // Criar pedido
        const pedido = await prisma.pedido.create({
          data: {
            clienteId: cliente.id,
            nomeCliente: clienteNome,
            contatoCliente: cliente.discordUsername,
            status,
            // statusPagamento, // Comentado até regenerar Prisma
            dataAgendada: new Date(data), // Data do carry agendado
            valorTotal,
            valorFinal: valorTotal,
            pacoteCompleto: true,
            reservaPaga,
            valorReserva,
            dataReserva: reservaPaga ? new Date() : null,
            observacoes: observacoes || null, // Campo para sacolinhas, etc.
            itens: {
              create: bosses.map(boss => ({
                bossId: boss.id,
                // Pacote Completo: Hela tem preço, bosses 1-6 são grátis (relíquias)
                preco: boss.id === 7 ? boss.preco : 0
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

        // Atualizar statusPagamento via SQL direto (workaround temporário)
        await prisma.$executeRaw`
          UPDATE "Pedido" 
          SET "statusPagamento" = ${statusPagamento}::"StatusPagamento"
          WHERE id = ${pedido.id}
        `

        // Atualizar estatísticas do cliente
        await prisma.cliente.update({
          where: { id: cliente.id },
          data: {
            totalCompras: { increment: 1 },
            totalGasto: { increment: valorTotal },
            ultimaCompra: new Date(),
            primeiraCompra: cliente.primeiraCompra || new Date()
          }
        })

        resultados.push({
          pedidoId: pedido.id,
          cliente: clienteNome,
          data,
          status,
          statusPagamento
        })
      }
    }

    return NextResponse.json({
      message: `${resultados.length} agendamentos importados com sucesso`,
      resultados
    })
  } catch (error) {
    console.error('Erro ao importar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro ao importar agendamentos' },
      { status: 500 }
    )
  }
}

