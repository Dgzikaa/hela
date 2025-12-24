# 🔄 Sistema de Monitoramento Full-Time de Preços

## 📋 Visão Geral

Este documento descreve como implementar um sistema de monitoramento contínuo (24/7) de preços para o mercado do RagnaTales, utilizando workers em background, cron jobs e cache inteligente.

---

## 🏗️ Arquitetura Recomendada

### Componentes Principais:

1. **Worker Process** - Processo dedicado rodando 24/7
2. **Cron Jobs** - Agendamento de atualizações
3. **Cache Layer** - Redis ou similar para performance
4. **Queue System** - Para processar tarefas assíncronas
5. **Webhook System** - Para notificações em tempo real

---

## 🛠️ Opções de Implementação

### Opção 1: Vercel Cron Jobs (Recomendado para começar)

```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/update-prices",
      "schedule": "*/15 * * * *" // A cada 15 minutos
    },
    {
      "path": "/api/cron/check-price-alerts",
      "schedule": "*/5 * * * *" // A cada 5 minutos
    }
  ]
}
```

```typescript
// app/api/cron/update-prices/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  // Verificar token de autorização do Vercel
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Buscar preços atualizados do Supabase
    const prices = await fetchLatestPrices()
    
    // Atualizar no banco
    await updatePricesInDatabase(prices)
    
    // Verificar alertas
    await checkPriceAlerts(prices)
    
    return NextResponse.json({ success: true, updated: prices.length })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

**Limitações:**
- Máximo 1 execução/minuto (plano free)
- Timeout de 10 segundos (hobby)
- Não é verdadeiramente real-time

---

### Opção 2: Next.js com Background Worker (Railway/Render)

```typescript
// worker/price-monitor.ts
import { CronJob } from 'cron'
import prisma from '@/lib/prisma'

class PriceMonitor {
  private jobs: CronJob[] = []

  start() {
    // Job 1: Atualizar preços a cada 10 minutos
    const updateJob = new CronJob('*/10 * * * *', async () => {
      console.log('Atualizando preços...')
      await this.updatePrices()
    })

    // Job 2: Verificar alertas a cada 5 minutos
    const alertJob = new CronJob('*/5 * * * *', async () => {
      console.log('Verificando alertas...')
      await this.checkAlerts()
    })

    // Job 3: Limpar dados antigos diariamente
    const cleanupJob = new CronJob('0 2 * * *', async () => {
      console.log('Limpando dados antigos...')
      await this.cleanup()
    })

    this.jobs = [updateJob, alertJob, cleanupJob]
    this.jobs.forEach(job => job.start())
    
    console.log('✅ Price Monitor iniciado')
  }

  async updatePrices() {
    // Implementação
  }

  async checkAlerts() {
    // Implementação
  }

  async cleanup() {
    // Implementação
  }

  stop() {
    this.jobs.forEach(job => job.stop())
  }
}

// Iniciar worker
const monitor = new PriceMonitor()
monitor.start()
```

**package.json:**
```json
{
  "scripts": {
    "worker": "ts-node worker/price-monitor.ts",
    "dev": "next dev",
    "start": "concurrently \"next start\" \"npm run worker\""
  }
}
```

---

### Opção 3: Serviço Serverless (AWS Lambda + EventBridge)

```typescript
// lambda/updatePrices.ts
export const handler = async (event: any) => {
  const prices = await fetchFromSupabase()
  await updateDatabase(prices)
  await notifySubscribers(prices)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ updated: prices.length })
  }
}
```

**EventBridge Rule:**
```json
{
  "ScheduleExpression": "rate(10 minutes)",
  "State": "ENABLED",
  "Targets": [{
    "Arn": "arn:aws:lambda:...:function:updatePrices"
  }]
}
```

---

### Opção 4: Worker Dedicado (BullMQ + Redis)

```typescript
// worker/queue.ts
import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis(process.env.REDIS_URL!)

// Fila de atualizações
const priceQueue = new Queue('prices', { connection })

// Worker processando tarefas
const worker = new Worker('prices', async (job) => {
  switch (job.name) {
    case 'update-prices':
      await updateAllPrices()
      break
    case 'check-alerts':
      await checkPriceAlerts()
      break
    case 'generate-recommendations':
      await generateRecommendations()
      break
  }
}, { connection })

// Agendar jobs recorrentes
await priceQueue.add('update-prices', {}, {
  repeat: { every: 10 * 60 * 1000 } // 10 minutos
})

await priceQueue.add('check-alerts', {}, {
  repeat: { every: 5 * 60 * 1000 } // 5 minutos
})
```

---

## 📊 Sistema de Cache com Redis

```typescript
// lib/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function getCachedPrices(itemKey: string) {
  const cached = await redis.get(`price:${itemKey}`)
  if (cached) {
    return JSON.parse(cached)
  }
  return null
}

export async function setCachedPrices(itemKey: string, data: any, ttl = 600) {
  await redis.setex(`price:${itemKey}`, ttl, JSON.stringify(data))
}

export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}
```

---

## 🔔 Sistema de Webhooks para Alertas

```typescript
// app/api/webhooks/price-alert/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { itemName, oldPrice, newPrice, userId } = await request.json()

  // Enviar notificação
  await sendNotification(userId, {
    title: `🔔 Alerta de Preço: ${itemName}`,
    message: `Preço mudou de ${oldPrice}kk para ${newPrice}kk`,
    type: newPrice < oldPrice ? 'success' : 'warning'
  })

  // Enviar para Discord (opcional)
  if (process.env.DISCORD_WEBHOOK_URL) {
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**${itemName}**: ${oldPrice}kk → ${newPrice}kk`
      })
    })
  }

  return NextResponse.json({ success: true })
}
```

---

## 📈 Monitoramento e Logging

```typescript
// lib/monitoring.ts
export async function logPriceUpdate(data: {
  itemName: string
  oldPrice: number
  newPrice: number
  timestamp: Date
}) {
  await prisma.priceLog.create({
    data: {
      ...data,
      change: ((data.newPrice - data.oldPrice) / data.oldPrice) * 100
    }
  })

  // Métricas (opcional - integração com serviços como DataDog, New Relic)
  if (process.env.DATADOG_API_KEY) {
    // Enviar métricas
  }
}
```

---

## 🚀 Deployment

### Railway (Recomendado)
```bash
# Procfile
web: npm run start
worker: npm run worker
```

### Render
```yaml
# render.yaml
services:
  - type: web
    name: hela-carrys-web
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start

  - type: worker
    name: hela-carrys-worker
    env: node
    buildCommand: npm install
    startCommand: npm run worker
```

### Docker
```dockerfile
# Dockerfile.worker
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "worker"]
```

---

## 💰 Custos Estimados

### Vercel (Cron Jobs)
- Free: 1 job/minuto
- Pro ($20/mês): Sem limite
- **Recomendado para MVP**

### Railway
- $5/mês: 500h de execução
- $10/mês: Unlimited
- **Melhor custo-benefício**

### AWS Lambda
- Free tier: 1M requests/mês
- $0.20 por 1M requests depois
- **Mais escalável**

### Redis Cloud
- Free: 30MB
- $5/mês: 100MB
- **Necessário para cache**

---

## ✅ Checklist de Implementação

- [ ] Escolher plataforma de hosting
- [ ] Configurar cron jobs ou worker
- [ ] Implementar cache com Redis
- [ ] Criar sistema de webhooks
- [ ] Configurar rate limiting
- [ ] Adicionar logging e monitoring
- [ ] Testar alertas em tempo real
- [ ] Documentar APIs
- [ ] Configurar backup automático
- [ ] Implementar health checks

---

## 🎯 Roadmap

**Fase 1 (MVP):**
- ✅ Vercel Cron Jobs (a cada 15min)
- ✅ Cache simples (localStorage)
- ✅ Alertas básicos

**Fase 2 (Produção):**
- 🔄 Railway Worker (24/7)
- 🔄 Redis para cache
- 🔄 Webhooks para notificações

**Fase 3 (Escala):**
- 📅 AWS Lambda + EventBridge
- 📅 BullMQ para filas
- 📅 DataDog para monitoring
- 📅 WebSockets para real-time

---

**Status Atual:** MVP implementado com cache client-side e API on-demand.

**Próximo Passo:** Implementar Vercel Cron Jobs para atualização periódica.

