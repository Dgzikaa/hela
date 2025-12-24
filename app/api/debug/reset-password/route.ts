import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const email = 'rodrigo@grupomenosemais.com.br'
    const novaSenha = 'Geladeira@001'
    
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      return NextResponse.json({
        success: false,
        message: 'Usuário NÃO encontrado!'
      })
    }

    // Resetar senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10)
    
    await prisma.usuario.update({
      where: { email },
      data: { senha: novaSenhaHash }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Senha resetada com sucesso!',
      email: email,
      novaSenha: novaSenha
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

