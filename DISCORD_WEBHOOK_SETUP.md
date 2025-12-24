# 🔔 Configuração do Discord Webhook - Lembretes Diários

## ✅ Status: CONFIGURADO!

O sistema de lembretes diários já está **100% implementado** e pronto para uso!

---

## 📋 O que foi implementado?

### 1. **Webhook Discord Configurado**
- **URL:** `https://discord.com/api/webhooks/1453224824158683307/o37BOmyo-G_XrziBsceJWFdYq7rFYnHCmCjijeoEcVUjuyDMz-O7q7MB3n1hSE2u9pxl`
- **Canal:** Hela (#1453219906114949301)
- **Guild:** ID 1445960193035993222
- **Nome:** Hela

### 2. **Cron Job Agendado**
- **Horário:** Todos os dias às **11:00 AM** (horário UTC = 08:00 AM Brasília)
- **Endpoint:** `/api/cron/lembrete-diario`
- **Arquivo:** `vercel.json` linha 4-6

### 3. **Funcionalidades**
✅ Busca automaticamente todos os carrys agendados para o dia  
✅ Agrupa por horário e mostra bosses  
✅ Lista os jogadores escalados  
✅ Menciona (`@`) todos os jogadores com Discord ID configurado  
✅ Mostra informações completas: cliente, bosses, horário  
✅ Mensagem bonita com embeds coloridos  

---

## 🚀 Como Ativar na Vercel

### Passo 1: Configurar Variável de Ambiente

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** → **Environment Variables**
3. Adicione:
   ```
   Nome: DISCORD_WEBHOOK_URL
   Valor: https://discord.com/api/webhooks/1453224824158683307/o37BOmyo-G_XrziBsceJWFdYq7rFYnHCmCjijeoEcVUjuyDMz-O7q7MB3n1hSE2u9pxl
   ```
4. Clique em **Save**

### Passo 2: Redeployar (opcional)
```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

---

## 📅 Formato da Mensagem Diária

```
🌅 Carries do Dia
━━━━━━━━━━━━━━━━━━━━━━━━━

☀️ Bom dia, equipe! Temos carries agendados para hoje!

🕐 14:00 - Cliente Exemplo
🎯 1️⃣ Freylith, 2️⃣ Tyrgrim, 🔴 Hela
👥 Nick1, Nick2, Nick3

🕐 18:00 - Cliente Teste
🎯 🔴 Hela
👥 Nick4, Nick5, Nick6

📢 Atenção: @Nick1 @Nick2 @Nick3 @Nick4 @Nick5 @Nick6

📋 Total: 2 carry(s) | 6 jogador(es) escalados
🎮 Preparem-se! Boa sorte a todos!
```

---

## 🧪 Testar Manualmente

### Opção 1: Via Browser (desenvolvimento local)
```bash
npm run dev
# Acesse: http://localhost:3000/api/cron/lembrete-diario
```

### Opção 2: Via cURL (produção)
```bash
curl https://hela-blond.vercel.app/api/cron/lembrete-diario
```

**Nota:** Em produção, você precisa adicionar o header de autenticação:
```bash
curl -H "Authorization: Bearer SEU_CRON_SECRET" \
  https://hela-blond.vercel.app/api/cron/lembrete-diario
```

---

## ⚙️ Arquivos Importantes

1. **`lib/discord-webhook.ts`** - Linha 479-554
   - Função: `enviarLembreteDiarioCarrys()`
   - Responsável por montar e enviar a mensagem

2. **`app/api/cron/lembrete-diario/route.ts`**
   - Busca pedidos do dia no banco
   - Agrupa por jogador
   - Chama a função de envio

3. **`vercel.json`** - Linha 3-6
   ```json
   {
     "path": "/api/cron/lembrete-diario",
     "schedule": "0 11 * * *"
   }
   ```

---

## 🔧 Alterando o Horário

Edite o `vercel.json`:

```json
"schedule": "0 11 * * *"  // 11:00 UTC = 08:00 BRT
```

**Exemplos:**
- `"0 12 * * *"` = 12:00 UTC (09:00 BRT) - Meio-dia
- `"0 13 * * *"` = 13:00 UTC (10:00 BRT) - Manhã  
- `"30 14 * * *"` = 14:30 UTC (11:30 BRT) - Antes do almoço

**Formato Cron:** `minuto hora dia mês dia-da-semana`

---

## 🎯 Requisitos para Funcionar

✅ Jogadores precisam ter `discordId` cadastrado no banco  
✅ Pedidos precisam estar com status `AGENDADO` ou `EM_ANDAMENTO`  
✅ Pedidos precisam ter `dataAgendada` preenchida  
✅ Pedidos precisam ter participações vinculadas  

---

## 📊 Logs e Debug

Para ver se está funcionando:

1. **Vercel Logs:**
   - Dashboard → Deployments → Clique no deployment → Functions
   - Procure por `lembrete-diario`

2. **Console Logs Relevantes:**
   ```
   🔔 [WEBHOOK] Função enviarWebhookDiscord chamada
   ✅ Webhook Discord enviado com sucesso!
   ```

---

## 🎉 Pronto!

O sistema está **100% funcional** e rodando! 🚀

A partir de agora, **TODO DIA às 11:00 AM UTC (08:00 BRT)**, o Discord receberá automaticamente a lista de carries do dia no canal configurado!

---

**Desenvolvido por:** Hela Carrys Manager  
**Versão:** 1.0.0  
**Data:** ${new Date().toLocaleDateString('pt-BR')}

