/**
 * Bot Discord para Carry Hela
 * 
 * Este bot gerencia tickets, confirmações de presença e notificações
 * para o sistema de carry.
 * 
 * Para rodar:
 * 1. npm install discord.js
 * 2. Configure DISCORD_BOT_TOKEN no .env
 * 3. node bot/discord-bot.js
 */

const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits
} = require('discord.js');

// Configuração
const API_BASE = process.env.API_BASE || 'https://helaturk.vercel.app/api';
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID; // ID do cargo de admin
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID; // ID da categoria de tickets

// Criar cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ]
});

// ============================================
// EMBEDS PRÉ-DEFINIDOS
// ============================================

const createWelcomeEmbed = () => {
  return new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🏰 BEM-VINDO AO CARRY HELA!')
    .setDescription(`
Somos especialistas em carrys dos bosses lendários do RagnaTales.

**🎯 O que oferecemos:**
• Carry bosses 1-6 + Hela
• Pacote completo com desconto
• Conquista "Sem Morrer"
• Horários flexíveis

**📌 Clique no botão abaixo para começar:**
    `)
    .setThumbnail('https://helaturk.vercel.app/images/bosses/hela.gif')
    .setFooter({ text: 'Hela Carrys • O melhor carry do RagnaTales' });
};

const createWelcomeButtons = () => {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('abrir_ticket')
        .setLabel('🎫 Abrir Ticket')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('ver_precos')
        .setLabel('💰 Ver Preços')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel('📅 Próximas Datas')
        .setStyle(ButtonStyle.Link)
        .setURL('https://helaturk.vercel.app/admin/calendario'),
      new ButtonBuilder()
        .setCustomId('faq')
        .setLabel('❓ FAQ')
        .setStyle(ButtonStyle.Secondary)
    );
};

// ============================================
// SISTEMA DE TICKETS
// ============================================

async function criarTicket(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;
  
  // Verificar se já tem ticket aberto
  const ticketExistente = guild.channels.cache.find(
    c => c.name === `ticket-${user.username.toLowerCase()}`
  );
  
  if (ticketExistente) {
    return interaction.reply({
      content: `❌ Você já tem um ticket aberto: ${ticketExistente}`,
      ephemeral: true
    });
  }
  
  // Criar canal do ticket
  const ticketChannel = await guild.channels.create({
    name: `ticket-${user.username}`,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY_ID,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      },
      {
        id: ADMIN_ROLE_ID,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageMessages
        ]
      }
    ]
  });
  
  // Mensagem inicial do ticket
  const ticketEmbed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('🎫 Ticket Aberto')
    .setDescription(`
👋 Olá ${user}! Obrigado por entrar em contato com o Carry Hela!

Por favor, selecione o que deseja:
    `)
    .setFooter({ text: `Ticket criado por ${user.username}` })
    .setTimestamp();
  
  const ticketButtons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('comprar_carry')
        .setLabel('💎 Comprar Carry')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('tirar_duvidas')
        .setLabel('📋 Tirar Dúvidas')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('agendar_horario')
        .setLabel('📅 Agendar Horário')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('fechar_ticket')
        .setLabel('❌ Fechar Ticket')
        .setStyle(ButtonStyle.Danger)
    );
  
  await ticketChannel.send({
    content: `${user} <@&${ADMIN_ROLE_ID}>`,
    embeds: [ticketEmbed],
    components: [ticketButtons]
  });
  
  await interaction.reply({
    content: `✅ Ticket criado: ${ticketChannel}`,
    ephemeral: true
  });
}

// ============================================
// SELEÇÃO DE BOSSES
// ============================================

async function mostrarBosses(interaction) {
  const bossEmbed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🎯 Selecione os Bosses')
    .setDescription('Clique nos bosses que deseja fazer:');
  
  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('boss_1')
        .setLabel('1️⃣ Freylith')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('boss_2')
        .setLabel('2️⃣ Tyrgrim')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('boss_3')
        .setLabel('3️⃣ Skollgrim')
        .setStyle(ButtonStyle.Secondary)
    );
  
  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('boss_4')
        .setLabel('4️⃣ Baldira')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('boss_5')
        .setLabel('5️⃣ Thorvald')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('boss_6')
        .setLabel('6️⃣ Glacius')
        .setStyle(ButtonStyle.Secondary)
    );
  
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('boss_hela')
        .setLabel('🔴 HELA')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('pacote_completo')
        .setLabel('📦 Pacote 1-6')
        .setStyle(ButtonStyle.Primary)
    );
  
  await interaction.reply({
    embeds: [bossEmbed],
    components: [row1, row2, row3]
  });
}

// ============================================
// CONFIRMAÇÃO DE PRESENÇA
// ============================================

async function enviarConfirmacaoPresenca(userId, pedidoId, data, bosses) {
  try {
    const user = await client.users.fetch(userId);
    
    const confirmEmbed = new EmbedBuilder()
      .setColor(0xF59E0B)
      .setTitle('⏰ CONFIRMAÇÃO DE PRESENÇA')
      .setDescription(`
Seu carry está agendado!

📅 **Data:** ${data}
🎯 **Bosses:** ${bosses.join(', ')}

⚠️ Por favor, confirme sua presença:
      `)
      .setFooter({ text: `Pedido #${pedidoId}` })
      .setTimestamp();
    
    const confirmButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirmar_${pedidoId}`)
          .setLabel('✅ Confirmo Presença')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`nao_posso_${pedidoId}`)
          .setLabel('❌ Não Poderei')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`reagendar_${pedidoId}`)
          .setLabel('📅 Reagendar')
          .setStyle(ButtonStyle.Secondary)
      );
    
    await user.send({
      embeds: [confirmEmbed],
      components: [confirmButtons]
    });
    
    console.log(`✅ Confirmação enviada para ${user.username}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar confirmação:`, error);
    return false;
  }
}

// ============================================
// CARRY GRÁTIS
// ============================================

async function mostrarCarryGratis(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x8B5CF6)
    .setTitle('🎁 CARRY GRÁTIS SEMANAL')
    .setDescription(`
Todo sábado sorteamos **4 jogadores** para fazer os bosses 1-6 **GRATUITAMENTE**!

**📋 Como participar:**
1️⃣ Clique no botão abaixo
2️⃣ Preencha seu nick do jogo
3️⃣ Aguarde o sorteio (domingo 20h)
4️⃣ Se sorteado, confirme em 24h

**🎯 Regras:**
• 1 inscrição por semana
• Deve confirmar presença
• Se não comparecer, perde a próxima
    `)
    .setFooter({ text: 'Hela Carrys • Apoiando novos jogadores' });
  
  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('inscrever_carry_gratis')
        .setLabel('🎲 QUERO PARTICIPAR!')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel('📊 Ver no Site')
        .setStyle(ButtonStyle.Link)
        .setURL('https://helaturk.vercel.app/carry-gratis')
    );
  
  await interaction.reply({
    embeds: [embed],
    components: [buttons]
  });
}

// Modal de inscrição
async function mostrarModalInscricao(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_inscricao')
    .setTitle('📝 Inscrição Carry Grátis');
  
  const nickInput = new TextInputBuilder()
    .setCustomId('nick_input')
    .setLabel('Seu nick no RagnaTales')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: SuperPlayer')
    .setRequired(true)
    .setMinLength(3)
    .setMaxLength(24);
  
  const row = new ActionRowBuilder().addComponents(nickInput);
  modal.addComponents(row);
  
  await interaction.showModal(modal);
}

// ============================================
// HANDLERS DE EVENTOS
// ============================================

client.on('ready', () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
});

client.on('interactionCreate', async (interaction) => {
  try {
    // Botões
    if (interaction.isButton()) {
      const { customId } = interaction;
      
      switch (customId) {
        case 'abrir_ticket':
          await criarTicket(interaction);
          break;
        
        case 'comprar_carry':
          await mostrarBosses(interaction);
          break;
        
        case 'fechar_ticket':
          await interaction.channel.delete();
          break;
        
        case 'inscrever_carry_gratis':
          await mostrarModalInscricao(interaction);
          break;
        
        case 'ver_precos':
          await interaction.reply({
            content: '💰 Confira nossa tabela de preços: https://helaturk.vercel.app',
            ephemeral: true
          });
          break;
        
        case 'faq':
          await interaction.reply({
            content: `
**❓ FAQ - Perguntas Frequentes**

**Como funciona o carry?**
Você entra no grupo conosco e fazemos os bosses. Você fica seguro e recebe as recompensas!

**Quanto custa?**
Valores variam por boss. Entre em contato para orçamento.

**Preciso ter level/equip?**
Não! Fazemos carry de qualquer personagem.

**Quanto tempo demora?**
Em média 30-60 minutos dependendo dos bosses.
            `,
            ephemeral: true
          });
          break;
        
        // Confirmações
        default:
          if (customId.startsWith('confirmar_')) {
            const pedidoId = customId.replace('confirmar_', '');
            await interaction.reply({
              content: '✅ Presença confirmada! Vemos você no horário.',
              ephemeral: true
            });
            // TODO: Chamar API para atualizar status
          }
          
          if (customId.startsWith('nao_posso_')) {
            const pedidoId = customId.replace('nao_posso_', '');
            await interaction.reply({
              content: '❌ Que pena! Entraremos em contato para reagendar.',
              ephemeral: true
            });
            // TODO: Chamar API para atualizar status
          }
      }
    }
    
    // Modals
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'modal_inscricao') {
        const nick = interaction.fields.getTextInputValue('nick_input');
        
        // Chamar API para inscrever
        try {
          const res = await fetch(`${API_BASE}/carry-gratis/inscrever`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              discordId: interaction.user.id,
              discordName: interaction.user.username,
              nickIngame: nick,
              semana: getProximaSegunda().toISOString()
            })
          });
          
          if (res.ok) {
            await interaction.reply({
              content: `✅ Inscrição confirmada!\n\n🎮 Nick: **${nick}**\n📅 Sorteio: Domingo às 20h\n\nBoa sorte! 🍀`,
              ephemeral: true
            });
          } else {
            const data = await res.json();
            await interaction.reply({
              content: `❌ ${data.error || 'Erro ao inscrever'}`,
              ephemeral: true
            });
          }
        } catch (error) {
          await interaction.reply({
            content: '❌ Erro de conexão. Tente novamente.',
            ephemeral: true
          });
        }
      }
    }
  } catch (error) {
    console.error('Erro no handler:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '❌ Ocorreu um erro. Tente novamente.',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: '❌ Ocorreu um erro. Tente novamente.',
        ephemeral: true
      });
    }
  }
});

// ============================================
// UTILITÁRIOS
// ============================================

function getProximaSegunda() {
  const hoje = new Date();
  const dia = hoje.getDay();
  const diff = dia === 0 ? 1 : 8 - dia;
  const proxima = new Date(hoje);
  proxima.setDate(hoje.getDate() + diff);
  proxima.setHours(0, 0, 0, 0);
  return proxima;
}

// ============================================
// COMANDO PARA SETUP INICIAL
// ============================================

// Comando: !setup-ticket
// Envia a mensagem de boas-vindas no canal
client.on('messageCreate', async (message) => {
  if (message.content === '!setup-ticket' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await message.delete();
    await message.channel.send({
      embeds: [createWelcomeEmbed()],
      components: [createWelcomeButtons()]
    });
    console.log('✅ Mensagem de boas-vindas enviada');
  }
  
  if (message.content === '!setup-carrygratis' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await message.delete();
    
    const embed = new EmbedBuilder()
      .setColor(0x8B5CF6)
      .setTitle('🎁 CARRY GRÁTIS SEMANAL')
      .setDescription(`
Todo sábado sorteamos **4 jogadores** para fazer os bosses 1-6 **GRATUITAMENTE**!

**📋 Como participar:**
1️⃣ Clique no botão abaixo
2️⃣ Preencha seu nick do jogo
3️⃣ Aguarde o sorteio (domingo 20h)
4️⃣ Se sorteado, confirme em 24h

**🎯 Regras:**
• 1 inscrição por semana
• Deve confirmar presença
• Se não comparecer, perde a próxima
      `)
      .setImage('https://helaturk.vercel.app/images/bosses/hela.gif')
      .setFooter({ text: 'Hela Carrys • Apoiando novos jogadores' });
    
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('inscrever_carry_gratis')
          .setLabel('🎲 QUERO PARTICIPAR!')
          .setStyle(ButtonStyle.Primary)
      );
    
    await message.channel.send({
      embeds: [embed],
      components: [buttons]
    });
    console.log('✅ Mensagem de carry grátis enviada');
  }
});

// ============================================
// INICIAR BOT
// ============================================

const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN não configurado!');
  console.log('Configure a variável de ambiente DISCORD_BOT_TOKEN');
  process.exit(1);
}

client.login(TOKEN).catch(error => {
  console.error('❌ Erro ao conectar:', error);
  process.exit(1);
});

// Export para uso em outros módulos
module.exports = {
  client,
  enviarConfirmacaoPresenca
};

