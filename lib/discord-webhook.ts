// Função para enviar mensagens via Discord Webhook
export async function enviarWebhookDiscord(conteudo: {
  titulo: string
  descricao: string
  cor?: number
  campos?: { nome: string; valor: string; inline?: boolean }[]
  rodape?: string
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('⚠️ DISCORD_WEBHOOK_URL não configurado - mensagem não enviada')
    return
  }

  try {
    const embed = {
      title: conteudo.titulo,
      description: conteudo.descricao,
      color: conteudo.cor || 0xFFD700, // Dourado
      fields: conteudo.campos || [],
      footer: conteudo.rodape ? { text: conteudo.rodape } : undefined,
      timestamp: new Date().toISOString()
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [embed]
      })
    })

    if (!response.ok) {
      console.error('❌ Erro ao enviar webhook Discord:', await response.text())
    } else {
      console.log('✅ Webhook Discord enviado com sucesso!')
    }
  } catch (error) {
    console.error('❌ Erro ao enviar webhook Discord:', error)
  }
}

// Notificar novo carry
export async function notificarNovoCarry(pedido: {
  id: number
  nomeCliente: string
  contatoCliente: string
  valorTotal: number
  bosses: string[]
  pacoteCompleto: boolean
  conquistaSemMorrer: boolean
}) {
  const bossesTexto = pedido.bosses.join(', ')
  const extras = []
  if (pedido.pacoteCompleto) extras.push('🎁 Pacote Completo')
  if (pedido.conquistaSemMorrer) extras.push('⭐ Sem Morrer')

  await enviarWebhookDiscord({
    titulo: '🛒 Novo Carry Registrado!',
    descricao: `**Cliente:** ${pedido.nomeCliente}\n**Contato:** ${pedido.contatoCliente}`,
    cor: 0x00FF00, // Verde
    campos: [
      { nome: '💰 Valor Total', valor: `${pedido.valorTotal}KK`, inline: true },
      { nome: '🎯 Bosses', valor: bossesTexto, inline: false },
      ...(extras.length > 0 ? [{ nome: '🎁 Extras', valor: extras.join('\n'), inline: false }] : [])
    ],
    rodape: `Pedido #${pedido.id} • Acesse o painel para aprovar`
  })
}

// Notificar carry agendado
export async function notificarCarryAgendado(pedido: {
  id: number
  nomeCliente: string
  dataAgendada: string
  bosses: string[]
  valorTotal: number
}) {
  const dataFormatada = new Date(pedido.dataAgendada).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  await enviarWebhookDiscord({
    titulo: '📅 Carry Agendado!',
    descricao: `**${pedido.nomeCliente}** - ${pedido.bosses.join(', ')}`,
    cor: 0x0099FF, // Azul
    campos: [
      { nome: '📆 Data', valor: dataFormatada, inline: true },
      { nome: '💰 Valor', valor: `${pedido.valorTotal}KK`, inline: true }
    ],
    rodape: `Pedido #${pedido.id}`
  })
}

// Notificar carry concluído
export async function notificarCarryConcluido(pedido: {
  id: number
  nomeCliente: string
  valorTotal: number
  bosses: string[]
}) {
  await enviarWebhookDiscord({
    titulo: '✅ Carry Concluído!',
    descricao: `**${pedido.nomeCliente}** completou os bosses: ${pedido.bosses.join(', ')}`,
    cor: 0x00FF00, // Verde
    campos: [
      { nome: '💰 Valor', valor: `${pedido.valorTotal}KK`, inline: true }
    ],
    rodape: `Pedido #${pedido.id} • Parabéns ao time! 🎉`
  })
}

// Enviar calendário semanal
export async function enviarCalendarioSemanal(carrys: Array<{
  id: number
  nomeCliente: string
  dataAgendada: string
  bosses: string[]
  valorTotal: number
}>) {
  if (carrys.length === 0) {
    await enviarWebhookDiscord({
      titulo: '📅 Calendário da Semana',
      descricao: 'Nenhum carry agendado para esta semana.',
      cor: 0x808080 // Cinza
    })
    return
  }

  // Agrupar por dia
  const porDia: Record<string, typeof carrys> = {}
  carrys.forEach(carry => {
    const dia = new Date(carry.dataAgendada).toLocaleDateString('pt-BR')
    if (!porDia[dia]) porDia[dia] = []
    porDia[dia].push(carry)
  })

  const campos = Object.entries(porDia).map(([dia, carrysNoDia]) => {
    const texto = carrysNoDia
      .map(c => `• ${c.nomeCliente} - ${c.bosses.join(', ')} (${c.valorTotal}KK)`)
      .join('\n')
    
    return {
      nome: `📆 ${dia}`,
      valor: texto,
      inline: false
    }
  })

  await enviarWebhookDiscord({
    titulo: '📅 Calendário da Semana',
    descricao: `${carrys.length} carry(s) agendado(s)`,
    cor: 0xFFD700, // Dourado
    campos,
    rodape: 'Hela Carrys Manager • Sistema Profissional'
  })
}

