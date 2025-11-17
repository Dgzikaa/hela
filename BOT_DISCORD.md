# 🤖 Bot Discord - Hela Carrys

## 📝 Como Configurar

### 1️⃣ Criar o Bot no Discord

1. Acesse: https://discord.com/developers/applications
2. Clique em **"New Application"**
3. Dê um nome: **Hela Carrys Bot**
4. Vá em **"Bot"** no menu lateral
5. Clique em **"Reset Token"** e copie o token
6. **IMPORTANTE**: Ative as seguintes **Privileged Gateway Intents**:
   - ✅ MESSAGE CONTENT INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ PRESENCE INTENT

### 2️⃣ Adicionar ao Servidor

1. Vá em **"OAuth2"** → **"URL Generator"**
2. Marque:
   - **Scopes**: `bot`
   - **Permissions**: 
     - Send Messages
     - Embed Links
     - Read Message History
     - Use Slash Commands
3. Copie a URL gerada e abra no navegador
4. Selecione seu servidor Discord

### 3️⃣ Configurar o `.env`

Adicione no seu `.env`:

```env
# Bot Discord
DISCORD_BOT_TOKEN="seu-token-aqui"
DISCORD_NOTIFICATION_CHANNEL="ID_DO_CANAL_DE_NOTIFICACOES"

# API URL
API_URL="https://hela-blond.vercel.app/api"
# OU em desenvolvimento:
# API_URL="http://localhost:3000/api"
```

**Como pegar o ID do canal:**
1. Ative o "Modo Desenvolvedor" no Discord (Configurações → Avançado)
2. Clique com botão direito no canal → Copiar ID

### 4️⃣ Rodar o Bot

#### Desenvolvimento (local):
```bash
npm run bot:dev
```

#### Produção:
```bash
npm run bot
```

**IMPORTANTE**: O bot precisa rodar 24/7. Para isso, use:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **VPS** (DigitalOcean, AWS, etc)

---

## 🎮 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `!carry` | Iniciar compra de carry |
| `!historico` | Ver histórico de compras e tier |
| `!status` | Ver status da última conversa |
| `!cancelar` | Cancelar compra atual |

---

## 💎 Sistema de Fidelidade

### Tiers e Descontos

| Tier | Compras | Desconto |
|------|---------|----------|
| 🥉 Bronze | 0-2 | 5% (primeira compra) |
| 🥈 Prata | 3-5 | 5% |
| 🥇 Ouro | 6-10 | 10% |
| 💎 Platina | 11-20 | 15% |
| 💠 Diamante | 21+ | 20% |

### Funcionamento

1. **Primeiro cliente**: Ganha automaticamente 5% de desconto
2. **A cada compra**: Tier é atualizado automaticamente
3. **Descontos acumulativos**: Quanto mais comprar, maior o desconto
4. **Histórico completo**: Todos os dados salvos no banco

---

## 🔔 Notificações

Quando um cliente finaliza uma compra, o bot notifica no canal configurado com:
- Nome do cliente
- Bosses selecionados
- Valor total
- Link para o admin

---

## 📊 Fluxo de Compra

1. Cliente digita `!carry`
2. Bot mostra lista de bosses com preços
3. Cliente seleciona bosses (múltipla escolha)
4. Bot calcula valor + desconto por fidelidade
5. Cliente confirma
6. Pedido é criado no sistema
7. Notificação enviada aos admins

---

## 🚀 Deploy do Bot (Railway)

1. Crie conta no Railway: https://railway.app
2. Novo projeto → Deploy from GitHub
3. Selecione o repositório `Dgzikaa/hela`
4. Configure as variáveis de ambiente:
   - `DISCORD_BOT_TOKEN`
   - `API_URL`
   - `DATABASE_URL`
   - etc.
5. Adicione o comando de start:
   ```
   npm run bot
   ```
6. Deploy! ✅

---

## 🛠️ Troubleshooting

### Bot não responde
- Verifique se o token está correto
- Confirme que MESSAGE CONTENT INTENT está ativado
- Veja os logs: `npm run bot`

### Erro de conexão com API
- Verifique se `API_URL` está correto
- Teste a API: `curl https://hela-blond.vercel.app/api/bosses`

### Descontos não aplicados
- Confirme que o cliente foi criado no banco
- Veja no admin → Clientes VIP

---

## 📝 Notas

- O bot registra TODAS as mensagens como leads
- Histórico de conversa salvo para análise
- Sistema funciona 100% via Discord (página web oculta)
- CRM completo no painel admin

**Dúvidas?** Veja os logs ou entre em contato!

