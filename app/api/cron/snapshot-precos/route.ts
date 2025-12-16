import { NextResponse } from 'next/server'

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

// Verifica se a requisição é autorizada (cron job)
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  // Se não tiver secret configurado, permite (desenvolvimento)
  if (!cronSecret) return true
  
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: Request) {
  // Verificar autorização
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  
  try {
    // Buscar todos os preços atuais do market_prices
    const pricesResponse = await fetch(`${SUPABASE_URL}/rest/v1/market_prices?select=item_key,item_name,price`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
    
    if (!pricesResponse.ok) {
      throw new Error('Erro ao buscar preços atuais')
    }
    
    const prices = await pricesResponse.json()
    
    if (prices.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Nenhum preço para salvar',
        count: 0 
      })
    }
    
    // Data de hoje (snapshot)
    const today = new Date().toISOString().split('T')[0]
    
    // Preparar dados para inserção
    const historicoData = prices.map((p: { item_key: string; item_name: string; price: number }) => ({
      item_key: p.item_key,
      item_name: p.item_name,
      price: p.price,
      snapshot_date: today
    }))
    
    // Inserir no histórico (upsert para evitar duplicatas)
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/historico_precos`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(historicoData)
    })
    
    if (!insertResponse.ok) {
      const error = await insertResponse.text()
      throw new Error(`Erro ao inserir histórico: ${error}`)
    }
    
    return NextResponse.json({
      success: true,
      message: `Snapshot de ${prices.length} preços salvo para ${today}`,
      count: prices.length,
      date: today
    })
    
  } catch (error) {
    console.error('Erro no snapshot de preços:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// POST também aceita para flexibilidade
export async function POST(request: Request) {
  return GET(request)
}

