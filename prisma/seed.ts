import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // 1. Criar Bosses
  console.log('📦 Criando bosses...')
  
  const bosses = [
    {
      nome: 'Freylith',
      mobId: 21857,
      ordem: 1,
      preco: 70, // 70KK
      imagemUrl: 'https://api.ragnatales.com.br/database/mob/image?mob_id=21857'
    },
    {
      nome: 'Tyrgrim',
      mobId: 20431,
      ordem: 2,
      preco: 100, // 100KK
      imagemUrl: 'https://api.ragnatales.com.br/database/mob/image?mob_id=20431'
    },
    {
      nome: 'Skollgrim',
      mobId: 28292,
      ordem: 3,
      preco: 130, // 130KK
      imagemUrl: 'https://api.ragnatales.com.br/database/mob/image?mob_id=28292'
    },
    {
      nome: 'Baldira',
      mobId: 21856,
      ordem: 4,
      preco: 150, // 150KK
      imagemUrl: 'https://api.ragnatales.com.br/database/mob/image?mob_id=21856'
    },
    {
      nome: 'Thorvald',
      mobId: 20433,
      ordem: 5,
      preco: 230, // 230KK
      imagemUrl: 'https://api.ragnatales.com.br/database/mob/image?mob_id=20433'
    },
    {
      nome: 'Glacius',
      mobId: 21858,
      ordem: 6,
      preco: 300, // 300KK
      imagemUrl: 'https://api.ragnatales.com.br/database/mob/image?mob_id=21858'
    },
    {
      nome: 'Hela',
      mobId: 28221,
      ordem: 0, // Boss especial
      preco: 0, // Preço customizado
      imagemUrl: 'https://api.ragnatales.com.br/database/mob/image?mob_id=28221'
    }
  ]

  for (const boss of bosses) {
    await prisma.boss.upsert({
      where: { mobId: boss.mobId },
      update: boss,
      create: boss
    })
  }

  console.log(`✅ ${bosses.length} bosses criados!`)

  // 2. Criar usuário admin padrão
  console.log('👤 Criando usuário admin...')
  
  const senhaHash = await bcrypt.hash('admin123', 10)
  
  await prisma.usuario.upsert({
    where: { email: 'admin@hela.com' },
    update: {},
    create: {
      email: 'admin@hela.com',
      nome: 'Administrador',
      senha: senhaHash,
      role: 'ADMIN',
      ativo: true
    }
  })

  console.log('✅ Usuário admin criado!')
  console.log('📧 Email: admin@hela.com')
  console.log('🔑 Senha: admin123')

  console.log('\n🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

