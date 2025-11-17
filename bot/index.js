require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping
  ],
  partials: [
    Partials.Channel,
    Partials.Message
  ]
});

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

client.on('ready', () => {
  console.log(`🤖 Seu Raimundo conectado como ${client.user.tag}`);
  console.log(`📊 ID do Bot: ${client.user.id}`);
  console.log(`🔧 Intents configurados: ${client.options.intents.bitfield}`);
  console.log(`✅ Bot está pronto e aguardando mensagens...`);
  client.user.setActivity('Use !carry para informações', { type: 'PLAYING' });
});

client.on('messageCreate', async (message) => {
  console.log(`\n🔔 EVENTO messageCreate DISPARADO!`);
  console.log(`📝 Autor: ${message.author.tag} (ID: ${message.author.id})`);
  console.log(`🤖 É bot?: ${message.author.bot}`);
  console.log(`💬 Conteúdo: "${message.content}"`);
  console.log(`📍 Canal: ${message.channel.type} (ID: ${message.channelId})`);
  
  // Ignorar bots
  if (message.author.bot) {
    console.log(`❌ Ignorando bot`);
    return;
  }

  console.log(`📩 Mensagem recebida de ${message.author.username}: "${message.content}"`);

  const userId = message.author.id;
  const username = message.author.username;
  const content = message.content.toLowerCase().trim();

  console.log(`🔍 Processando comando: "${content}"`);

  // Registrar lead (não bloquear o bot se falhar)
  registrarLead(userId, username, message.content).catch(err => {
    console.error('Erro ao registrar lead (não crítico):', err.message);
  });

  // Comando: !carry
  if (content === '!carry' || content === '!comprar') {
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🛒 Carrys Disponíveis - Time Hela')
      .setDescription('**Oferecemos carrys profissionais com total segurança!**\n\n' +
        '✅ Hela (Tormenta Deusa)\n' +
        '✅ Freylith, Tyrgrim, Skollgrim\n' +
        '✅ Baldira, Thorvald, Glacius\n' +
        '✅ Pacote completo 1-6 com desconto especial!\n\n' +
        '🎁 **Benefícios:**\n' +
        '• Godly + Força Heróica\n' +
        '• Visual Exclusivo\n' +
        '• Conquistas disponíveis\n' +
        '• Pacotes com desconto')
      .addFields(
        { 
          name: '💬 Como Comprar?', 
          value: 'Para consultar **preços** e fazer seu pedido, entre em contato com:\n\n' +
                 '<@614167750457163796> ou <@116981167101575171>\n\n' +
                 '🔒 Preços exclusivos • Atendimento personalizado'
        }
      )
      .setFooter({ text: '🔥 Time Hela - Carrys Profissionais' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
    return;
  }

  // Comando: !historico
  if (content === '!historico') {
    await mostrarHistorico(message);
    return;
  }

  // Comando: !status
  if (content === '!status') {
    await mostrarStatus(message);
    return;
  }

  // Mensagem de boas-vindas / ajuda
  if (content.includes('oi') || content.includes('olá') || content.includes('ola') || 
      content.includes('hey') || content.includes('e ai') || content.includes('bom dia') || 
      content.includes('boa tarde') || content.includes('boa noite') || 
      content === '!' || content === '!help' || content === '!ajuda') {
    
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('👋 Bem-vindo ao Seu Raimundo!')
      .setDescription('**Sou o bot oficial de informações de carrys da Time Hela!**\n\nEstou aqui para te ajudar a garantir seus itens Godly e visuais exclusivos! 🎮✨')
      .addFields(
        { 
          name: '🛒 Comandos Disponíveis:', 
          value: '`!carry` - Informações sobre carrys disponíveis\n`!historico` - Ver suas compras anteriores\n`!status` - Verificar status de um pedido' 
        },
        { 
          name: '💰 Bosses Disponíveis:', 
          value: '**1-6 (Completo):** Freylith, Tyrgrim, Skollgrim, Baldira, Thorvald, Glacius\n**Hela:** Tormenta Deusa' 
        },
        { 
          name: '💬 Como Comprar?', 
          value: 'Para consultar preços e fazer pedido, fale com:\n<@614167750457163796> ou <@116981167101575171>' 
        },
        { 
          name: '⚡ Como começar?', 
          value: '**Digite `!carry` para ver informações detalhadas!**' 
        }
      )
      .setFooter({ text: '🔥 Time Hela - Carrys Profissionais' })
      .setTimestamp();

    await message.reply({ embeds: [welcomeEmbed] });
    return;
  }

  // Se não for nenhum comando reconhecido, dar dica
  if (content.startsWith('!')) {
    await message.reply('❓ Comando não reconhecido. Digite `!carry` para informações ou `!ajuda` para ver todos os comandos.');
  }
});

// Função para registrar leads
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

// Função para mostrar histórico
async function mostrarHistorico(message) {
  const userId = message.author.id;
  
  try {
    const response = await fetch(`${API_URL}/clientes?discordUserId=${userId}`);
    
    if (response.ok) {
      const cliente = await response.json();
      
      if (!cliente || cliente.totalCompras === 0) {
        await message.reply('📊 Você ainda não tem compras registradas. Entre em contato com <@614167750457163796> ou <@116981167101575171> para fazer seu primeiro pedido!');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('📊 Seu Histórico de Compras')
        .addFields(
          { name: '🛒 Total de Compras', value: `${cliente.totalCompras}`, inline: true },
          { name: '💎 Tier', value: `${cliente.tier}`, inline: true },
          { name: '📅 Primeira Compra', value: new Date(cliente.primeiraCompra).toLocaleDateString('pt-BR'), inline: true }
        )
        .setFooter({ text: 'Obrigado por confiar na Time Hela!' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } else {
      await message.reply('📊 Você ainda não tem compras registradas. Entre em contato com <@614167750457163796> ou <@116981167101575171> para fazer seu primeiro pedido!');
    }
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    await message.reply('❌ Erro ao buscar histórico. Tente novamente mais tarde.');
  }
}

// Função para mostrar status
async function mostrarStatus(message) {
  const userId = message.author.id;
  
  try {
    const response = await fetch(`${API_URL}/leads/${userId}`);
    
    if (response.ok) {
      const lead = await response.json();
      
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('📋 Status do Pedido')
        .setDescription(`**Status:** ${lead.status}\n\n💬 Para mais informações: <@614167750457163796> ou <@116981167101575171>`)
        .addFields(
          { name: '👤 Seu Discord', value: lead.discordUsername, inline: true }
        )
        .setFooter({ text: 'Clique nos nomes acima para enviar DM' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } else {
      await message.reply('📋 Nenhum pedido encontrado. Entre em contato com <@614167750457163796> ou <@116981167101575171> para fazer um pedido!');
    }
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    await message.reply('❌ Erro ao buscar status. Tente novamente mais tarde.');
  }
}

// Login
client.login(process.env.DISCORD_BOT_TOKEN);
