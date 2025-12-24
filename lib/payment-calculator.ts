/**
 * Sistema de cálculo automático de divisão de pagamentos entre jogadores
 */

export interface Jogador {
  id: number
  nick: string
  categorias: string // "HELA,CARRYS" ou "SUPLENTE"
  essencial: boolean
}

export interface DivisaoCalculo {
  jogadorId: number
  jogadorNick: string
  valorRecebido: number
  percentual: number
  isEssencial: boolean
  categoria: string
}

export interface ResultadoDivisao {
  valorTotal: number
  divisoes: DivisaoCalculo[]
  taxaSistema?: number
  valorLiquido: number
}

/**
 * Calcula a divisão de pagamento entre jogadores
 * 
 * @param valorTotal - Valor total do carry
 * @param jogadores - Lista de jogadores participantes
 * @param configuracao - Configurações de divisão
 */
export function calcularDivisaoPagamento(
  valorTotal: number,
  jogadores: Jogador[],
  configuracao: {
    taxaSistema?: number  // % do valor para taxa do sistema (ex: 5 = 5%)
    bonusEssencial?: number // % de bonus para jogadores essenciais (ex: 10 = 10%)
    bonusHela?: number // % de bonus para jogadores que fizeram Hela (ex: 15 = 15%)
  } = {}
): ResultadoDivisao {
  const { taxaSistema = 0, bonusEssencial = 0, bonusHela = 0 } = configuracao

  // Calcular valor líquido após taxa do sistema
  const taxaValor = (valorTotal * taxaSistema) / 100
  const valorLiquido = valorTotal - taxaValor

  // Separar jogadores por categoria
  const essenciais = jogadores.filter(j => j.essencial)
  const normais = jogadores.filter(j => !j.essencial)

  // Calcular pesos base
  let pesoTotal = jogadores.length

  // Adicionar bonus para essenciais
  const bonusEssencialPeso = bonusEssencial / 100
  pesoTotal += essenciais.length * bonusEssencialPeso

  // Adicionar bonus para quem fez Hela
  const jogadoresHela = jogadores.filter(j => j.categorias.includes('HELA'))
  const bonusHelaPeso = bonusHela / 100
  pesoTotal += jogadoresHela.length * bonusHelaPeso

  // Calcular valor por peso unitário
  const valorPorPeso = valorLiquido / pesoTotal

  // Calcular divisão para cada jogador
  const divisoes: DivisaoCalculo[] = jogadores.map(jogador => {
    let peso = 1 // Peso base

    // Adicionar bonus essencial
    if (jogador.essencial) {
      peso += bonusEssencialPeso
    }

    // Adicionar bonus Hela
    if (jogador.categorias.includes('HELA')) {
      peso += bonusHelaPeso
    }

    const valorRecebido = Math.round(valorPorPeso * peso)
    const percentual = (valorRecebido / valorTotal) * 100

    return {
      jogadorId: jogador.id,
      jogadorNick: jogador.nick,
      valorRecebido,
      percentual: Math.round(percentual * 100) / 100,
      isEssencial: jogador.essencial,
      categoria: jogador.categorias
    }
  })

  // Ajustar diferenças de arredondamento
  const totalCalculado = divisoes.reduce((sum, d) => sum + d.valorRecebido, 0)
  const diferenca = valorLiquido - totalCalculado

  if (diferenca !== 0) {
    // Adicionar diferença ao primeiro jogador (ou distribuir)
    divisoes[0].valorRecebido += diferenca
  }

  return {
    valorTotal,
    divisoes: divisoes.sort((a, b) => b.valorRecebido - a.valorRecebido),
    taxaSistema: taxaValor,
    valorLiquido
  }
}

/**
 * Calcular divisão com base em horários diferentes
 * Jogadores que ficam mais tempo recebem mais
 */
export function calcularDivisaoPorTempo(
  valorTotal: number,
  participacoes: { jogador: Jogador, minutosParticipados: number }[]
): ResultadoDivisao {
  const minutosTotal = participacoes.reduce((sum, p) => sum + p.minutosParticipados, 0)
  
  const divisoes: DivisaoCalculo[] = participacoes.map(({ jogador, minutosParticipados }) => {
    const percentual = (minutosParticipados / minutosTotal) * 100
    const valorRecebido = Math.round((valorTotal * percentual) / 100)

    return {
      jogadorId: jogador.id,
      jogadorNick: jogador.nick,
      valorRecebido,
      percentual: Math.round(percentual * 100) / 100,
      isEssencial: jogador.essencial,
      categoria: jogador.categorias
    }
  })

  // Ajustar arredondamento
  const totalCalculado = divisoes.reduce((sum, d) => sum + d.valorRecebido, 0)
  const diferenca = valorTotal - totalCalculado

  if (diferenca !== 0) {
    divisoes[0].valorRecebido += diferenca
  }

  return {
    valorTotal,
    divisoes: divisoes.sort((a, b) => b.valorRecebido - a.valorRecebido),
    valorLiquido: valorTotal
  }
}

/**
 * Divisão simples - divide igualmente entre todos
 */
export function calcularDivisaoSimples(
  valorTotal: number,
  jogadores: Jogador[]
): ResultadoDivisao {
  const valorPorJogador = Math.floor(valorTotal / jogadores.length)
  const resto = valorTotal - (valorPorJogador * jogadores.length)

  const divisoes: DivisaoCalculo[] = jogadores.map((jogador, index) => {
    const valorRecebido = valorPorJogador + (index === 0 ? resto : 0)
    const percentual = (valorRecebido / valorTotal) * 100

    return {
      jogadorId: jogador.id,
      jogadorNick: jogador.nick,
      valorRecebido,
      percentual: Math.round(percentual * 100) / 100,
      isEssencial: jogador.essencial,
      categoria: jogador.categorias
    }
  })

  return {
    valorTotal,
    divisoes,
    valorLiquido: valorTotal
  }
}

/**
 * Preview de divisão antes de confirmar
 */
export function gerarPreviewDivisao(resultado: ResultadoDivisao): string {
  let preview = `💰 Divisão de Pagamento\n\n`
  preview += `Valor Total: ${resultado.valorTotal}kk\n`
  
  if (resultado.taxaSistema) {
    preview += `Taxa Sistema: -${resultado.taxaSistema}kk\n`
    preview += `Valor Líquido: ${resultado.valorLiquido}kk\n`
  }
  
  preview += `\n📊 Divisão:\n\n`

  resultado.divisoes.forEach((divisao, index) => {
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'
    const badge = divisao.isEssencial ? ' ⭐' : ''
    const helaBadge = divisao.categoria.includes('HELA') ? ' 👑' : ''
    
    preview += `${emoji} ${divisao.jogadorNick}${badge}${helaBadge}\n`
    preview += `   ${divisao.valorRecebido}kk (${divisao.percentual}%)\n\n`
  })

  return preview
}

