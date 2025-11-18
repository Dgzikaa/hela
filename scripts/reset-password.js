// Script para resetar senha de um usuário
// Uso: node scripts/reset-password.js <email> <novaSenha>

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2];
  const novaSenha = process.argv[3];

  if (!email || !novaSenha) {
    console.error('❌ Uso: node scripts/reset-password.js <email> <novaSenha>');
    process.exit(1);
  }

  try {
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      console.error(`❌ Usuário com email "${email}" não encontrado`);
      process.exit(1);
    }

    console.log(`\n📝 Usuário encontrado:`);
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Senha atual (hash): ${usuario.senha.substring(0, 20)}...`);

    // Gerar novo hash
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    console.log(`\n🔐 Novo hash gerado: ${senhaHash.substring(0, 20)}...`);

    // Atualizar senha
    await prisma.usuario.update({
      where: { email },
      data: { senha: senhaHash }
    });

    console.log(`\n✅ Senha atualizada com sucesso!`);
    console.log(`\n🧪 Testando login...`);

    // Testar se a senha funciona
    const usuarioAtualizado = await prisma.usuario.findUnique({
      where: { email }
    });

    const senhaValida = await bcrypt.compare(novaSenha, usuarioAtualizado.senha);
    
    if (senhaValida) {
      console.log(`✅ Login testado com sucesso! A senha "${novaSenha}" agora funciona.`);
    } else {
      console.log(`❌ Erro: A senha ainda não está funcionando.`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();

