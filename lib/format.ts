/**
 * Formata valores de zeny em kk ou b
 * 1b = 100.000kk (cem mil kk)
 * 
 * Exemplos:
 * - 500kk → "500kk"
 * - 7000kk → "7000kk" 
 * - 164500kk → "1.65b"
 */
export function formatarValor(valorEmKK: number): string {
  if (valorEmKK >= 100000) {
    return `${(valorEmKK / 100000).toFixed(2)}b`
  }
  return `${valorEmKK}kk`
}

/**
 * Formata valores de zeny em kk ou b (versão com 1 casa decimal)
 */
export function formatarValorSimples(valorEmKK: number): string {
  if (valorEmKK >= 100000) {
    return `${(valorEmKK / 100000).toFixed(1)}b`
  }
  return `${valorEmKK}kk`
}

