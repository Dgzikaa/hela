# 🏰 Discord "Carry Hela" - Estrutura Completa

Este documento descreve a estrutura ideal do servidor Discord "Carry Hela" para atendimento profissional de clientes.

## 📋 Estrutura de Canais

```
🏰 CARRY HELA
│
├── 📢 INFORMAÇÕES
│   ├── #📜-regras
│   ├── #💰-tabela-precos
│   ├── #📅-proximas-datas
│   ├── #❓-faq
│   └── #📣-anuncios
│
├── 🎫 ATENDIMENTO
│   ├── #📩-abrir-ticket
│   └── [Tickets privados criados automaticamente]
│
├── 🎁 CARRY GRÁTIS
│   ├── #📝-como-participar
│   ├── #🎲-sorteios
│   └── #🏆-ganhadores
│
├── 💬 COMUNIDADE
│   ├── #🗣️-bate-papo
│   ├── #📸-prints-carrys
│   └── #💡-sugestoes
│
└── 👑 STAFF (oculto)
    ├── #📊-dashboard
    ├── #💼-tickets-pendentes
    └── #⚙️-comandos
```

## 🤖 Bot de Tickets - Funcionalidades

### Mensagem de Boas-Vindas (#📩-abrir-ticket)

```
╔══════════════════════════════════════════╗
║     🏰 BEM-VINDO AO CARRY HELA!          ║
╠══════════════════════════════════════════╣
║                                          ║
║  Somos especialistas em carrys dos       ║
║  bosses lendários do RagnaTales.         ║
║                                          ║
║  🎯 O que oferecemos:                    ║
║  • Carry bosses 1-6 + Hela               ║
║  • Pacote completo com desconto          ║
║  • Conquista "Sem Morrer"                ║
║  • Horários flexíveis                    ║
║                                          ║
║  📌 Clique no botão abaixo para:         ║
║                                          ║
╚══════════════════════════════════════════╝

[🎫 Abrir Ticket] [💰 Ver Preços] [📅 Próximas Datas] [❓ FAQ]
```

### Fluxo do Ticket

1. **Usuário clica em "Abrir Ticket"**
   - Cria canal privado: `ticket-usuario-1234`
   - Apenas o usuário e admins podem ver

2. **Mensagem automática no ticket:**
```
👋 Olá! Obrigado por entrar em contato com o Carry Hela!

Por favor, selecione o que deseja:

[💎 Comprar Carry] [📋 Tirar Dúvidas] [📅 Agendar Horário] [❌ Cancelar Vaga]
```

3. **Se "Comprar Carry":**
```
🎯 Ótimo! Qual(is) boss(es) você deseja?

[1️⃣ Freylith] [2️⃣ Tyrgrim] [3️⃣ Skollgrim]
[4️⃣ Baldira] [5️⃣ Thorvald] [6️⃣ Glacius]
[🔴 HELA]
[📦 Pacote Completo 1-6]
```

4. **Após seleção:**
```
📊 Resumo do seu pedido:

Boss(es): Baldira, Thorvald, Glacius
Valor: 450KK

📅 Próximas datas disponíveis:
• Sábado, 21/12 às 21:00 (2 vagas)
• Domingo, 22/12 às 20:00 (4 vagas)

[✅ Confirmar Agendamento] [📅 Outra Data] [❌ Cancelar]
```

5. **Confirmação final:**
```
✅ Agendamento confirmado!

📋 Detalhes:
• Bosses: Baldira, Thorvald, Glacius
• Data: Sábado, 21/12 às 21:00
• Valor: 450KK

⚠️ Importante:
• Esteja online 10 min antes
• Tenha o zeny separado
• Adicione @supaturk no jogo

Um admin irá confirmar em breve!

[📩 Enviar Mensagem] [❌ Fechar Ticket]
```

## 🔔 Notificações Automáticas

### 1. Lembrete 24h antes do Carry
```
⏰ LEMBRETE DE CARRY

Olá @usuario!

Seu carry está agendado para AMANHÃ:

📅 Sábado, 21/12 às 21:00
🎯 Bosses: Baldira, Thorvald, Glacius
💰 Valor: 450KK

⚠️ Por favor, confirme sua presença:

[✅ Confirmo] [❌ Não poderei] [📅 Reagendar]
```

### 2. Lembrete 1h antes
```
🔔 CARRY EM 1 HORA!

@usuario, seu carry começa em 1 hora!

📍 Ponto de encontro: Prontera (150, 180)
👤 Carry: @supaturk

Certifique-se de:
✓ Estar online
✓ Ter o zeny separado
✓ Estar com HP/SP full

[✅ Estou pronto!]
```

### 3. Pós-carry
```
🎉 CARRY CONCLUÍDO!

Parabéns @usuario! Você completou:
✅ Baldira
✅ Thorvald
✅ Glacius

🎁 Recompensas:
• Godly ingredients
• Força Heróica
• Conquistas

📸 Compartilhe seu print em #prints-carrys!

Como foi sua experiência?
[⭐⭐⭐⭐⭐] [⭐⭐⭐⭐] [⭐⭐⭐]
```

## 📅 Canal #proximas-datas (Atualização Automática)

```
📅 PRÓXIMOS CARRYS DISPONÍVEIS
Atualizado: 16/12/2024 às 14:30

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗓️ SÁBADO, 21/12
├── 🕘 21:00 - 2/4 vagas
└── 🕙 22:30 - 4/4 vagas ✅ LOTADO

🗓️ DOMINGO, 22/12
├── 🕖 19:00 - 4/4 vagas
└── 🕘 21:00 - 3/4 vagas

🗓️ SEGUNDA, 23/12
└── 🕙 20:30 - 4/4 vagas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Para agendar, abra um ticket em #abrir-ticket
```

## 🎁 Canal #como-participar (Carry Grátis)

```
🎁 CARRY GRÁTIS SEMANAL

Todo sábado sorteamos 4 jogadores para fazer
os bosses 1-6 GRATUITAMENTE!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMO PARTICIPAR:

1️⃣ Clique no botão abaixo
2️⃣ Preencha seu nick do jogo
3️⃣ Aguarde o sorteio (domingo 20h)
4️⃣ Se sorteado, confirme em 24h

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 REGRAS:
• 1 inscrição por semana
• Deve confirmar presença
• Se não comparecer, perde a próxima

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 INSCRITOS ESTA SEMANA: 45

[🎲 QUERO PARTICIPAR!]
```

## 👑 Comandos para Admins

```
/ticket-fechar - Fecha o ticket atual
/ticket-adicionar @user - Adiciona usuário ao ticket
/carry-agendar @user [data] [bosses] - Agenda carry
/carry-cancelar [id] - Cancela carry
/carry-concluir [id] - Marca como concluído
/sortear - Realiza sorteio do carry grátis
/sync-datas - Sincroniza datas com o site
/notificar-todos - Envia lembrete para todos agendados
```

## 🔗 Integração com o Site

O bot deve se integrar com a API do site:

```javascript
// Exemplo de integração
const API_BASE = 'https://hela-blond.vercel.app/api'

// Criar pedido via Discord
async function criarPedidoDiscord(userId, bosses, data) {
  const res = await fetch(`${API_BASE}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origem: 'DISCORD',
      discordUserId: userId,
      bosses,
      dataAgendada: data
    })
  })
  return res.json()
}

// Inscrever no carry grátis
async function inscreverCarryGratis(userId, username, nick) {
  const res = await fetch(`${API_BASE}/carry-gratis/inscrever`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      discordId: userId,
      discordName: username,
      nickIngame: nick
    })
  })
  return res.json()
}
```

## 🎨 Personalização Visual

### Cores do Embed
- **Sucesso:** `#10B981` (verde)
- **Erro:** `#EF4444` (vermelho)
- **Info:** `#3B82F6` (azul)
- **Alerta:** `#F59E0B` (amarelo)
- **Especial:** `#8B5CF6` (roxo)
- **Hela:** `#FFD700` (dourado)

### Emojis Padrão
- ✅ Confirmado
- ❌ Cancelado
- ⏰ Aguardando
- 🎯 Boss
- 💰 Valor
- 📅 Data
- 👤 Cliente
- 🏆 Concluído

## 📱 Links Úteis

- **Site:** https://hela-blond.vercel.app
- **Calculadora:** https://hela-blond.vercel.app/calculadora
- **Carry Grátis:** https://hela-blond.vercel.app/carry-gratis
- **Farm:** https://hela-blond.vercel.app/farm

---

## 🚀 Próximos Passos

1. **Criar servidor Discord** com a estrutura acima
2. **Configurar bot** (recomendo Discord.js ou usar MEE6/Ticket Tool)
3. **Integrar com API** do site Hela Carrys
4. **Testar fluxo completo** de tickets
5. **Divulgar** para a comunidade

---

*Documento criado para o projeto Carry Hela - 2025*

