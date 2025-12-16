import { NextRequest, NextResponse } from 'next/server'

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

// GET - Buscar histórico de preços
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const itemKey = searchParams.get('item_key')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  const limit = searchParams.get('limit') || '30'
  
  try {
    let url = `${SUPABASE_URL}/rest/v1/historico_precos?select=*`
    
    if (itemKey) {
      url += `&item_key=eq.${itemKey}`
    }
    
    if (startDate) {
      url += `&snapshot_date=gte.${startDate}`
    }
    
    if (endDate) {
      url += `&snapshot_date=lte.${endDate}`
    }
    
    url += `&order=snapshot_date.desc&limit=${limit}`
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Erro ao buscar histórico')
    }
    
    const historico = await response.json()
    
    return NextResponse.json(historico)
    
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 })
  }
}

// GET estatísticas de variação de preço
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { item_keys, dias = 7 } = body
    
    if (!item_keys || !Array.isArray(item_keys)) {
      return NextResponse.json({ error: 'item_keys é obrigatório (array)' }, { status: 400 })
    }
    
    const hoje = new Date()
    const diasAtras = new Date()
    diasAtras.setDate(hoje.getDate() - dias)
    
    const variations: Record<string, { atual: number; antigo: number; variacao: number }> = {}
    
    for (const itemKey of item_keys) {
      // Preço atual
      const atualRes = await fetch(
        `${SUPABASE_URL}/rest/v1/market_prices?item_key=eq.${itemKey}&select=price`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      )
      const atualData = await atualRes.json()
      const precoAtual = atualData[0]?.price || 0
      
      // Preço antigo (do histórico)
      const historicoRes = await fetch(
        `${SUPABASE_URL}/rest/v1/historico_precos?item_key=eq.${itemKey}&snapshot_date=lte.${diasAtras.toISOString().split('T')[0]}&order=snapshot_date.desc&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      )
      const historicoData = await historicoRes.json()
      const precoAntigo = historicoData[0]?.price || precoAtual
      
      const variacao = precoAntigo > 0 
        ? ((precoAtual - precoAntigo) / precoAntigo) * 100 
        : 0
      
      variations[itemKey] = {
        atual: precoAtual,
        antigo: precoAntigo,
        variacao: Math.round(variacao * 100) / 100
      }
    }
    
    return NextResponse.json(variations)
    
  } catch (error) {
    console.error('Erro ao buscar variações:', error)
    return NextResponse.json({ error: 'Erro ao buscar variações' }, { status: 500 })
  }
}

