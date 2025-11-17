const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function criarAdmin() {
  try {
    const senhaHash = await bcrypt.hash('Geladeira@001', 10)

    const usuario = await prisma.usuario.upsert({
      where: { email: 'rodrigo@grupomenosemais.com.br' },
      update: {
        senha: senhaHash,
        nome: 'Rodrigo',
        role: 'ADMIN'
      },
      create: {
        email: 'rodrigo@grupomenosemais.com.br',
        senha: senhaHash,
        nome: 'Rodrigo',
        role: 'ADMIN'
      }
    })

    console.log('✅ Usuário criado/atualizado com sucesso!')
    console.log('📧 Email:', usuario.email)
    console.log('🔑 Senha: Geladeira@001')
    console.log('👤 Nome:', usuario.nome)
    console.log('🛡️ Role:', usuario.role)
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error)
  } finally {
    await prisma.$disconnect()
  }
}

criarAdmin()

