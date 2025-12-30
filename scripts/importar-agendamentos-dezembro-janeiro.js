require('dotenv').config()

const AGENDAMENTOS = [
  {
    data: '2025-12-29',
    carrys: [
      { nome: 'bolzanii', nick: 'Theodoro', sinal: 'sinal OK', horario: '20:00' },
      { nome: 'goukii', nick: 'goukii', sinal: 'sinal OK', horario: '19:00' },
      { nome: 'Trasher', nick: 'Trasher', sinal: 'sinal OK', horario: '20:00' }
    ]
  },
  {
    data: '2025-12-30',
    carrys: [
      { nome: 'EsterWurfel', nick: 'EsterWurfel', sinal: 'sinal OK', horario: '21:00', obs: 'juninho no disc' },
      { nome: 'bento', nick: 'bento 2', sinal: 'sinal OK', horario: '21:00' },
      { nome: 'WillGuns', nick: 'WillGuns', sinal: 'sinal OK', horario: '21:00' }
    ]
  },
  {
    data: '2025-12-31',
    carrys: [
      { nome: 'Drakka', nick: 'Drakka', sinal: 'sinal OK', horario: '13:00' },
      { nome: 'Chessuis', nick: 'Chessuis', sinal: 'sinal OK', horario: '13:00' },
      { nome: 'tico', nick: 'tico', sinal: 'sinal OK', horario: '13:00', obs: 'sr bubas sacolas' }
    ]
  },
  {
    data: '2026-01-01',
    carrys: [
      { nome: 'halloweengod', nick: 'halloweengod', sinal: 'sinal OK', horario: '21:00' },
      { nome: 'Atryon', nick: 'Atryon', sinal: 'sinal OK', horario: '21:00', obs: 'sacolas Alera' },
      { nome: 'escuroClaro', nick: 'escuroClaro', sinal: 'sinal OK', horario: '21:00' }
    ]
  },
  {
    data: '2026-01-02',
    carrys: [
      { nome: 'inx', nick: 'inx', sinal: 'sinal OK', horario: '21:00' },
      { nome: 'ErickMxFlamejante', nick: 'ErickMxFlamejante', sinal: 'sinal OK', horario: '21:00' },
      { nome: 'azgher', nick: 'bernardo olimpo', sinal: 'sinal OK', horario: '21:00', obs: 'azgher' }
    ]
  },
  {
    data: '2026-01-03',
    carrys: [
      { nome: 'Balbs', nick: 'Balbs', sinal: 'sinal OK', horario: '21:00', obs: 'Kowalski id: _neto.08' },
      { nome: 'zlixx', nick: 'zlixx', sinal: 'pago tudo', horario: '21:00' },
      { nome: 'Fredyn', nick: 'Fredyn', sinal: 'sinal OK', horario: '21:00' }
    ]
  },
  {
    data: '2026-01-04',
    carrys: [
      { nome: 'FoxGauthier', nick: 'FoxGauthier', sinal: 'sinal OK', horario: '21:00' },
      { nome: 'EVANS', nick: 'EVANS', sinal: 'sinal OK', horario: '21:00', obs: 'sacolas PREFIROCAIRDEMOTO' },
      { nome: 'japanakaz', nick: 'japanakaz', sinal: 'sinal OK', horario: '21:00' }
    ]
  },
  {
    data: '2026-01-05',
    carrys: [
      { nome: 'Verdiinho', nick: 'Verdiinho', sinal: 'sinal OK', horario: '21:00' },
      { nome: 'slackzera', nick: 'slackzera', sinal: 'sinal OK', horario: '21:00' },
      { nome: 'Gabriel', nick: 'Gabriel', sinal: 'pago tudo', horario: '21:00', obs: 'Disc:gabrielsticky sacolas MKTCACETE' }
    ]
  },
  {
    data: '2026-01-06',
    carrys: [
      { nome: 'aww aww', nick: 'aww aww', sinal: 'sinal OK', horario: '21:00', obs: '.raphao no disc' },
      { nome: 'Treco', nick: 'Treco', sinal: 'sinal OK', horario: '21:00', obs: 'Avaraquela' },
      { nome: 'Rossit0', nick: 'Rossit0', sinal: 'sinal OK', horario: '21:00', obs: 'sacolinhas Droppganger' }
    ]
  },
  {
    data: '2026-01-07',
    carrys: [
      { nome: 'Matheus', nick: 'Matheus', sinal: 'sinal OK', horario: '21:00', obs: 'disc: matheusjardim_17 - sacolas defeiticeira ex biscate' },
      { nome: 'Kurt', nick: 'Kurt', sinal: 'sinal OK', horario: '21:00', obs: 'w4nted' },
      { nome: 'Mtz', nick: 'Mtz', sinal: 'sinal OK', horario: '21:00', obs: 'pequena serpente' }
    ]
  },
  {
    data: '2026-01-08',
    carrys: [
      { nome: 'Sanci', nick: 'Sanci', sinal: 'sinal OK', horario: '21:00' },
      { nome: 'Dibis', nick: 'Dibis', sinal: 'sinal OK', horario: '21:00' },
      { nome: 'Gakotali', nick: 'Gakotali', sinal: 'sinal OK', horario: '21:00' }
      // ilovenat seria o 4º - EXCLUÍDO (máximo 3)
    ]
  },
  {
    data: '2026-01-09',
    carrys: [
      { nome: 'RDGW', nick: 'RDGW', sinal: 'sinal OK', horario: '21:00' },
      { nome: 'azvini', nick: 'azvini', sinal: 'sinal OK', horario: '21:00', obs: 'amigo do bibico (1.5)' },
      { nome: 'CaioNog', nick: 'CaioNog', sinal: 'sinal OK', horario: '21:00' }
    ]
  },
  {
    data: '2026-01-10',
    carrys: [
      { nome: 'ApoLo', nick: 'ApoLo', sinal: 'pago tudo', horario: '21:00', obs: 'apolo0076 sacolas heatclyf' },
      { nome: 'Heydros', nick: 'Heydros', sinal: 'sinal OK', horario: '21:00', obs: 'sacolas Gameplayduvidosa' }
    ]
  },
  {
    data: '2026-01-11',
    carrys: [
      { nome: 'Castorzao', nick: 'Castorzao', sinal: 'sinal OK', horario: '21:00', obs: 'SoulBurner sacolinhas' },
      { nome: 'Tortoise', nick: 'Tortoise', sinal: 'sinal OK', horario: '21:00' }
    ]
  }
]

async function importar() {
  console.log('\n📅 IMPORTANDO AGENDAMENTOS...\n')

  const dados = AGENDAMENTOS.map(ag => ({
    data: ag.data,
    clientes: ag.carrys.map(c => c.nome),
    horarios: ag.carrys.map(c => c.horario),
    sinal: ag.carrys[0]?.sinal || 'sinal OK', // Usar o sinal do primeiro como padrão
    observacoes: ag.carrys.map(c => c.obs || '').join(' | '),
    detalhes: ag.carrys
  }))

  try {
    const response = await fetch('http://localhost:3000/api/agendamentos/importar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agendamentos: dados })
    })

    const resultado = await response.json()
    
    if (response.ok) {
      console.log('✅ SUCESSO!')
      console.log(resultado)
    } else {
      console.log('❌ ERRO:', resultado)
    }
  } catch (error) {
    console.error('❌ Erro ao importar:', error)
  }
}

// Exibir prévia
console.log('📋 PRÉVIA DOS AGENDAMENTOS:\n')
AGENDAMENTOS.forEach(ag => {
  const dataFormatada = new Date(ag.data + 'T12:00:00').toLocaleDateString('pt-BR', { 
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  })
  console.log(`${dataFormatada} - ${ag.carrys.length} carrys:`)
  ag.carrys.forEach((c, idx) => {
    console.log(`   #${idx + 1} ${c.nome.padEnd(20)} ${c.horario} ${c.sinal}`)
  })
  console.log()
})

console.log('\n⚠️  ATENÇÃO: 08/01 tinha 4 carrys na lista original.')
console.log('    Limitei a 3 (Sanci, Dibis, Gakotali). ilovenat foi removido.\n')
console.log('💡 Para importar, certifique-se que o servidor está rodando e execute:')
console.log('   node scripts/importar-agendamentos-dezembro-janeiro.js --confirm\n')

// Se passar --confirm, importa
if (process.argv.includes('--confirm')) {
  importar()
}
