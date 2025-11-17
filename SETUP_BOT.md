# 🚀 Setup Rápido do Bot Discord

## ✅ O que você já tem:
- ✅ Bot criado no Discord Developer Portal
- ✅ URL de autorização gerada
- ✅ ID do canal de notificações: `1439954527724900363`
- ✅ Client ID: `1439951993786597396`

---

## 🔑 O que você precisa fazer agora:

### 1️⃣ Pegar o Token do Bot

1. Acesse: https://discord.com/developers/applications
2. Selecione sua aplicação **Hela Carrys Bot**
3. Vá em **"Bot"** no menu lateral
4. Clique em **"Reset Token"** (se necessário) ou **"Copy"**
5. **GUARDE ESSE TOKEN** - você vai precisar dele!

### 2️⃣ Pegar seu User ID do Discord

1. No Discord, vá em **Configurações** → **Avançado**
2. Ative o **"Modo Desenvolvedor"**
3. Clique com o botão direito no seu nome/avatar
4. Clique em **"Copiar ID"**
5. **GUARDE ESSE ID** - é para você receber menções quando houver novos pedidos!

### 3️⃣ Adicionar o Bot ao Servidor

Use esta URL (já está pronta):
```
https://discord.com/oauth2/authorize?client_id=1439951993786597396&permissions=2147567616&integration_type=0&scope=bot
```

1. Abra a URL no navegador
2. Selecione o servidor onde quer adicionar o bot
3. Clique em **"Autorizar"**
4. Confirme que você não é um robô 🤖

### 4️⃣ Configurar as Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto com estas informações:

```env
# ============================================
# 🤖 BOT DISCORD
# ============================================

# Token do bot (passo 1)
DISCORD_BOT_TOKEN="cole-aqui-o-token-do-bot"

# ID do canal de notificações (já configurado!)
DISCORD_NOTIFICATION_CHANNEL="1439954527724900363"

# Seu User ID (passo 2)
DISCORD_ADMIN_USER_ID="cole-aqui-seu-user-id"

# ============================================
# 🌐 API URL
# ============================================

# Para desenvolvimento local
API_URL="http://localhost:3000/api"

# Para produção (depois de fazer deploy)
# API_URL="https://hela-blond.vercel.app/api"

# ============================================
# 🗄️ DATABASE & AUTH (copie do seu .env existente)
# ============================================

DATABASE_URL="sua-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-secret-key"
```

### 5️⃣ Testar o Bot Localmente

```bash
# Instalar dependências (se ainda não fez)
npm install

# Rodar o bot em modo desenvolvimento
npm run bot:dev
```

Se tudo estiver certo, você verá:
```
🤖 Bot conectado como Hela Carrys Bot#1234
```

### 6️⃣ Testar no Discord

No canal do Discord, digite:
```
!carry
```

O bot deve responder com um menu interativo para comprar carrys! 🎮

---

## 🎯 Comandos Disponíveis:

| Comando | Descrição |
|---------|-----------|
| `!carry` | Iniciar compra de carry |
| `!historico` | Ver seu histórico de compras e tier |
| `!status` | Ver status da última conversa |
| `!cancelar` | Cancelar compra atual |

---

## 🚨 Resolução de Problemas:

### ❌ Bot não responde
- Verifique se o `DISCORD_BOT_TOKEN` está correto
- Confirme que **MESSAGE CONTENT INTENT** está ativado no Developer Portal
- Veja os logs: `npm run bot:dev`

### ❌ Notificações não chegam
- Confirme que `DISCORD_NOTIFICATION_CHANNEL` está correto
- Verifique se o bot tem permissão para enviar mensagens no canal
- Teste o ID do canal: clique com botão direito → Copiar ID

### ❌ Erro de conexão com API
- Verifique se `API_URL` está correto
- Se estiver testando localmente, rode: `npm run dev` (em outro terminal)
- Teste a API: abra `http://localhost:3000/api/bosses` no navegador

---

## 📦 Deploy (Produção)

### Opção 1: Railway (Recomendado)

1. Crie conta: https://railway.app
2. Novo projeto → **Deploy from GitHub**
3. Selecione o repositório `Dgzikaa/hela`
4. Configure as variáveis de ambiente (mesmas do .env)
5. Adicione o comando de start:
   ```
   npm run bot
   ```
6. Deploy automático! ✅

### Opção 2: Render

1. Crie conta: https://render.com
2. New → **Background Worker**
3. Conecte seu repositório GitHub
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run bot`
5. Adicione as variáveis de ambiente
6. Create Service! ✅

---

## ✅ Checklist Final:

- [ ] Token do bot copiado e adicionado no `.env`
- [ ] Seu User ID copiado e adicionado no `.env`
- [ ] Bot adicionado ao servidor Discord
- [ ] Canal de notificações configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Bot testado localmente (`npm run bot:dev`)
- [ ] Comando `!carry` funcionando
- [ ] Notificações chegando no canal correto
- [ ] Deploy feito (Railway ou Render)

---

## 🎮 Pronto!

Seu bot está pronto para receber pedidos! Quando alguém usar o comando `!carry`, o bot vai:

1. 🎯 Mostrar lista de bosses com preços
2. 💰 Calcular desconto por fidelidade
3. ✅ Criar o pedido no sistema
4. 🔔 Notificar você no canal configurado
5. 📊 Registrar tudo no CRM/Admin

**Dúvidas?** Veja os logs ou consulte o arquivo `BOT_DISCORD.md`!

