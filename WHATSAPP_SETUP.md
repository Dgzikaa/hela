# 📱 Configuração do WhatsApp - Evolution API

## 🚀 Passo 1: Deploy da Evolution API no Railway

### 1.1. Criar Novo Serviço no Railway
1. No Railway, clique em **"New"** → **"Empty Service"**
2. Clique em **"Deploy"** → **"Docker Image"**
3. Use a imagem: `atendai/evolution-api:v2.1.1`

### 1.2. Configurar Variáveis de Ambiente
No serviço da Evolution API, adicione:

```bash
# Configurações Básicas
AUTHENTICATION_API_KEY=MUDE_ISSO_POR_UMA_CHAVE_SEGURA_123456

# Database (usar PostgreSQL do Supabase ou criar novo)
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=sua_url_postgresql_aqui

# Servidor
SERVER_URL=https://seu-dominio-evolution.railway.app
SERVER_PORT=8080

# Configurações de Sessão
STORE_MESSAGES=true
STORE_MESSAGE_UP=true
STORE_CONTACTS=true
STORE_CHATS=true

# Webhook (opcional)
WEBHOOK_GLOBAL_ENABLED=false
WEBHOOK_GLOBAL_URL=

# Logs
LOG_LEVEL=ERROR
LOG_COLOR=true
```

### 1.3. Expor Publicamente
1. No Railway, vá em **"Settings"** → **"Networking"**
2. Clique em **"Generate Domain"**
3. Anote a URL (ex: `https://evolution-api-production-xxxx.up.railway.app`)

---

## 🔗 Passo 2: Configurar no Projeto Hela

### 2.1. Adicionar Variáveis no Vercel
No projeto Next.js (Vercel), adicione:

```bash
# Evolution API
EVOLUTION_API_URL=https://seu-dominio-evolution.railway.app
EVOLUTION_API_KEY=MUDE_ISSO_POR_UMA_CHAVE_SEGURA_123456
EVOLUTION_INSTANCE=hela-bot
WHATSAPP_GRUPO_ID=  # Deixe vazio por enquanto
```

---

## 📱 Passo 3: Conectar o WhatsApp

### 3.1. Criar Instância
Faça uma requisição POST:

```bash
curl -X POST https://seu-dominio-evolution.railway.app/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: MUDE_ISSO_POR_UMA_CHAVE_SEGURA_123456" \
  -d '{
    "instanceName": "hela-bot",
    "qrcode": true
  }'
```

### 3.2. Gerar QR Code
```bash
curl https://seu-dominio-evolution.railway.app/instance/connect/hela-bot \
  -H "apikey: MUDE_ISSO_POR_UMA_CHAVE_SEGURA_123456"
```

**Resposta:**
```json
{
  "qrcode": {
    "base64": "data:image/png;base64,..."
  }
}
```

### 3.3. Escanear QR Code
1. Copie o base64 e cole no navegador (ou use ferramenta online)
2. Abra WhatsApp no celular
3. Vá em **Dispositivos Conectados** → **Conectar Dispositivo**
4. Escaneie o QR Code
5. Pronto! ✅

---

## 🔍 Passo 4: Obter ID do Grupo

### 4.1. Listar Grupos
```bash
curl https://seu-dominio-evolution.railway.app/group/fetchAllGroups/hela-bot \
  -H "apikey: MUDE_ISSO_POR_UMA_CHAVE_SEGURA_123456"
```

### 4.2. Encontrar o Grupo Certo
Procure pelo nome do grupo. O ID será algo como:
```
120363123456789012@g.us
```

### 4.3. Adicionar no Vercel
Atualize a variável `WHATSAPP_GRUPO_ID` no Vercel com o ID encontrado.

---

## ✅ Passo 5: Testar

### 5.1. Testar Envio Manual
Acesse no navegador:
```
https://hela-blond.vercel.app/api/cron/lembrete-diario
```

Você deve receber:
- 📱 Mensagem no Discord (canal)
- 📱 Mensagem no WhatsApp (grupo)

---

## 🔧 Troubleshooting

### Bot não conecta
- Verifique se o QR Code foi escaneado
- Verifique se o número está com WhatsApp instalado
- Tente criar nova instância

### Mensagem não chega no grupo
- Verifique se o `WHATSAPP_GRUPO_ID` está correto
- Verifique se o bot está no grupo
- Verifique os logs da Evolution API

### Evolution API offline
- Verifique se o serviço está rodando no Railway
- Verifique os logs do Railway
- Tente redeployar

---

## 📊 Status do Sistema

Quando tudo estiver configurado:

✅ Discord: Mensagem no canal com @menções
✅ WhatsApp: Mensagem no grupo do time
✅ Horário: Todo dia às 08:00 BRT
✅ Conteúdo: Lista de carries do dia

---

## 💰 Custos

- **Evolution API no Railway:** ~$0.50/mês
- **Mensagens WhatsApp:** Grátis (ilimitadas)
- **Total:** ~R$ 2,50/mês

---

## 🆘 Suporte

Se precisar de ajuda:
1. Verifique os logs no Railway
2. Teste a API com Postman/Insomnia
3. Consulte a documentação: https://doc.evolution-api.com

---

**Pronto! Seu sistema está configurado para enviar lembretes automáticos no Discord e WhatsApp! 🎉**

