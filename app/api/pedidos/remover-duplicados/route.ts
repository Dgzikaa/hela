import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('🔍 Verificando duplicados...');

    // Buscar todos os pedidos agendados
    const pedidos = await prisma.pedido.findMany({
      where: {
        status: {
          in: ['AGENDADO', 'EM_ANDAMENTO', 'PENDENTE']
        }
      },
      orderBy: [
        { dataAgendada: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Agrupar por data e nome do cliente
    const grupos: Record<string, any[]> = {};
    
    pedidos.forEach(pedido => {
      if (pedido.dataAgendada) {
        const data = pedido.dataAgendada.toISOString().split('T')[0];
        const chave = `${data}-${pedido.nomeCliente.toLowerCase().trim()}`;
        
        if (!grupos[chave]) {
          grupos[chave] = [];
        }
        grupos[chave].push(pedido);
      }
    });

    // Remover duplicados (manter apenas o primeiro de cada grupo)
    let totalRemovidos = 0;
    const removidos = [];

    for (const [chave, pedidosGrupo] of Object.entries(grupos)) {
      if (pedidosGrupo.length > 1) {
        // Ordenar por createdAt (mais antigo primeiro)
        pedidosGrupo.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Manter o primeiro (mais antigo), remover os outros
        const [manter, ...remover] = pedidosGrupo;

        console.log(`📅 ${chave}: Mantendo ID ${manter.id}, removendo ${remover.length} duplicado(s)`);

        for (const pedido of remover) {
          // Primeiro remover os itens do pedido
          await prisma.itensPedido.deleteMany({
            where: { pedidoId: pedido.id }
          });

          // Depois remover o pedido
          await prisma.pedido.delete({
            where: { id: pedido.id }
          });

          removidos.push({
            id: pedido.id,
            nomeCliente: pedido.nomeCliente,
            dataAgendada: pedido.dataAgendada,
            createdAt: pedido.createdAt
          });

          totalRemovidos++;
        }
      }
    }

    console.log(`✅ Duplicados removidos: ${totalRemovidos}`);

    return NextResponse.json({
      success: true,
      totalRemovidos,
      removidos
    });

  } catch (error) {
    console.error('❌ Erro ao remover duplicados:', error);
    return NextResponse.json(
      { error: 'Erro ao remover duplicados', details: String(error) },
      { status: 500 }
    );
  }
}
