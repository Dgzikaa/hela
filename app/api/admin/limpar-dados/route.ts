import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    // Deletar dados relacionados primeiro (foreign keys)
    
    // 1. Deletar participações de carrys
    const participacoes = await prisma.participacaoCarry.deleteMany({})
    console.log(`✅ ${participacoes.count} participações deletadas`)
    
    // 2. Deletar itens dos pedidos
    const itens = await prisma.itensPedido.deleteMany({})
    console.log(`✅ ${itens.count} itens de pedidos deletados`)
    
    // 3. Deletar pedidos
    const pedidos = await prisma.pedido.deleteMany({})
    console.log(`✅ ${pedidos.count} pedidos deletados`)
    
    // 4. Deletar clientes
    const clientes = await prisma.cliente.deleteMany({})
    console.log(`✅ ${clientes.count} clientes deletados`)
    
    // 5. Resetar totalGanho dos jogadores
    await prisma.jogador.updateMany({
      data: {
        totalGanho: 0,
        ultimoCarry: null
      }
    })
    console.log(`✅ Total ganho dos jogadores resetado`)
    
    return NextResponse.json({ 
      success: true, 
      message: '🎉 Banco de dados limpo com sucesso!',
      deleted: {
        participacoes: participacoes.count,
        itens: itens.count,
        pedidos: pedidos.count,
        clientes: clientes.count
      }
    })
  } catch (error: any) {
    console.error('❌ Erro ao limpar banco:', error)
    return NextResponse.json({ 
      error: error.message,
      details: 'Erro ao limpar o banco de dados'
    }, { status: 500 })
  }
}

