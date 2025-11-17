const bcrypt = require('bcryptjs')

async function gerarHash() {
  const senha = 'Geladeira@001'
  const hash = await bcrypt.hash(senha, 10)
  
  console.log('Senha:', senha)
  console.log('Hash:', hash)
  console.log('\nUse este SQL no Supabase:')
  console.log(`UPDATE "Usuario" SET senha = '${hash}' WHERE email = 'rodrigo@grupomenosemais.com.br';`)
}

gerarHash()

