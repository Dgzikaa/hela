import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import path from 'path'

export async function POST(): Promise<Response> {
  return new Promise<Response>((resolve) => {
    const scriptPath = path.join(process.cwd(), 'ragnatales-watcher', 'sync-prices.js')
    
    // Executa o script em background
    exec(`node "${scriptPath}"`, { 
      cwd: process.cwd(),
      timeout: 120000 // 2 minutos
    }, (error, stdout, stderr) => {
      if (error) {
        console.error('Erro ao executar sync-prices:', error)
        resolve(NextResponse.json({
          message: 'Erro ao sincronizar preços',
          error: error.message
        }, { status: 500 }))
        return
      }
      
      // Conta quantos itens foram atualizados baseado no output
      const successCount = (stdout.match(/✓/g) || []).length
      
      console.log('Sync output:', stdout)
      if (stderr) console.error('Sync stderr:', stderr)
      
      resolve(NextResponse.json({
        message: `Sincronizados ${successCount} itens do mercado`,
        success: successCount,
        output: stdout.slice(-500) // Últimos 500 caracteres do output
      }))
    })
  })
}
