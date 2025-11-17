import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint para aplicar schema ao banco
// IMPORTANTE: Este endpoint cria as tabelas necessárias
export async function POST() {
  try {
    // Tentar criar a tabela Usuario se não existir
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Usuario" (
        "id" SERIAL PRIMARY KEY,
        "nome" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "senha" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'ADMIN',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Criar índice no email
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Usuario_email_idx" ON "Usuario"("email");
    `)

    return NextResponse.json({
      success: true,
      message: 'Tabela Usuario criada com sucesso! Agora tente criar o usuário novamente.'
    })
  } catch (error: any) {
    console.error('Erro ao criar tabela:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao criar tabela',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST para criar a tabela Usuario',
    instruction: 'Envie uma requisição POST para este endpoint'
  })
}

