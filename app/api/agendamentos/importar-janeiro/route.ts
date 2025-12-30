import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Dados dos agendamentos conforme fornecido
const agendamentos = [
  {
    data: '2025-12-29T19:00:00',
    carrys: [
      { nome: 'Theodoro', contato: 'bolzanii', observacoes: 'Discord: bolzanii - sinal ok' },
      { nome: 'goukii', contato: 'goukii', observacoes: 'sinal OK' },
      { nome: 'Trasher', contato: 'Trasher', observacoes: 'sinal OK' },
    ]
  },
  {
    data: '2025-12-30T21:00:00',
    carrys: [
      { nome: 'EsterWurfel', contato: 'EsterWurfel', observacoes: 'Discord: juninho - sinal OK' },
      { nome: 'bento 2', contato: 'bento 2', observacoes: 'sinal ok' },
      { nome: 'WillGuns', contato: 'WillGuns', observacoes: 'sinal OK' },
    ]
  },
  {
    data: '2025-12-31T13:00:00',
    carrys: [
      { nome: 'Drakka', contato: 'Drakka', observacoes: 'Sinal ok' },
      { nome: 'Chessuis', contato: 'Chessuis', observacoes: 'sinal OK' },
      { nome: 'tico', contato: 'tico', observacoes: 'Discord: sr bubas - Sacolas: sacolas - sinal ok' },
    ]
  },
  {
    data: '2026-01-01T21:00:00',
    carrys: [
      { nome: 'halloweengod', contato: 'halloweengod', observacoes: 'sinal OK' },
      { nome: 'Atryon', contato: 'Atryon', observacoes: 'Discord: Alera - Sacolas: Alera (21hs) - sinal OK' },
      { nome: 'escuroClaro', contato: 'escuroClaro', observacoes: 'sinal ok' },
    ]
  },
  {
    data: '2026-01-02T21:00:00',
    carrys: [
      { nome: 'inx', contato: 'inx', observacoes: 'sinal OK' },
      { nome: 'ErickMxFlamejante', contato: 'ErickMxFlamejante', observacoes: 'sinal OK' },
      { nome: 'bernardo olimpo', contato: 'bernardo olimpo', observacoes: 'Discord: azgher - sinal ok' },
    ]
  },
  {
    data: '2026-01-03T21:00:00',
    carrys: [
      { nome: 'Balbs', contato: 'Balbs', observacoes: 'Discord: Kowalski - ID: _neto.08 - sinal OK' },
      { nome: 'zlixx', contato: 'zlixx', observacoes: 'PAGO TUDO', statusPagamento: 'PAGO' as const },
      { nome: 'Fredyn', contato: 'Fredyn', observacoes: 'Sinal ok' },
    ]
  },
  {
    data: '2026-01-04T21:00:00',
    carrys: [
      { nome: 'FoxGauthier', contato: 'FoxGauthier', observacoes: 'Sinal ok' },
      { nome: 'EVANS', contato: 'EVANS', observacoes: 'Sacolas: PREFIROCAIRDEMOTO - sinal OK' },
      { nome: 'japanakaz', contato: 'japanakaz', observacoes: 'sinal OK' },
    ]
  },
  {
    data: '2026-01-05T21:00:00',
    carrys: [
      { nome: 'Verdiinho', contato: 'Verdiinho', observacoes: 'sinal OK' },
      { nome: 'slackzera', contato: 'slackzera', observacoes: 'sinal OK' },
      { nome: 'Gabriel', contato: 'Gabriel', observacoes: 'Discord: gabrielsticky - Sacolas: MKTCACETE - PAGO TUDO!', statusPagamento: 'PAGO' as const },
    ]
  },
  {
    data: '2026-01-06T21:00:00',
    carrys: [
      { nome: 'aww aww', contato: 'aww aww', observacoes: 'Discord: .raphao - sinal OK' },
      { nome: 'Treco', contato: 'Avaraquela', observacoes: 'Sacolas: Avaraquela - Sinal ok' },
      { nome: 'Rossit0', contato: 'Rossit0', observacoes: 'Sacolas: Droppganger - sinal OK' },
    ]
  },
  {
    data: '2026-01-07T21:00:00',
    carrys: [
      { nome: 'Matheus', contato: 'Matheus', observacoes: 'Discord: matheusjardim_17 - Sacolas: defeiticeira ex biscate - sinal OK' },
      { nome: 'Kurt', contato: 'Kurt', observacoes: 'Discord: w4nted - sinal OK' },
      { nome: 'Mtz', contato: 'Mtz', observacoes: 'Sacolas: pequena serpente - sinal ok' },
    ]
  },
  {
    data: '2026-01-08T21:00:00',
    carrys: [
      { nome: 'Sanci', contato: 'Sanci', observacoes: 'sinal OK' },
      { nome: 'Dibis', contato: 'Dibis', observacoes: 'Sinal OK' },
      { nome: 'Gakotali', contato: 'Gakotali', observacoes: 'sinal OK' },
      { nome: 'ilovenat', contato: 'ilovenat', observacoes: 'sinal OK' },
    ]
  },
  {
    data: '2026-01-09T21:00:00',
    carrys: [
      { nome: 'RDGW', contato: 'RDGW', observacoes: 'sinal OK' },
      { nome: 'azvini', contato: 'azvini', observacoes: 'Amigo do bibico - sinal OK (1.5b)', valorTotal: 1500000000 },
      { nome: 'CaioNog', contato: 'CaioNog', observacoes: 'sinal ok' },
    ]
  },
  {
    data: '2026-01-10T21:00:00',
    carrys: [
      { nome: 'ApoLo', contato: 'ApoLo', observacoes: 'Discord: apolo0076 - Sacolas: heatclyf - PAGO TODO!', statusPagamento: 'PAGO' as const },
      { nome: 'Heydros', contato: 'Heydros', observacoes: 'Sacolas: Gameplayduvidosa - sinal ok' },
    ]
  },
  {
    data: '2026-01-11T21:00:00',
    carrys: [
      { nome: 'Castorzao', contato: 'Castorzao', observacoes: 'Sacolas: SoulBurner - sinal OK' },
      { nome: 'Tortoise', contato: 'Tortoise', observacoes: 'sinal OK' },
    ]
  },
  {
    data: '2026-01-27T21:00:00',
    carrys: [
      { nome: 'spynon', contato: 'spynon', observacoes: 'Discord: spynon - Sacolas de zeny do Balbs - sinal OK - A CONFIRMAR', statusPagamento: 'SINAL' as const },
    ]
  },
  {
    data: '2026-02-06T21:00:00',
    carrys: [
      { nome: 'Lucas', contato: 'Lucas', observacoes: 'aguardando. não pagou nada', statusPagamento: 'NAO_PAGO' as const },
    ]
  },
];

export async function POST(request: Request) {
  try {
    console.log('🚀 Iniciando importação de agendamentos...');

    // Buscar todos os bosses para calcular o valor total
    const bosses = await prisma.boss.findMany({
      orderBy: { ordem: 'asc' }
    });

    if (bosses.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum boss encontrado no banco!' },
        { status: 400 }
      );
    }

    // Valor total do pacote completo (bosses 1-6)
    const valorPacoteCompleto = bosses.reduce((sum, boss) => sum + boss.preco, 0);
    console.log(`💰 Valor do pacote completo: ${valorPacoteCompleto / 1000000000}b`);

    let totalImportados = 0;
    let totalAtualizados = 0;
    const resultados = [];

    for (const agendamento of agendamentos) {
      const dataAgendada = new Date(agendamento.data);
      console.log(`📅 Processando: ${dataAgendada.toLocaleString('pt-BR')}`);

      for (const carry of agendamento.carrys) {
        const statusPagamento = (carry as any).statusPagamento || 'SINAL';
        const valorTotal = (carry as any).valorTotal || valorPacoteCompleto;
        const valorFinal = statusPagamento === 'PAGO' ? valorTotal : valorTotal;

        // Verificar se já existe um pedido para este cliente nesta data
        const pedidoExistente = await prisma.pedido.findFirst({
          where: {
            nomeCliente: carry.nome,
            dataAgendada: {
              gte: new Date(dataAgendada.getTime() - 3600000), // 1 hora antes
              lte: new Date(dataAgendada.getTime() + 3600000), // 1 hora depois
            },
          }
        });

        if (pedidoExistente) {
          // Atualizar pedido existente
          await prisma.pedido.update({
            where: { id: pedidoExistente.id },
            data: {
              contatoCliente: carry.contato,
              observacoes: carry.observacoes,
              statusPagamento: statusPagamento,
              valorTotal: valorTotal,
              valorFinal: valorFinal,
              status: 'AGENDADO',
              pacoteCompleto: true,
            }
          });

          resultados.push({
            acao: 'ATUALIZADO',
            nome: carry.nome,
            data: dataAgendada.toLocaleString('pt-BR'),
            statusPagamento,
          });
          totalAtualizados++;
        } else {
          // Criar novo pedido
          const novoPedido = await prisma.pedido.create({
            data: {
              nomeCliente: carry.nome,
              contatoCliente: carry.contato,
              observacoes: carry.observacoes,
              dataAgendada: dataAgendada,
              status: 'AGENDADO',
              statusPagamento: statusPagamento,
              valorTotal: valorTotal,
              valorFinal: valorFinal,
              pacoteCompleto: true,
              origem: 'DISCORD',
            }
          });

          // Adicionar todos os bosses (1-6) aos itens do pedido
          for (const boss of bosses) {
            await prisma.itensPedido.create({
              data: {
                pedidoId: novoPedido.id,
                bossId: boss.id,
                preco: boss.preco,
              }
            });
          }

          resultados.push({
            acao: 'CRIADO',
            nome: carry.nome,
            data: dataAgendada.toLocaleString('pt-BR'),
            statusPagamento,
          });
          totalImportados++;
        }
      }
    }

    console.log('✅ Importação concluída!');
    console.log(`📊 Total criados: ${totalImportados}`);
    console.log(`📊 Total atualizados: ${totalAtualizados}`);

    return NextResponse.json({
      success: true,
      totalImportados,
      totalAtualizados,
      resultados,
    });

  } catch (error) {
    console.error('❌ Erro durante importação:', error);
    return NextResponse.json(
      { error: 'Erro ao importar agendamentos', details: String(error) },
      { status: 500 }
    );
  }
}
