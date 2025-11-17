async function criarUsuario() {
  try {
    // Usar a API local ou de produção
    const API_URL = process.env.API_URL || 'https://hela-blond.vercel.app/api'
    
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: 'Rodrigo',
        email: 'rodrigo@grupomenosemais.com.br',
        senha: 'Geladeira@001',
        role: 'ADMIN'
      })
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Usuário criado com sucesso!')
      console.log('📧 Email:', data.email)
      console.log('🔑 Senha: Geladeira@001')
      console.log('👤 Nome:', data.nome)
      console.log('🛡️ Role:', data.role)
      console.log('\n🌐 Acesse: https://hela-blond.vercel.app/admin/login')
    } else {
      console.log('⚠️ Resposta:', data)
      if (data.error === 'Email já cadastrado') {
        console.log('ℹ️ Usuário já existe! Use o email e senha para fazer login.')
        console.log('🌐 Acesse: https://hela-blond.vercel.app/admin/login')
      }
    }
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

criarUsuario()

