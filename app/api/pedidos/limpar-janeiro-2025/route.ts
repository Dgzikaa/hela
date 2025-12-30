import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('🗑️ Removendo pedidos de janeiro 2025 (ano errado)...');

    // Remover todos os pedidos de janeiro 2025 (deveria ser 2026)
    const result = await prisma.pedido.deleteMany({
      where: {
        dataAgendada: {
          gte: new Date('2025-01-01'),
          lt: new Date('2025-02-01')
        }
      }
    });

    console.log(`✅ Removidos ${result.count} pedidos de janeiro 2025`);

    return NextResponse.json({
      success: true,
      totalRemovidos: result.count,
      mensagem: 'Pedidos de janeiro 2025 removidos com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao remover pedidos', details: String(error) },
      { status: 500 }
    );
  }
}
