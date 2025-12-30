require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarCarrys() {
  try {
    console.log('\n🔍 VERIFICANDO CARRYS DE DEZEMBRO 2025...\n')

    // Buscar todos os pedidos de dezembro 2025
    const pedidos = await prisma.pedido.findMany({
      where: {
        dataAgendada: {
          gte: new Date('2025-12-01'),
          lte: new Date('2025-12-31')
        }
      },
      orderBy: {
        dataAgendada: 'asc'
      },
      select: {
        id: true,
        nomeCliente: true,
        dataAgendada: true,
        horario: true,
        status: true,
        statusPagamento: true,
        createdAt: true
      }
    })

    console.log(`Total de pedidos em dezembro: ${pedidos.length}\n`)

    // Agrupar por data
    const porData = {}
    pedidos.forEach(p => {
      const data = p.dataAgendada.toISOString().split('T')[0]
      if (!porData[data]) {
        porData[data] = []
      }
      porData[data].push(p)
    })

    // Exibir agrupado
    Object.keys(porData).sort().forEach(data => {
      const carrys = porData[data]
      const dataFormatada = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
      
      console.log(`\n📅 ${dataFormatada} (${data}) - ${carrys.length} carry(s)`)
      
      if (carrys.length > 3) {
        console.log('⚠️  ATENÇÃO: Mais de 3 carrys nesta data!')
      }
      
      carrys.forEach((c, idx) => {
        const horario = c.horario ? c.horario.toString().substring(0, 5) : '21:00'
        console.log(`   #${idx + 1} ${c.nomeCliente.padEnd(20)} | ID: ${c.id} | ${horario} | ${c.status}`)
      })
    })

    console.log('\n✅ Verificação concluída!\n')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarCarrys()
