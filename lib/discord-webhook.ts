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

// Enviar mensagem privada via Discord API
export async function enviarMensagemPrivada(discordId: string, conteudo: {
  titulo: string
  descricao: string
  cor?: number
  campos?: { nome: string; valor: string; inline?: boolean }[]
  rodape?: string
}) {
  const botToken = process.env.DISCORD_BOT_TOKEN

  if (!botToken) {
    console.warn('⚠️ DISCORD_BOT_TOKEN não configurado - mensagem privada não enviada')
    return
  }

  try {
    // Criar canal DM com o usuário
    const dmChannelResponse = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient_id: discordId
      })
    })

    if (!dmChannelResponse.ok) {
      console.error('❌ Erro ao criar canal DM:', await dmChannelResponse.text())
      return
    }

    const dmChannel = await dmChannelResponse.json()

    // Enviar mensagem no canal DM
    const embed = {
      title: conteudo.titulo,
      description: conteudo.descricao,
      color: conteudo.cor || 0xFFD700,
      fields: conteudo.campos || [],
      footer: conteudo.rodape ? { text: conteudo.rodape } : undefined,
      timestamp: new Date().toISOString()
    }

    const messageResponse = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    })

    if (!messageResponse.ok) {
      console.error('❌ Erro ao enviar mensagem privada:', await messageResponse.text())
    } else {
      console.log(`✅ Mensagem privada enviada para ${discordId}`)
    }
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem privada:', error)
  }
}

// Notificar jogadores sobre novo carry
export async function notificarJogadoresNovoCarry(jogadores: Array<{
  discordId: string | null
  nick: string
}>, pedido: {
  id: number
  nomeCliente: string
  dataAgendada: string | null
  bosses: string[]
  valorTotal: number
}) {
  const dataFormatada = pedido.dataAgendada 
    ? new Date(pedido.dataAgendada).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'A definir'

  for (const jogador of jogadores) {
    if (!jogador.discordId) {
      console.log(`⚠️ Jogador ${jogador.nick} não tem Discord ID configurado`)
      continue
    }

    await enviarMensagemPrivada(jogador.discordId, {
      titulo: '🎮 Novo Carry Agendado!',
      descricao: `Olá **${jogador.nick}**! Você foi selecionado para participar de um carry.`,
      cor: 0x00FF00,
      campos: [
        { nome: '👤 Cliente', valor: pedido.nomeCliente, inline: true },
        { nome: '💰 Valor Total', valor: `${pedido.valorTotal}KK`, inline: true },
        { nome: '🎯 Bosses', valor: pedido.bosses.join(', '), inline: false },
        { nome: '📅 Data', valor: dataFormatada, inline: false }
      ],
      rodape: `Pedido #${pedido.id} • Boa sorte!`
    })

    // Pequeno delay para não sobrecarregar a API do Discord
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

// Enviar lembrete diário para jogadores
export async function enviarLembreteDiarioCarrys(jogadores: Array<{
  discordId: string | null
  nick: string
  carrys: Array<{
    id: number
    nomeCliente: string
    dataAgendada: string
    bosses: string[]
    horario: string
  }>
}>) {
  for (const jogador of jogadores) {
    if (!jogador.discordId || jogador.carrys.length === 0) continue

    const listaCarrys = jogador.carrys.map(c => 
      `**${c.horario}** - ${c.nomeCliente}\n🎯 ${c.bosses.join(', ')}`
    ).join('\n\n')

    await enviarMensagemPrivada(jogador.discordId, {
      titulo: '☀️ Bom dia! Carries de Hoje',
      descricao: `Olá **${jogador.nick}**! Você tem **${jogador.carrys.length} carry(s)** agendado(s) para hoje:`,
      cor: 0xFFD700,
      campos: [
        { nome: '📋 Seus Carries de Hoje', valor: listaCarrys, inline: false }
      ],
      rodape: 'Boa sorte! 🎮'
    })

    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

