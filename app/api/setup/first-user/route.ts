import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Endpoint temporário para criar primeiro usuário
// REMOVER APÓS USO!
export async function POST(req: Request) {
  try {
    // Verificar se já existe algum usuário
    const usuariosExistentes = await prisma.usuario.count()
    
    if (usuariosExistentes > 0) {
      return NextResponse.json(
        { error: 'Já existem usuários cadastrados. Use /admin/usuarios para criar novos.' },
        { status: 400 }
      )
    }

    const { nome, email, senha } = await req.json()

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10)

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        role: 'ADMIN'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Primeiro usuário criado com sucesso!',
      usuario
    })
  } catch (error) {
    console.error('Erro ao criar primeiro usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}

// GET para verificar status
export async function GET() {
  try {
    const count = await prisma.usuario.count()
    
    return NextResponse.json({
      usuariosExistentes: count,
      podecriar: count === 0,
      message: count === 0 
        ? 'Nenhum usuário cadastrado. Use POST para criar o primeiro.' 
        : `${count} usuário(s) já cadastrado(s).`
    })
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro ao verificar usuários' }, { status: 500 })
  }
}

