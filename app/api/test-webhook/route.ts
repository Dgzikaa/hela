import { NextResponse } from 'next/server'

// GET - Testar webhook do Discord COM DETALHES
export async function GET() {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    
    if (!webhookUrl) {
      return NextResponse.json({
        success: false,
        error: 'DISCORD_WEBHOOK_URL não configurado',
        help: 'Configure a variável DISCORD_WEBHOOK_URL na Vercel'
      }, { status: 500 })
    }

    // Testar webhook DIRETO com fetch
    const embed = {
      title: '✅ Teste de Webhook',
      description: 'Se você está vendo esta mensagem, o webhook está funcionando!',
      color: 0x00FF00,
      fields: [
        { name: '📅 Data/Hora', value: new Date().toLocaleString('pt-BR'), inline: true },
        { name: '🔧 Status', value: 'Funcionando', inline: true }
      ],
      footer: { text: 'Teste realizado pelo sistema' },
      timestamp: new Date().toISOString()
    }

    console.log('🔄 Enviando para webhook:', webhookUrl.substring(0, 50) + '...')

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [embed]
      })
    })

    const responseText = await response.text()
    
    console.log('📊 Status do webhook:', response.status)
    console.log('📄 Resposta:', responseText)

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Webhook retornou erro',
        status: response.status,
        statusText: response.statusText,
        response: responseText,
        help: response.status === 404 
          ? '❌ Webhook não encontrado. Crie um novo webhook no Discord e atualize a URL na Vercel'
          : response.status === 401
          ? '❌ Webhook inválido. Verifique se a URL está correta'
          : '❌ Erro desconhecido. Verifique os logs'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '✅ Webhook enviado com sucesso! Verifique o canal do Discord.',
      status: response.status,
      webhookUrl: webhookUrl.substring(0, 50) + '...'
    })
  } catch (error: any) {
    console.error('❌ Erro ao testar webhook:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

