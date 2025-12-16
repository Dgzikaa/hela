import { NextRequest, NextResponse } from 'next/server'

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

// GET - Buscar configurações de farm (consumíveis e drops)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const conteudo = searchParams.get('conteudo')
  
  try {
    // Buscar consumíveis
    let consumiveisUrl = `${SUPABASE_URL}/rest/v1/config_consumiveis?select=*`
    if (conteudo) {
      consumiveisUrl += `&conteudo=eq.${conteudo}`
    }
    
    // Buscar drops
    let dropsUrl = `${SUPABASE_URL}/rest/v1/config_drops?select=*`
    if (conteudo) {
      dropsUrl += `&conteudo=eq.${conteudo}`
    }
    
    const [consumiveisRes, dropsRes] = await Promise.all([
      fetch(consumiveisUrl, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }),
      fetch(dropsUrl, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })
    ])
    
    if (!consumiveisRes.ok || !dropsRes.ok) {
      throw new Error('Erro ao buscar configurações')
    }
    
    const consumiveis = await consumiveisRes.json()
    const drops = await dropsRes.json()
    
    // Agrupar por conteúdo
    const conteudos: Record<string, { consumiveis: typeof consumiveis; drops: typeof drops }> = {}
    
    consumiveis.forEach((c: { conteudo: string }) => {
      if (!conteudos[c.conteudo]) {
        conteudos[c.conteudo] = { consumiveis: [], drops: [] }
      }
      conteudos[c.conteudo].consumiveis.push(c)
    })
    
    drops.forEach((d: { conteudo: string }) => {
      if (!conteudos[d.conteudo]) {
        conteudos[d.conteudo] = { consumiveis: [], drops: [] }
      }
      conteudos[d.conteudo].drops.push(d)
    })
    
    return NextResponse.json({
      conteudos,
      consumiveis,
      drops
    })
    
  } catch (error) {
    console.error('Erro ao buscar config farm:', error)
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
  }
}

// POST - Adicionar/atualizar configuração
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, data } = body // tipo: 'consumivel' ou 'drop'
    
    if (!tipo || !data) {
      return NextResponse.json({ error: 'Tipo e data são obrigatórios' }, { status: 400 })
    }
    
    const table = tipo === 'consumivel' ? 'config_consumiveis' : 'config_drops'
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erro ao salvar: ${error}`)
    }
    
    const result = await response.json()
    
    return NextResponse.json({ success: true, data: result })
    
  } catch (error) {
    console.error('Erro ao salvar config:', error)
    return NextResponse.json({ error: 'Erro ao salvar configuração' }, { status: 500 })
  }
}

