import { NextRequest, NextResponse } from 'next/server'

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

// GET - Buscar agenda e registros de um usuário
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('user_id') || 'guest'
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  
  try {
    // Buscar agendas do usuário
    let url = `${SUPABASE_URL}/rest/v1/agenda_farm?user_id=eq.${userId}&select=*,registros:registros_farm(*)`
    
    if (startDate) {
      url += `&data=gte.${startDate}`
    }
    if (endDate) {
      url += `&data=lte.${endDate}`
    }
    
    url += '&order=data.desc'
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Erro ao buscar agenda')
    }
    
    const agendas = await response.json()
    
    return NextResponse.json(agendas)
    
  } catch (error) {
    console.error('Erro ao buscar agenda:', error)
    return NextResponse.json({ error: 'Erro ao buscar agenda' }, { status: 500 })
  }
}

// POST - Criar/atualizar agenda e adicionar registro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id = 'guest', data, registro } = body
    
    if (!data || !registro) {
      return NextResponse.json({ error: 'Data e registro são obrigatórios' }, { status: 400 })
    }
    
    // Verificar se já existe agenda para esse dia/usuário
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/agenda_farm?user_id=eq.${user_id}&data=eq.${data}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    )
    
    let agendaId: number
    const existingAgendas = await checkResponse.json()
    
    if (existingAgendas.length > 0) {
      agendaId = existingAgendas[0].id
    } else {
      // Criar nova agenda
      const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/agenda_farm`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ user_id, data })
      })
      
      if (!createResponse.ok) {
        throw new Error('Erro ao criar agenda')
      }
      
      const newAgenda = await createResponse.json()
      agendaId = newAgenda[0].id
    }
    
    // Adicionar registro
    const registroData = {
      agenda_id: agendaId,
      conteudo: registro.conteudo,
      nome_conteudo: registro.nome_conteudo,
      porcentagem_drop: registro.porcentagem_drop || 100,
      tempo_minutos: registro.tempo_minutos || 60,
      custo_entrada: registro.custo_entrada || 0,
      custo_consumiveis: registro.custo_consumiveis || 0,
      custo_total: (registro.custo_entrada || 0) + (registro.custo_consumiveis || 0),
      profit_estimado: registro.profit_estimado || 0,
      profit_real: registro.profit_real || null,
      observacoes: registro.observacoes || null
    }
    
    const registroResponse = await fetch(`${SUPABASE_URL}/rest/v1/registros_farm`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(registroData)
    })
    
    if (!registroResponse.ok) {
      throw new Error('Erro ao criar registro')
    }
    
    const newRegistro = await registroResponse.json()
    
    return NextResponse.json({
      success: true,
      agenda_id: agendaId,
      registro: newRegistro[0]
    })
    
  } catch (error) {
    console.error('Erro ao salvar registro:', error)
    return NextResponse.json({ error: 'Erro ao salvar registro' }, { status: 500 })
  }
}

// DELETE - Remover registro
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const registroId = searchParams.get('registro_id')
  
  if (!registroId) {
    return NextResponse.json({ error: 'registro_id é obrigatório' }, { status: 400 })
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/registros_farm?id=eq.${registroId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Erro ao deletar registro')
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro ao deletar registro:', error)
    return NextResponse.json({ error: 'Erro ao deletar registro' }, { status: 500 })
  }
}

