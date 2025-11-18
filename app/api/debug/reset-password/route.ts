import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Rota temporária para debug - DELETAR depois de usar
export async function POST(req: Request) {
  try {
    const { email, novaSenha, secretKey } = await req.json()

    // Proteção simples
    if (secretKey !== 'hela-reset-2024') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    if (!email || !novaSenha) {
      return NextResponse.json(
        { error: 'Email e nova senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      // Listar todos os emails para ajudar a encontrar
      const usuarios = await prisma.usuario.findMany({
        select: { id: true, nome: true, email: true }
      })
      
      return NextResponse.json({
        error: 'Usuário não encontrado',
        usuariosDisponiveis: usuarios
      }, { status: 404 })
    }

    console.log('📝 Usuário encontrado:', usuario.nome, usuario.email)
    console.log('🔐 Hash atual:', usuario.senha.substring(0, 30) + '...')

    // Testar senha atual
    const senhaAtualCorreta = await bcrypt.compare(novaSenha, usuario.senha)
    console.log('🧪 Senha atual já funciona?', senhaAtualCorreta)

    if (senhaAtualCorreta) {
      return NextResponse.json({
        success: true,
        message: 'A senha JÁ está correta! Pode fazer login normalmente.',
        usuario: { nome: usuario.nome, email: usuario.email }
      })
    }

    // Gerar novo hash
    const senhaHash = await bcrypt.hash(novaSenha, 10)
    console.log('🔐 Novo hash:', senhaHash.substring(0, 30) + '...')

    // Atualizar senha
    await prisma.usuario.update({
      where: { email },
      data: { senha: senhaHash }
    })

    // Verificar se funcionou
    const usuarioAtualizado = await prisma.usuario.findUnique({
      where: { email }
    })

    const senhaValida = await bcrypt.compare(novaSenha, usuarioAtualizado!.senha)

    return NextResponse.json({
      success: true,
      message: senhaValida 
        ? '✅ Senha resetada com sucesso! Pode fazer login agora.' 
        : '❌ Erro ao resetar senha. Tente novamente.',
      usuario: { nome: usuario.nome, email: usuario.email },
      testeLogin: senhaValida
    })

  } catch (error: any) {
    console.error('❌ Erro ao resetar senha:', error)
    return NextResponse.json(
      { error: 'Erro ao resetar senha: ' + error.message },
      { status: 500 }
    )
  }
}

// GET - Listar usuários para debug
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const secretKey = searchParams.get('secretKey')

    if (secretKey !== 'hela-reset-2024') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ usuarios })
  } catch (error: any) {
    console.error('❌ Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

