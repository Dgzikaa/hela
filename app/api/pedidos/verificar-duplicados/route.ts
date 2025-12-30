import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Buscar todos os pedidos agendados
    const pedidos = await prisma.pedido.findMany({
      where: {
        status: {
          in: ['AGENDADO', 'EM_ANDAMENTO']
        }
      },
      orderBy: {
        dataAgendada: 'asc'
      }
    });

    // Agrupar por data e nome do cliente para encontrar duplicados
    const grupos: Record<string, any[]> = {};
    
    pedidos.forEach(pedido => {
      if (pedido.dataAgendada) {
        const data = pedido.dataAgendada.toISOString().split('T')[0];
        const chave = `${data}-${pedido.nomeCliente}`;
        
        if (!grupos[chave]) {
          grupos[chave] = [];
        }
        grupos[chave].push(pedido);
      }
    });

    // Encontrar duplicados (grupos com mais de 1 pedido)
    const duplicados = Object.entries(grupos)
      .filter(([_, pedidos]) => pedidos.length > 1)
      .map(([chave, pedidos]) => ({
        chave,
        quantidade: pedidos.length,
        pedidos: pedidos.map(p => ({
          id: p.id,
          nomeCliente: p.nomeCliente,
          dataAgendada: p.dataAgendada,
          valorTotal: p.valorTotal,
          observacoes: p.observacoes
        }))
      }));

    return NextResponse.json({
      totalPedidos: pedidos.length,
      duplicados: duplicados.length,
      detalhes: duplicados
    });

  } catch (error) {
    console.error('Erro ao verificar duplicados:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar duplicados', details: String(error) },
      { status: 500 }
    );
  }
}
