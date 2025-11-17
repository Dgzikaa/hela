require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// Base URL da API
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Storage temporário de sessões (em produção, usar Redis)
const sessions = new Map();

// Bosses com preços
const BOSSES = [
  { id: 1, nome: 'Freylith', preco: 70, ordem: 1 },
  { id: 2, nome: 'Tyrgrim', preco: 100, ordem: 2 },
  { id: 3, nome: 'Skollgrim', preco: 130, ordem: 3 },
  { id: 4, nome: 'Baldira', preco: 150, ordem: 4 },
  { id: 5, nome: 'Thorvald', preco: 230, ordem: 5 },
  { id: 6, nome: 'Glacius', preco: 300, ordem: 6 }
];

client.on('ready', () => {
  console.log(`🤖 Seu Raimundo conectado como ${client.user.tag}`);
  client.user.setActivity('Vendendo carrys! Use !carry', { type: 'PLAYING' });
});

client.on('messageCreate', async (message) => {
  // Ignorar bots
  if (message.author.bot) return;

  const userId = message.author.id;
  const username = message.author.username;

  // Registrar lead
  await registrarLead(userId, username, message.content);

  // Comando: !carry
  if (message.content.toLowerCase() === '!carry') {
    await iniciarCompra(message);
  }

  // Comando: !historico
  if (message.content.toLowerCase() === '!historico') {
    await mostrarHistorico(message);
  }

  // Comando: !status
  if (message.content.toLowerCase() === '!status') {
    await mostrarStatus(message);
  }

  // Comando: !cancelar
  if (message.content.toLowerCase() === '!cancelar') {
    sessions.delete(userId);
    await message.reply('❌ Compra cancelada. Digite `!carry` para começar novamente.');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  const userId = interaction.user.id;
  const session = sessions.get(userId) || {};

  try {
    if (interaction.customId === 'select_bosses') {
      // Usuário selecionou bosses
      const selectedValues = interaction.values;
      session.bosses = selectedValues.map(v => parseInt(v));
      session.step = 'confirm';
      sessions.set(userId, session);

      await mostrarResumo(interaction, session);
    }

    if (interaction.customId === 'add_conquista') {
      session.conquistaSemMorrer = true;
      sessions.set(userId, session);
      await interaction.update({ content: '✅ Conquista "Sem Morrer" adicionada!' });
      setTimeout(() => mostrarResumo(interaction, session), 1000);
    }

    if (interaction.customId === 'confirmar_compra') {
      await finalizarCompra(interaction, session);
    }

    if (interaction.customId === 'cancelar_compra') {
      sessions.delete(userId);
      await interaction.update({ 
        content: '❌ Compra cancelada. Digite `!carry` para começar novamente.', 
        components: [] 
      });
    }
  } catch (error) {
    console.error('Erro na interação:', error);
    await interaction.reply({ content: '❌ Ocorreu um erro. Tente novamente.', ephemeral: true });
  }
});

async function iniciarCompra(message) {
  const userId = message.author.id;
  const username = message.author.username;

  // Buscar/Criar cliente
  let cliente = await buscarOuCriarCliente(userId, username);
  
  // Criar sessão
  sessions.set(userId, {
    step: 'select_bosses',
    bosses: [],
    conquistaSemMorrer: false,
    userId,
    username,
    cliente
  });

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🎮 Seu Raimundo - Carrys de Ragnatales')
    .setDescription('Olá! Sou o Seu Raimundo, seu vendedor de carrys! 😄\nSelecione os bosses que deseja comprar:')
    .addFields(
      { name: '1️⃣ Freylith', value: '70KK', inline: true },
      { name: '2️⃣ Tyrgrim', value: '100KK', inline: true },
      { name: '3️⃣ Skollgrim', value: '130KK', inline: true },
      { name: '4️⃣ Baldira', value: '150KK', inline: true },
      { name: '5️⃣ Thorvald', value: '230KK', inline: true },
      { name: '6️⃣ Glacius', value: '300KK', inline: true },
      { name: '📦 Pacote Completo (1-6)', value: '**500KK** + Conquista Sem Morrer GRÁTIS! 🎁', inline: false }
    )
    .setFooter({ text: '✨ Selecione abaixo e garanta seu carry! ⬇️' });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_bosses')
    .setPlaceholder('Escolha os bosses...')
    .setMinValues(1)
    .setMaxValues(6)
    .addOptions([
      { label: 'Freylith (70KK)', value: '1', emoji: '1️⃣' },
      { label: 'Tyrgrim (100KK)', value: '2', emoji: '2️⃣' },
      { label: 'Skollgrim (130KK)', value: '3', emoji: '3️⃣' },
      { label: 'Baldira (150KK)', value: '4', emoji: '4️⃣' },
      { label: 'Thorvald (230KK)', value: '5', emoji: '5️⃣' },
      { label: 'Glacius (300KK)', value: '6', emoji: '6️⃣' }
    ]);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await message.reply({ embeds: [embed], components: [row] });
}

async function mostrarResumo(interaction, session) {
  const { bosses, conquistaSemMorrer, cliente } = session;

  // Calcular valores
  let total = 0;
  const bossesNomes = [];
  
  bosses.forEach(id => {
    const boss = BOSSES.find(b => b.id === id);
    if (boss) {
      total += boss.preco;
      bossesNomes.push(boss.nome);
    }
  });

  // Verificar pacote completo
  const pacoteCompleto = bosses.length === 6 && bosses.every(id => id >= 1 && id <= 6);
  
  if (pacoteCompleto) {
    total = 500;
    session.conquistaSemMorrer = true; // Brinde!
  } else if (conquistaSemMorrer) {
    total += 150;
  }

  // Aplicar desconto por fidelidade
  let desconto = 0;
  let descontoTipo = null;
  
  if (cliente.totalCompras === 0) {
    // Primeira compra: 5% de desconto
    desconto = total * 0.05;
    descontoTipo = 'PRIMEIRA_COMPRA';
  } else if (cliente.tier === 'DIAMANTE') {
    desconto = total * 0.20; // 20% desconto
    descontoTipo = 'FIDELIDADE';
  } else if (cliente.tier === 'PLATINA') {
    desconto = total * 0.15; // 15% desconto
    descontoTipo = 'FIDELIDADE';
  } else if (cliente.tier === 'OURO') {
    desconto = total * 0.10; // 10% desconto
    descontoTipo = 'FIDELIDADE';
  } else if (cliente.tier === 'PRATA') {
    desconto = total * 0.05; // 5% desconto
    descontoTipo = 'FIDELIDADE';
  }

  const totalComDesconto = total - desconto;
  session.desconto = desconto;
  session.descontoTipo = descontoTipo;
  session.totalOriginal = total;
  session.totalFinal = totalComDesconto;

  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('📋 Resumo do Pedido')
    .setDescription(`**Bosses selecionados:**\n${bossesNomes.map(n => `• ${n}`).join('\n')}`)
    .addFields(
      { name: '📦 Bosses', value: `${bosses.length}`, inline: true },
      { name: '👑 Tier', value: getTierIcon(cliente.tier), inline: true },
      { name: '🛒 Compras', value: `${cliente.totalCompras}`, inline: true }
    )
    .setFooter({ text: 'Confirme ou adicione extras' });

  if (desconto > 0) {
    embed.addFields(
      { name: '💵 Valor Original', value: `~~${total}KK~~`, inline: true },
      { name: '🎉 Desconto', value: `-${desconto.toFixed(0)}KK (${descontoTipo === 'PRIMEIRA_COMPRA' ? '🎁 Primeira Compra!' : `Fidelidade ${cliente.tier}`})`, inline: true },
      { name: '💰 Valor Final', value: `**${totalComDesconto.toFixed(0)}KK**`, inline: true }
    );
  } else {
    embed.addFields({ name: '💰 Valor Total', value: `**${total}KK**`, inline: true });
  }

  if (pacoteCompleto) {
    embed.addFields({ 
      name: '🎁 Bônus', 
      value: 'Pacote Completo! Conquista Sem Morrer GRÁTIS!', 
      inline: false 
    });
  } else if (conquistaSemMorrer) {
    embed.addFields({ 
      name: '⭐ Extra', 
      value: 'Conquista: Sem Morrer (+150KK)', 
      inline: false 
    });
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('confirmar_compra')
      .setLabel('✅ Confirmar Compra')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('cancelar_compra')
      .setLabel('❌ Cancelar')
      .setStyle(ButtonStyle.Danger)
  );

  if (!conquistaSemMorrer && !pacoteCompleto) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('add_conquista')
        .setLabel('⭐ Adicionar Conquista Sem Morrer')
        .setStyle(ButtonStyle.Primary)
    );
  }

  await interaction.update({ embeds: [embed], components: [row] });
}

async function finalizarCompra(interaction, session) {
  await interaction.deferUpdate();

  const { bosses, conquistaSemMorrer, username, cliente, totalFinal, desconto, descontoTipo } = session;

  // Calcular valores
  let total = 0;
  bosses.forEach(id => {
    const boss = BOSSES.find(b => b.id === id);
    if (boss) total += boss.preco;
  });

  const pacoteCompleto = bosses.length === 6;
  if (pacoteCompleto) {
    total = 500;
  } else if (conquistaSemMorrer) {
    total += 150;
  }

  try {
    // Enviar para API
    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteId: cliente.id,
        nomeCliente: username,
        contatoCliente: `Discord: ${interaction.user.tag}`,
        bosses: bosses,
        conquistaSemMorrer: pacoteCompleto || conquistaSemMorrer,
        pacoteCompleto,
        valorTotal: totalFinal || total,
        desconto: desconto || 0,
        descontoTipo: descontoTipo,
        origem: 'DISCORD',
        observacoes: `Pedido via bot Discord - User ID: ${interaction.user.id} - Tier: ${cliente.tier}`
      })
    });

    if (response.ok) {
      const pedido = await response.json();

      // Notificar Dgzika
      await notificarAdmin(interaction, pedido);

      // Limpar sessão
      sessions.delete(interaction.user.id);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Pedido Confirmado!')
        .setDescription('Seu pedido foi registrado com sucesso!\n\n**Muito obrigado pela preferência!** 😄')
        .addFields(
          { name: '🆔 Número do Pedido', value: `#${pedido.id}`, inline: true },
          { name: '💰 Valor', value: `${total}KK`, inline: true },
          { name: '📞 Próximos Passos', value: 'Aguarde nosso contato para agendamento do carry!', inline: false }
        )
        .setFooter({ text: 'Seu Raimundo agradece! Volte sempre! 🎮' });

      await interaction.editReply({ embeds: [embed], components: [] });
    } else {
      throw new Error('Erro ao criar pedido');
    }
  } catch (error) {
    console.error('Erro ao finalizar compra:', error);
    
    const errorEmbed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('❌ Erro')
      .setDescription('Ocorreu um erro ao processar seu pedido. Por favor, tente novamente ou entre em contato com o suporte.');

    await interaction.editReply({ embeds: [errorEmbed], components: [] });
  }
}

async function notificarAdmin(interaction, pedido) {
  try {
    // ID do canal ou usuário para notificar (configurar no .env)
    const NOTIFICATION_CHANNEL_ID = process.env.DISCORD_NOTIFICATION_CHANNEL;
    const ADMIN_USER_ID = process.env.DISCORD_ADMIN_USER_ID;
    
    if (!NOTIFICATION_CHANNEL_ID) {
      console.warn('⚠️ DISCORD_NOTIFICATION_CHANNEL não configurado no .env');
      return;
    }

    const channel = await client.channels.fetch(NOTIFICATION_CHANNEL_ID);
    
    const embed = new EmbedBuilder()
      .setColor('#ffa500')
      .setTitle('🔔 Novo Pedido de Carry!')
      .setDescription(`**Cliente:** ${interaction.user.tag}`)
      .addFields(
        { name: '🆔 Pedido', value: `#${pedido.id}`, inline: true },
        { name: '💰 Valor', value: `${pedido.valorTotal}KK`, inline: true },
        { name: '📦 Bosses', value: `${pedido.itens.length}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Verifique o painel admin em https://hela-blond.vercel.app/admin' });

    // Menção ao admin (se configurado)
    const content = ADMIN_USER_ID ? `<@${ADMIN_USER_ID}>` : '@here';

    await channel.send({ 
      content,
      embeds: [embed] 
    });
  } catch (error) {
    console.error('Erro ao notificar admin:', error);
  }
}

async function registrarLead(userId, username, mensagem) {
  try {
    await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordUserId: userId,
        discordUsername: username,
        mensagem
      })
    });
  } catch (error) {
    console.error('Erro ao registrar lead:', error);
  }
}

async function mostrarStatus(message) {
  const userId = message.author.id;
  
  try {
    const response = await fetch(`${API_URL}/leads/${userId}`);
    
    if (response.ok) {
      const lead = await response.json();
      
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📊 Seu Status')
        .addFields(
          { name: 'Status', value: lead.status, inline: true },
          { name: 'Última Interação', value: new Date(lead.ultimaInteracao).toLocaleString('pt-BR'), inline: true }
        );

      await message.reply({ embeds: [embed] });
    } else {
      await message.reply('Você ainda não iniciou nenhuma compra. Digite `!carry` para começar!');
    }
  } catch (error) {
    await message.reply('Erro ao buscar status.');
  }
}

async function mostrarHistorico(message) {
  const userId = message.author.id;
  
  try {
    const response = await fetch(`${API_URL}/clientes?discordUserId=${userId}`);
    
    if (response.ok) {
      const cliente = await response.json();
      
      if (!cliente) {
        await message.reply('Você ainda não fez nenhuma compra. Digite `!carry` para começar!');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle(`${getTierIcon(cliente.tier)} Histórico de ${cliente.discordUsername}`)
        .setDescription(`**Tier:** ${cliente.tier}\n**Total de Compras:** ${cliente.totalCompras}\n**Total Gasto:** ${cliente.totalGasto}KK`)
        .addFields(
          { name: '🎯 Primeira Compra', value: cliente.primeiraCompra ? new Date(cliente.primeiraCompra).toLocaleDateString('pt-BR') : 'N/A', inline: true },
          { name: '📅 Última Compra', value: cliente.ultimaCompra ? new Date(cliente.ultimaCompra).toLocaleDateString('pt-BR') : 'N/A', inline: true }
        );

      // Adicionar últimas compras
      if (cliente.pedidos && cliente.pedidos.length > 0) {
        const ultimosCarrys = cliente.pedidos
          .slice(0, 5)
          .map(p => {
            const bosses = p.itens.map(i => i.boss.nome).join(', ');
            const data = new Date(p.createdAt).toLocaleDateString('pt-BR');
            return `• **${data}** - ${bosses} (${p.valorTotal}KK) - ${p.status}`;
          })
          .join('\n');

        embed.addFields({ name: '📜 Últimos Carrys', value: ultimosCarrys, inline: false });
      }

      // Mostrar desconto disponível
      let proximoDesconto = '5% (Bronze)';
      if (cliente.tier === 'PRATA') proximoDesconto = '5%';
      else if (cliente.tier === 'OURO') proximoDesconto = '10%';
      else if (cliente.tier === 'PLATINA') proximoDesconto = '15%';
      else if (cliente.tier === 'DIAMANTE') proximoDesconto = '20%';

      embed.addFields({ 
        name: '🎁 Seu Desconto Atual', 
        value: `${proximoDesconto} em todas as compras!`, 
        inline: false 
      });

      await message.reply({ embeds: [embed] });
    } else {
      await message.reply('Você ainda não fez nenhuma compra. Digite `!carry` para começar!');
    }
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    await message.reply('Erro ao buscar histórico.');
  }
}

async function buscarOuCriarCliente(userId, username) {
  try {
    let response = await fetch(`${API_URL}/clientes?discordUserId=${userId}`);
    
    if (response.ok) {
      let cliente = await response.json();
      if (cliente) return cliente;
    }

    // Criar novo cliente
    response = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordUserId: userId, discordUsername: username })
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Erro ao buscar/criar cliente:', error);
  }

  // Fallback
  return {
    id: 0,
    discordUserId: userId,
    discordUsername: username,
    totalCompras: 0,
    totalGasto: 0,
    tier: 'BRONZE'
  };
}

function getTierIcon(tier) {
  const icons = {
    BRONZE: '🥉 Bronze',
    PRATA: '🥈 Prata',
    OURO: '🥇 Ouro',
    PLATINA: '💎 Platina',
    DIAMANTE: '💠 Diamante'
  };
  return icons[tier] || tier;
}

// Iniciar bot
const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN não configurado no .env!');
  process.exit(1);
}

client.login(TOKEN);

