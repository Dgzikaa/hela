// Helper para adicionar emoji numérico aos bosses
function adicionarEmojiBoss(boss: string): string {
  const emojis: Record<string, string> = {
    'Freylith': '1️⃣',
    'Tyrgrim': '2️⃣',
    'Skollgrim': '3️⃣',
    'Baldira': '4️⃣',
    'Thorvald': '5️⃣',
    'Glacius': '6️⃣',
    'Hela': '🔴' // Vermelho para destacar
  }
  return `${emojis[boss] || '❓'} ${boss}`
}

// Função para enviar mensagens via Discord Webhook
export async function enviarWebhookDiscord(conteudo: {
  titulo: string
  descricao: string
  cor?: number
  campos?: { nome: string; valor: string; inline?: boolean }[]
  rodape?: string
  mencionarAqui?: boolean // Adicionar @here
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  console.log('🔔 [WEBHOOK] Função enviarWebhookDiscord chamada')
  console.log('🔔 [WEBHOOK] Título:', conteudo.titulo)
  console.log('🔔 [WEBHOOK] Webhook URL existe?', !!webhookUrl)

  if (!webhookUrl) {
    console.warn('⚠️ DISCORD_WEBHOOK_URL não configurado - mensagem não enviada')
    return
  }

  try {
    // Construir embed sem propriedades undefined
    const embed: any = {
      title: conteudo.titulo,
      description: conteudo.descricao,
      color: conteudo.cor || 0xFFD700, // Dourado
      timestamp: new Date().toISOString()
    }

    // Adicionar campos apenas se existirem (converter para formato Discord)
    if (conteudo.campos && conteudo.campos.length > 0) {
      embed.fields = conteudo.campos.map(campo => ({
        name: campo.nome,   // Discord espera "name", não "nome"
        value: campo.valor, // Discord espera "value", não "valor"
        inline: campo.inline || false
      }))
    }

    // Adicionar footer apenas se existir
    if (conteudo.rodape) {
      embed.footer = { text: conteudo.rodape }
    }

    const payload: any = {
      embeds: [embed]
    }

    // Adicionar @here se solicitado
    if (conteudo.mencionarAqui) {
      payload.content = '@here'
    }

    console.log('🔔 [WEBHOOK] Payload a ser enviado:', JSON.stringify(payload, null, 2))

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
  bossesCompletos: Array<{ id: number; nome: string }>
  pacoteCompleto: boolean
  conquistaSemMorrer: boolean
  jogadores?: string[]
  compradores?: Array<{ nome: string; bossesIds?: number[] }>
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://hela-blond.vercel.app'
  
  // Mapear cada boss com seu comprador (se houver)
  const bossesTexto = pedido.bossesCompletos.map(boss => {
    let texto = adicionarEmojiBoss(boss.nome)
    
    // Para bosses 1-6, adicionar nome do comprador
    if (boss.nome !== 'Hela' && pedido.compradores && pedido.compradores.length > 0) {
      // Encontrar qual comprador selecionou este boss
      const comprador = pedido.compradores.find(c => 
        c.bossesIds && c.bossesIds.includes(boss.id)
      )
      if (comprador) {
        texto += ` (${comprador.nome})`
      }
    }
    
    return texto
  }).join('\n')
  
  const extras = []
  if (pedido.pacoteCompleto) extras.push('🎁 Pacote Completo 1-6')
  if (pedido.conquistaSemMorrer) extras.push('⭐ Conquista Sem Morrer')

  const campos = [
    { nome: '💰 Valor Total', valor: `${pedido.valorTotal}KK`, inline: true },
    { nome: '📊 Pedido', valor: `#${pedido.id}`, inline: true },
    { nome: '🎯 Bosses', valor: bossesTexto, inline: false },
    ...(extras.length > 0 ? [{ nome: '🎁 Extras', valor: extras.join('\n'), inline: false }] : [])
  ]

  // Não precisa mais listar compradores separadamente, já está nos bosses
  // Mas manter se tiver múltiplos compradores para clareza
  if (pedido.compradores && pedido.compradores.length > 1) {
    const compradoresTexto = pedido.compradores.map((c, i) => 
      `${i + 1}. ${c.nome}`
    ).join('\n')
    campos.push({ nome: '🛒 Compradores', valor: compradoresTexto, inline: false })
  }

  // Adicionar time escalado
  if (pedido.jogadores && pedido.jogadores.length > 0) {
    const jogadoresTexto = pedido.jogadores.join(', ')
    campos.push({ nome: '⚔️ Time Escalado', valor: jogadoresTexto, inline: false })
  }

  await enviarWebhookDiscord({
    titulo: '🛒 Novo Carry Registrado!',
    descricao: `**Cliente:** ${pedido.nomeCliente}\n**Contato:** ${pedido.contatoCliente}`,
    cor: 0x00FF00, // Verde
    campos,
    rodape: 'Acesse o painel para aprovar'
  })
}

// Notificar carry agendado
export async function notificarCarryAgendado(pedido: {
  id: number
  nomeCliente: string
  dataAgendada: string
  bosses: string[]
  valorTotal: number
  jogadores?: string[]
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://hela-blond.vercel.app'
  
  const dataFormatada = new Date(pedido.dataAgendada).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const bossesTexto = pedido.bosses.map(boss => adicionarEmojiBoss(boss)).join(', ')

  const campos = [
    { nome: '📆 Data/Hora', valor: dataFormatada, inline: false },
    { nome: '💰 Valor', valor: `${pedido.valorTotal}KK`, inline: true },
    { nome: '📊 Pedido', valor: `#${pedido.id}`, inline: true }
  ]

  // Adicionar time escalado
  if (pedido.jogadores && pedido.jogadores.length > 0) {
    const jogadoresTexto = pedido.jogadores.join(', ')
    campos.push({ nome: '⚔️ Time Escalado', valor: jogadoresTexto, inline: false })
  }

  await enviarWebhookDiscord({
    titulo: '📅 Carry Agendado!',
    descricao: `**Cliente:** ${pedido.nomeCliente}\n**Bosses:** ${bossesTexto}`,
    cor: 0x0099FF, // Azul
    campos,
    rodape: 'Preparar o time!',
    mencionarAqui: true // Notificar @here
  })
}

// Notificar carry concluído
export async function notificarCarryConcluido(pedido: {
  id: number
  nomeCliente: string
  valorTotal: number
  bosses: string[]
  jogadores?: string[]
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://hela-blond.vercel.app'
  
  const bossesTexto = pedido.bosses.map(boss => adicionarEmojiBoss(boss)).join(', ')

  const campos = [
    { nome: '💰 Valor', valor: `${pedido.valorTotal}KK`, inline: true },
    { nome: '📊 Pedido', valor: `#${pedido.id}`, inline: true }
  ]

  // Adicionar time que participou
  if (pedido.jogadores && pedido.jogadores.length > 0) {
    const jogadoresTexto = pedido.jogadores.join(', ')
    campos.push({ nome: '⚔️ Time', valor: jogadoresTexto, inline: false })
  }

  await enviarWebhookDiscord({
    titulo: '✅ Carry Concluído!',
    descricao: `**${pedido.nomeCliente}** completou:\n${bossesTexto}`,
    cor: 0xFFD700, // Dourado
    campos,
    rodape: 'Parabéns ao time! 🎉'
  })
}

// Notificar jogadores que foram pagos
export async function notificarJogadoresPagos(jogadores: Array<{
  nick: string
  discordId: string | null
  valorRecebido: number
  valorTotalCarrys: number
}>, pedido: {
  id: number
  bosses: string[]
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://hela-blond.vercel.app'
  
  const bossesTexto = pedido.bosses.map(boss => adicionarEmojiBoss(boss)).join('\n')

  // Enviar mensagem para cada jogador cadastrado (com discordId)
  for (const jogador of jogadores) {
    if (!jogador.discordId) continue // Pular jogadores sem Discord

    try {
      await enviarMensagemPrivada(jogador.discordId, {
        titulo: '💰 Pagamento Recebido!',
        descricao: `Você foi pago pelo carry **#${pedido.id}**`,
        cor: 0xFFD700, // Dourado
        campos: [
          { nome: '🛡️ Bosses', valor: bossesTexto, inline: false },
          { nome: '💵 Valor Recebido', valor: `${jogador.valorRecebido}KK`, inline: true },
          { nome: '📊 Total Acumulado', valor: `${jogador.valorTotalCarrys}KK`, inline: true }
        ],
        rodape: 'Continue com o bom trabalho! 🎉'
      })
    } catch (error) {
      console.error(`Erro ao enviar notificação de pagamento para ${jogador.nick}:`, error)
    }
  }
}

// Notificar carry cancelado
export async function notificarCarryCancelado(pedido: {
  id: number
  nomeCliente: string
  dataAgendada?: string | null
  bosses: string[]
  valorTotal: number
  motivo?: string
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://hela-blond.vercel.app'
  
  const bossesTexto = pedido.bosses.map(boss => adicionarEmojiBoss(boss)).join(', ')

  const dataFormatada = pedido.dataAgendada
    ? new Date(pedido.dataAgendada).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Não agendado'

  const campos = [
    { nome: '👤 Cliente', valor: pedido.nomeCliente, inline: true },
    { nome: '💰 Valor', valor: `${pedido.valorTotal}KK`, inline: true },
    { nome: '🎯 Bosses', valor: bossesTexto, inline: false }
  ]

  if (pedido.dataAgendada) {
    campos.push({ nome: '📅 Estava agendado para', valor: dataFormatada, inline: false })
  }

  if (pedido.motivo) {
    campos.push({ nome: '📝 Motivo', valor: pedido.motivo, inline: false })
  }

  await enviarWebhookDiscord({
    titulo: '❌ Carry Cancelado',
    descricao: `O carry #${pedido.id} foi **CANCELADO**`,
    cor: 0xFF0000, // Vermelho
    campos,
    rodape: 'Sistema de Gestão Hela'
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
  imagemUrl?: string
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
    const embed: any = {
      title: conteudo.titulo,
      description: conteudo.descricao,
      color: conteudo.cor || 0xFFD700,
      fields: conteudo.campos || [],
      footer: conteudo.rodape ? { text: conteudo.rodape } : undefined,
      timestamp: new Date().toISOString()
    }

    if (conteudo.imagemUrl) {
      embed.thumbnail = { url: conteudo.imagemUrl }
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
  const baseUrl = process.env.NEXTAUTH_URL || 'https://hela-blond.vercel.app'
  
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

  const bossesTexto = pedido.bosses.map(boss => adicionarEmojiBoss(boss)).join('\n')

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
        { nome: '🎯 Bosses', valor: bossesTexto, inline: false },
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
    valorTotal: number
  }>
}>) {
  if (jogadores.length === 0) return

  // Agrupar todos os carries únicos (sem duplicar por jogador)
  const carrysPorData = new Map<string, Array<{
    id: number
    cliente: string
    bosses: string[]
    horario: string
    valorTotal: number
  }>>()

  // Coletar carries únicos (um carry por ID)
  const carrysUnicos = new Map<number, any>()
  jogadores.forEach(jogador => {
    jogador.carrys.forEach(carry => {
      if (!carrysUnicos.has(carry.id)) {
        carrysUnicos.set(carry.id, carry)
      }
    })
  })

  // Agrupar por data
  carrysUnicos.forEach(carry => {
    const data = carry.dataAgendada.split('T')[0]
    if (!carrysPorData.has(data)) {
      carrysPorData.set(data, [])
    }
    carrysPorData.get(data)!.push({
      id: carry.id,
      cliente: carry.nomeCliente,
      bosses: carry.bosses,
      horario: carry.horario,
      valorTotal: carry.valorTotal
    })
  })

  // Montar mensagem
  let descricao = '☀️ **Bom dia, equipe!** Temos carries agendados para hoje!\n\n'
  
  // Para cada data (no caso de hoje, só uma data)
  carrysPorData.forEach((carries, data) => {
    const numCarrys = carries.length
    const isAgrupado = numCarrys >= 2

    // Calcular valor total e divisão
    const valorTotal = carries.reduce((sum, c) => sum + c.valorTotal, 0)
    const numJogadores = isAgrupado ? 10 : 11 // 10 sem Pablo, 11 com Pablo
    const valorPorJogador = Math.floor(valorTotal / numJogadores)

    // Pegar o primeiro horário como referência (geralmente todos são iguais)
    const horarioPrincipal = carries[0].horario
    // Formatar horário (pode vir como "15:00:00" ou "15:00")
    const horarioFormatado = horarioPrincipal 
      ? horarioPrincipal.substring(0, 5) // Pegar apenas HH:MM
      : '21:00'

    if (isAgrupado) {
      // MODO AGRUPADO (2+ carrys)
      descricao += `🔥 **${numCarrys} CARRYS AGRUPADOS** 🔥\n`
      descricao += `📅 Data: ${new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')}\n`
      descricao += `⏰ **HORÁRIO DO CLEAR: ${horarioFormatado} (Brasília)** ⏰\n`
      descricao += `👥 **${numJogadores} jogadores** (SEM Pablo)\n`
      descricao += `💰 Valor total: **${(valorTotal / 1000).toFixed(1)}b** | **${valorPorJogador}kk/jogador**\n\n`
      
      descricao += `📋 **Clientes:**\n`
      carries.forEach((carry, index) => {
        descricao += `${index + 1}. **${carry.cliente}** - ${(carry.valorTotal / 1000).toFixed(1)}b\n`
      })
      descricao += `\n🎯 **Bosses:** ${carries[0].bosses.join(', ')}\n\n`
    } else {
      // MODO NORMAL (1 carry)
      const carry = carries[0]
      descricao += `🎮 **Carry:** ${carry.cliente}\n`
      descricao += `⏰ **HORÁRIO DO CLEAR: ${horarioFormatado} (Brasília)** ⏰\n`
      descricao += `💰 Valor: **${(carry.valorTotal / 1000).toFixed(1)}b** | **${valorPorJogador}kk/jogador**\n`
      descricao += `👥 **11 jogadores** (COM Pablo)\n`
      descricao += `🎯 ${carry.bosses.join(', ')}\n\n`
    }
  })

  // Coletar todos os jogadores únicos com Discord ID
  const jogadoresUnicos = new Set<string>()
  const jogadoresNicks = new Set<string>()
  jogadores.forEach(j => {
    if (j.discordId) jogadoresUnicos.add(j.discordId)
    jogadoresNicks.add(j.nick)
  })

  // Adicionar menções
  const mencoes = Array.from(jogadoresUnicos).map(id => `<@${id}>`).join(' ')
  descricao += `\n📢 **Atenção:** ${mencoes}\n`
  descricao += `\n📋 Total: **${Array.from(carrysPorData.values()).flat().length} carry(s)** | **${jogadoresNicks.size} jogador(es)** escalados\n`
  descricao += `🎮 Preparem-se! Boa sorte a todos!`

  // Enviar no canal
  await enviarWebhookDiscord({
    titulo: '🌅 Carries do Dia',
    descricao,
    cor: 0xFFD700,
    rodape: `${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}`
  })
}

