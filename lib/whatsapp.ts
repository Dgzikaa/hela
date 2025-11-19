// Biblioteca para integração com WhatsApp via Evolution API
import fetch from 'node-fetch'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'hela-bot'

interface WhatsAppMessage {
  numero: string // Número com DDI (ex: 5511999999999)
  mensagem: string
}

interface WhatsAppGroupMessage {
  grupoId: string // ID do grupo (ex: 120363123456789@g.us)
  mensagem: string
}

/**
 * Envia mensagem para um número específico
 */
export async function enviarMensagemWhatsApp({ numero, mensagem }: WhatsAppMessage) {
  try {
    if (!EVOLUTION_API_KEY) {
      console.warn('⚠️ EVOLUTION_API_KEY não configurada - mensagem WhatsApp não enviada')
      return false
    }

    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        number: numero,
        text: mensagem
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error)
      return false
    }

    console.log(`✅ Mensagem WhatsApp enviada para ${numero}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem WhatsApp:', error)
    return false
  }
}

/**
 * Envia mensagem para um grupo do WhatsApp
 */
export async function enviarMensagemGrupoWhatsApp({ grupoId, mensagem }: WhatsAppGroupMessage) {
  try {
    if (!EVOLUTION_API_KEY) {
      console.warn('⚠️ EVOLUTION_API_KEY não configurada - mensagem WhatsApp não enviada')
      return false
    }

    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        number: grupoId,
        text: mensagem
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Erro ao enviar mensagem para grupo WhatsApp:', error)
      return false
    }

    console.log(`✅ Mensagem enviada para grupo WhatsApp ${grupoId}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem para grupo WhatsApp:', error)
    return false
  }
}

/**
 * Formata o lembrete de carries para WhatsApp
 */
export function formatarLembreteCarrysWhatsApp(jogadores: Array<{
  nick: string
  carrys: Array<{
    id: number
    nomeCliente: string
    horario: string
    bosses: string[]
  }>
}>) {
  let mensagem = '☀️ *Bom dia, equipe Hela!*\n\n'
  mensagem += '📋 *Carries agendados para hoje:*\n\n'

  // Agrupar por horário
  const carrysPorHorario = new Map<string, Array<{
    cliente: string
    bosses: string[]
    jogadores: string[]
  }>>()

  jogadores.forEach(jogador => {
    jogador.carrys.forEach(carry => {
      if (!carrysPorHorario.has(carry.horario)) {
        carrysPorHorario.set(carry.horario, [])
      }
      
      const carryExistente = carrysPorHorario.get(carry.horario)!.find(
        c => c.cliente === carry.nomeCliente
      )
      
      if (carryExistente) {
        carryExistente.jogadores.push(jogador.nick)
      } else {
        carrysPorHorario.get(carry.horario)!.push({
          cliente: carry.nomeCliente,
          bosses: carry.bosses,
          jogadores: [jogador.nick]
        })
      }
    })
  })

  // Ordenar por horário
  const carrysOrdenados = Array.from(carrysPorHorario.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))

  carrysOrdenados.forEach(([horario, carries]) => {
    carries.forEach(carry => {
      mensagem += `🕐 *${horario}* - ${carry.cliente}\n`
      mensagem += `🎯 ${carry.bosses.join(', ')}\n`
      mensagem += `👥 ${carry.jogadores.join(', ')}\n\n`
    })
  })

  const totalCarrys = carrysOrdenados.reduce((acc, [, carries]) => acc + carries.length, 0)
  const jogadoresUnicos = new Set(jogadores.map(j => j.nick))

  mensagem += `\n📊 *Total:* ${totalCarrys} carry(s) | ${jogadoresUnicos.size} jogador(es)\n`
  mensagem += `🎮 Preparem-se! Boa sorte a todos!\n\n`
  mensagem += `_Mensagem automática - Sistema Hela Carrys_`

  return mensagem
}

/**
 * Verifica se a instância Evolution está conectada
 */
export async function verificarConexaoEvolution() {
  try {
    if (!EVOLUTION_API_KEY) {
      return { conectado: false, erro: 'API Key não configurada' }
    }

    const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`, {
      headers: {
        'apikey': EVOLUTION_API_KEY
      }
    })

    if (!response.ok) {
      return { conectado: false, erro: 'Erro ao verificar conexão' }
    }

    const data: any = await response.json()
    return { 
      conectado: data.state === 'open',
      estado: data.state
    }
  } catch (error) {
    return { conectado: false, erro: 'Erro de comunicação com Evolution API' }
  }
}

