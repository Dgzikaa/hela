import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const email = 'rodrigo@grupomenosemais.com.br'
    
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      return NextResponse.json({
        success: false,
        message: 'Usuário NÃO encontrado!'
      })
    }

    // Testa a senha
    const senhaCorreta = 'Geladeira@001'
    const senhaValida = await bcrypt.compare(senhaCorreta, usuario.senha)
    
    return NextResponse.json({
      success: true,
      usuario: {
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role,
        senhaHash: usuario.senha.substring(0, 30) + '...'
      },
      senhaTestada: 'Geladeira@001',
      senhaValida: senhaValida
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

