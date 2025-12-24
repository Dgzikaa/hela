import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@helaturk.com'
  const senha = 'admin123'
  const nome = 'Administrador'

  // Verifica se já existe
  const existente = await prisma.usuario.findUnique({
    where: { email }
  })

  if (existente) {
    console.log('❌ Usuário já existe!')
    return
  }

  // Cria novo usuário
  const senhaHash = await bcrypt.hash(senha, 10)
  
  const usuario = await prisma.usuario.create({
    data: {
      email,
      senha: senhaHash,
      nome,
      role: 'ADMIN'
    }
  })

  console.log('✅ Usuário criado com sucesso!')
  console.log('📧 Email:', email)
  console.log('🔑 Senha:', senha)
  console.log('👤 ID:', usuario.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

