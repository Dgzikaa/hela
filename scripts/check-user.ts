import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'rodrigo@grupomenosemais.com.br'
  
  const usuario = await prisma.usuario.findUnique({
    where: { email }
  })

  if (!usuario) {
    console.log('❌ Usuário NÃO encontrado!')
    return
  }

  console.log('✅ Usuário encontrado!')
  console.log('📧 Email:', usuario.email)
  console.log('👤 Nome:', usuario.nome)
  console.log('🔑 Role:', usuario.role)
  console.log('🔐 Hash da senha:', usuario.senha.substring(0, 30) + '...')
  
  // Testa a senha
  const senhaCorreta = 'Geladeira@001'
  const senhaValida = await bcrypt.compare(senhaCorreta, usuario.senha)
  
  console.log('\n🧪 Testando senha "Geladeira@001":', senhaValida ? '✅ CORRETA' : '❌ INCORRETA')
  
  // Se a senha estiver errada, vamos resetar
  if (!senhaValida) {
    console.log('\n🔄 Resetando senha para "Geladeira@001"...')
    const novaSenhaHash = await bcrypt.hash(senhaCorreta, 10)
    
    await prisma.usuario.update({
      where: { email },
      data: { senha: novaSenhaHash }
    })
    
    console.log('✅ Senha resetada com sucesso!')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

