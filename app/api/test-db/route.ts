import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Tenta conectar ao banco
    await prisma.$connect()
    
    // Tenta fazer uma query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({ 
      success: true, 
      message: 'Conexão com banco OK!',
      result 
    })
  } catch (error: any) {
    console.error('Erro de conexão:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error.toString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

