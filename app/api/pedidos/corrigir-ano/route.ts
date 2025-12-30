import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('🔧 Corrigindo anos dos pedidos...');

    // Buscar pedidos de dezembro 2024 e janeiro 2025 que precisam ser ajustados
    const pedidos2024 = await prisma.pedido.findMany({
      where: {
        dataAgendada: {
          gte: new Date('2024-12-01'),
          lt: new Date('2025-01-01')
        },
        status: {
          in: ['AGENDADO', 'EM_ANDAMENTO']
        }
      }
    });

    console.log(`📅 Encontrados ${pedidos2024.length} pedidos de dezembro 2024`);

    // Remover esses pedidos (pois são duplicados da importação errada)
    let totalRemovidos = 0;

    for (const pedido of pedidos2024) {
      // Remover itens do pedido primeiro
      await prisma.itensPedido.deleteMany({
        where: { pedidoId: pedido.id }
      });

      // Remover o pedido
      await prisma.pedido.delete({
        where: { id: pedido.id }
      });

      console.log(`✅ Removido: ${pedido.nomeCliente} - ${pedido.dataAgendada?.toLocaleDateString('pt-BR')}`);
      totalRemovidos++;
    }

    console.log(`\n✅ Total removido: ${totalRemovidos} pedidos de 2024`);

    return NextResponse.json({
      success: true,
      totalRemovidos,
      mensagem: 'Pedidos de dezembro 2024 removidos com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao corrigir anos:', error);
    return NextResponse.json(
      { error: 'Erro ao corrigir anos', details: String(error) },
      { status: 500 }
    );
  }
}
