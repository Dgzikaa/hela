import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarWebhookDiscord } from '@/lib/discord-webhook'

// Retorna a segunda-feira da semana atual
function getSegundaAtual(): Date {
  const hoje = new Date()
  const dia = hoje.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  const segunda = new Date(hoje)
  segunda.setDate(hoje.getDate() + diff)
  segunda.setHours(0, 0, 0, 0)
  return segunda
}

// Embaralha array (Fisher-Yates)
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export async function POST(request: Request) {
  try {
    const semanaAtual = getSegundaAtual()
    
    // Busca configuração
    const config = await prisma.configuracaoCarryGratis.findFirst()
    if (!config) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 400 }
      )
    }
    
    // Busca todos os inscritos da semana
    const inscritos = await prisma.inscricaoCarryGratis.findMany({
      where: {
        semana: semanaAtual,
        status: 'INSCRITO'
      }
    })
    
    if (inscritos.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum inscrito para sortear' },
        { status: 400 }
      )
    }
    
    // Embaralha a lista
    const embaralhados = shuffle(inscritos)
    
    // Atribui posições
    const totalVagas = config.vagasTitulares + config.vagasReservas
    
    const atualizacoes = embaralhados.map((inscrito, index) => {
      const posicao = index + 1
      const isTitular = posicao <= config.vagasTitulares
      const isReserva = posicao <= totalVagas
      
      return prisma.inscricaoCarryGratis.update({
        where: { id: inscrito.id },
        data: {
          posicaoSorteio: posicao,
          status: isTitular ? 'SORTEADO' : isReserva ? 'SORTEADO' : 'INSCRITO'
        }
      })
    })
    
    await Promise.all(atualizacoes)
    
    // Busca os sorteados atualizados
    const sorteados = await prisma.inscricaoCarryGratis.findMany({
      where: {
        semana: semanaAtual,
        posicaoSorteio: { lte: totalVagas }
      },
      orderBy: { posicaoSorteio: 'asc' }
    })
    
    // Notifica no Discord
    const titulares = sorteados.filter(s => s.posicaoSorteio! <= config.vagasTitulares)
    const reservas = sorteados.filter(s => s.posicaoSorteio! > config.vagasTitulares)
    
    const titularesTexto = titulares
      .map((t, i) => `${i + 1}. **${t.nickIngame}** (${t.discordName})`)
      .join('\n')
    
    const reservasTexto = reservas.length > 0
      ? reservas.map((r, i) => `${i + 1}. ${r.nickIngame} (${r.discordName})`).join('\n')
      : 'Nenhum'
    
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    
    await enviarWebhookDiscord({
      titulo: '🎉 Sorteio Carry Grátis Realizado!',
      descricao: `O sorteio da semana foi realizado! Parabéns aos selecionados!\n\nO carry será no **${diasSemana[config.diaCarry]}** às **${config.horaCarry}**.`,
      cor: 0xFFD700,
      campos: [
        { nome: '🏆 Titulares', valor: titularesTexto || 'Nenhum', inline: false },
        { nome: '📋 Reservas', valor: reservasTexto, inline: false },
        { nome: '⏰ Prazo', valor: `Confirme em até ${config.horasParaConfirmar}h`, inline: true },
        { nome: '📊 Total', valor: `${inscritos.length} inscritos`, inline: true }
      ],
      rodape: 'Confirme sua presença respondendo a esta mensagem!',
      mencionarAqui: true
    })
    
    return NextResponse.json({
      success: true,
      sorteados: sorteados.length,
      total: inscritos.length
    })
  } catch (error) {
    console.error('Erro ao sortear:', error)
    return NextResponse.json(
      { error: 'Erro ao processar sorteio' },
      { status: 500 }
    )
  }
}

