import { NextResponse } from 'next/server'
import { enviarWebhookDiscord } from '@/lib/discord-webhook'

// GET - Testar webhook do Discord
export async function GET() {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    
    if (!webhookUrl) {
      return NextResponse.json({
        success: false,
        error: 'DISCORD_WEBHOOK_URL não configurado no .env',
        help: 'Adicione a variável DISCORD_WEBHOOK_URL no arquivo .env com a URL do webhook do Discord'
      }, { status: 500 })
    }

    // Enviar mensagem de teste
    await enviarWebhookDiscord({
      titulo: '✅ Teste de Webhook',
      descricao: 'Se você está vendo esta mensagem, o webhook está funcionando corretamente!',
      cor: 0x00FF00,
      campos: [
        { nome: '📅 Data/Hora', valor: new Date().toLocaleString('pt-BR'), inline: true },
        { nome: '🔧 Status', valor: 'Funcionando', inline: true }
      ],
      rodape: 'Teste realizado pelo sistema'
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook enviado com sucesso! Verifique o canal do Discord.',
      webhookUrl: webhookUrl.substring(0, 50) + '...' // Mostrar só o início por segurança
    })
  } catch (error: any) {
    console.error('Erro ao testar webhook:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

