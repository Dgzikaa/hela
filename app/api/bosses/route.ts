import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const bosses = await prisma.boss.findMany({
      orderBy: { ordem: 'asc' }
    })
    
    return NextResponse.json(bosses)
  } catch (error: any) {
    console.error('Erro ao buscar bosses:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

