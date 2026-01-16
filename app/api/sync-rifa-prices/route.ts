import { NextResponse } from 'next/server'

const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

// ===============================
// ITENS DAS RIFAS PARA SINCRONIZAR
// ===============================
// Cada item precisa do ID correto do RagnaTales
// TODO: Preencher IDs quando disponíveis

interface RifaItem {
  key: string
  name: string
  id: number // nameid da API do RagnaTales - 0 = ainda não mapeado
  categoria: string
}

const RIFA_ITEMS: RifaItem[] = [
  // === PALITOS (Caixas A, C, E) ===
  { key: 'palitosBaunilha', name: 'Palitos de Baunilha', id: 14618, categoria: 'consumivel' },
  { key: 'palitosLaranja', name: 'Palitos de Laranja', id: 14616, categoria: 'consumivel' },
  { key: 'palitosCassis', name: 'Palitos de Cassis', id: 14619, categoria: 'consumivel' },
  { key: 'palitosChocolate', name: 'Palitos de Chocolate', id: 14617, categoria: 'consumivel' },
  { key: 'palitosLimao', name: 'Palitos de Limão', id: 14620, categoria: 'consumivel' },
  { key: 'palitosMorango', name: 'Palitos de Morango', id: 14621, categoria: 'consumivel' },

  // === PERGAMINHOS E POÇÕES (Caixas B, D, F) ===
  { key: 'pergaminhoEsquiva', name: 'Pergaminho de Esquiva', id: 14530, categoria: 'consumivel' },
  { key: 'pocaoFurorFisico', name: 'Poção do Furor Físico', id: 12418, categoria: 'consumivel' },
  { key: 'caliceIlusao', name: 'Cálice da Ilusão', id: 14538, categoria: 'consumivel' },
  { key: 'pocaoFurorMagico', name: 'Poção do Furor Mágico', id: 12419, categoria: 'consumivel' },
  { key: 'pocaoRegeneracao', name: 'Poção de Regeneração', id: 12461, categoria: 'consumivel' },
  { key: 'pergaminhoPrecisao', name: 'Pergaminho de Precisão', id: 14531, categoria: 'consumivel' },
  { key: 'acaraje', name: 'Acarajé', id: 12375, categoria: 'consumivel' },
  { key: 'abrasivo', name: 'Abrasivo', id: 14536, categoria: 'consumivel' },

  // === ITENS RIFA 4 ===
  { key: 'medicinaMilagrosa', name: 'Medicina Milagrosa', id: 12259, categoria: 'consumivel' },
  { key: 'pergaminhoEden', name: 'Pergaminho do Éden', id: 17721, categoria: 'consumivel' },

  // === ITENS RIFA 5 ===
  { key: 'espelhoConvexo', name: 'Espelho Convexo', id: 12214, categoria: 'consumivel' },
  { key: 'amuletoZiegfried', name: 'Amuleto de Ziegfried', id: 7621, categoria: 'consumivel' },

  // === CAIXA AUXILIARES A ===
  { key: 'frascosBombaDourado', name: 'Frasco de Bomba Dourado', id: 17620, categoria: 'consumivel' },
  { key: 'frascosRevestimentoDourado', name: 'Frasco de Revestimento Dourado', id: 17619, categoria: 'consumivel' },
  { key: 'pedraDourada', name: 'Pedra Dourada', id: 52011, categoria: 'consumivel' },
  { key: 'pergaminhoDourado', name: 'Pergaminho Dourado', id: 52009, categoria: 'consumivel' },
  { key: 'gemaAmarelaDourada', name: 'Gema Amarela Dourada', id: 102509, categoria: 'consumivel' },
  { key: 'gemaVermelhoDourada', name: 'Gema Vermelha Dourada', id: 102510, categoria: 'consumivel' },
  { key: 'gemaAzulDourada', name: 'Gema Azul Dourada', id: 102511, categoria: 'consumivel' },

  // === CAIXA CONVERSORES ETÉREOS ===
  { key: 'conversorFantasma', name: 'Conversor Elemental Fantasma', id: 102502, categoria: 'consumivel' },
  { key: 'pergaminhoAspersio', name: 'Pergaminho de Aspersio', id: 12928, categoria: 'consumivel' },

  // === CAIXA CONSUMÍVEIS DOURADOS ===
  { key: 'pocaoAgilidadeDourada', name: 'Poção de Agilidade Dourada', id: 102503, categoria: 'consumivel' },
  { key: 'panaceiaDourada', name: 'Panacéia Dourada', id: 52047, categoria: 'consumivel' },
  { key: 'doceElviraDourado', name: 'Doce de Elvira Dourado', id: 52045, categoria: 'consumivel' },
  { key: 'folhaYggdrasilDourada', name: 'Folha de Yggdrasil Dourada', id: 52046, categoria: 'consumivel' },
  { key: 'pocaoAntiElementoDourada', name: 'Poção Anti-Elemento Dourada', id: 52048, categoria: 'consumivel' },
  { key: 'conversorRemovedorDourado', name: 'Conversor Removedor Dourado', id: 52063, categoria: 'consumivel' },

  // === DOCE DE ELVIRA (RIFA 7 CONSOLAÇÃO) ===
  { key: 'doceElvira', name: 'Doce de Elvira', id: 23044, categoria: 'consumivel' },

  // === ITENS RIFA 8 ===
  { key: 'pocaoGuyak', name: 'Poção de Guyak', id: 12710, categoria: 'consumivel' },
  { key: 'pocaoVento', name: 'Poção do Vento', id: 12016, categoria: 'consumivel' },

  // === ITENS RIFA 9 - TROUXINHA DE COMIDAS ===
  { key: 'saladaFrutasTropicais', name: 'Salada de Frutas Tropicais', id: 12247, categoria: 'consumivel' },
  // Trouxinha contém: Língua no Vapor, Escorpiões, Cozido Imortal, Coquetel, Tônico, Nove Caudas
  { key: 'linguaVapor', name: 'Língua no Vapor', id: 12075, categoria: 'consumivel' },
  { key: 'escorpioesVapor', name: 'Escorpiões do Deserto no Vapor', id: 12090, categoria: 'consumivel' },
  { key: 'cozidoImortal', name: 'Cozido Imortal', id: 12085, categoria: 'consumivel' },
  { key: 'coquetelSoproDragao', name: 'Coquetel Sopro do Dragão', id: 12080, categoria: 'consumivel' },
  { key: 'tonicoHwergelmir', name: 'Tônico de Hwergelmir', id: 12095, categoria: 'consumivel' },
  { key: 'noveCaudasCozidas', name: 'Nove Caudas Cozidas', id: 12100, categoria: 'consumivel' },

  // === CAIXA MUNIÇÕES DOURADAS ===
  { key: 'kunaiDourada', name: 'Kunai Dourada', id: 17616, categoria: 'consumivel' },
  { key: 'flechaDourada', name: 'Flecha Dourada', id: 17614, categoria: 'consumivel' },
  { key: 'projetilDourado', name: 'Projétil Dourado', id: 17617, categoria: 'consumivel' },
  { key: 'shurikenDourada', name: 'Shuriken Dourada', id: 17615, categoria: 'consumivel' },
  { key: 'capsulaDourada', name: 'Cápsula Dourada', id: 52010, categoria: 'consumivel' },

  // === CAIXA CONVERSORES ELEMENTAIS ===
  { key: 'conversorAgua', name: 'Conversor Elemental Água', id: 12115, categoria: 'consumivel' },
  { key: 'conversorFogo', name: 'Conversor Elemental Fogo', id: 12114, categoria: 'consumivel' },
  { key: 'conversorTerra', name: 'Conversor Elemental Terra', id: 12116, categoria: 'consumivel' },
  { key: 'conversorVento', name: 'Conversor Elemental Vento', id: 12117, categoria: 'consumivel' },
  { key: 'conversorRemovedor', name: 'Conversor Removedor Elemental', id: 102504, categoria: 'consumivel' },

  // === CAIXA AUXILIARES B ===
  { key: 'garrafaVenenoDourada', name: 'Garrafa de Veneno Dourada', id: 17618, categoria: 'consumivel' },
  { key: 'kitToxinasDouradas', name: 'Kit de Toxinas Douradas', id: 102508, categoria: 'consumivel' },
  { key: 'bolsaFalsaZenysDourada', name: 'Bolsa Falsa de Zenys Dourada', id: 17613, categoria: 'consumivel' },
  { key: 'armadilhaDourada', name: 'Armadilha Dourada', id: 52053, categoria: 'consumivel' },
  { key: 'esporoCogumeloDourado', name: 'Esporo de Cogumelo Dourado', id: 52059, categoria: 'consumivel' },
  { key: 'sementeSelvagemDourada', name: 'Semente Selvagem Dourada', id: 52061, categoria: 'consumivel' },
  { key: 'sementeSanguessugaDourada', name: 'Semente Sanguessuga Dourada', id: 52062, categoria: 'consumivel' },

  // === CAIXA SUPRIMENTOS CLASSE ===
  { key: 'garrafaVeneno', name: 'Garrafa de Veneno', id: 678, categoria: 'consumivel' },
  { key: 'frascoFogoGrego', name: 'Frasco de Fogo Grego', id: 7135, categoria: 'consumivel' },
  { key: 'frascoAcido', name: 'Frasco de Ácido', id: 7136, categoria: 'consumivel' },
  { key: 'frascoRevestimento', name: 'Frasco de Revestimento', id: 7139, categoria: 'consumivel' },

  // === CAIXA INGREDIENTES DOURADOS ===
  { key: 'tuboEnsaioDourado', name: 'Tubo de Ensaio Dourado', id: 52056, categoria: 'consumivel' },
  { key: 'garrafaVaziaDourada', name: 'Garrafa Vazia Dourada', id: 52055, categoria: 'consumivel' },
  { key: 'garrafaPocaoDourada', name: 'Garrafa de Poção Dourada', id: 52057, categoria: 'consumivel' },
  { key: 'vasilhaMisturaDourada', name: 'Vasilha de Mistura Dourada', id: 52054, categoria: 'consumivel' },

  // === CAIXA XAROPES ===
  { key: 'xaropeAzul', name: 'Xarope Azul', id: 11624, categoria: 'consumivel' },
  { key: 'xaropeVermelho', name: 'Xarope Vermelho', id: 11621, categoria: 'consumivel' },
  { key: 'xaropeBranco', name: 'Xarope Branco', id: 11623, categoria: 'consumivel' },
  { key: 'xaropeAmarelo', name: 'Xarope Amarelo', id: 11622, categoria: 'consumivel' },

  // === ITENS RIFA 13 ===
  { key: 'pocaoMental', name: 'Poção Mental', id: 14600, categoria: 'consumivel' },
  { key: 'incensoQueimado', name: 'Incenso Queimado', id: 102501, categoria: 'consumivel' },

  // === ITENS RIFA 14 ===
  { key: 'pedraSelamentoDourada', name: 'Pedra de Selamento Dourada', id: 52058, categoria: 'consumivel' },
  { key: 'dogao', name: 'Dogão', id: 101900, categoria: 'consumivel' },
  { key: 'bencaoTyr', name: 'Bênção de Tyr', id: 14601, categoria: 'consumivel' },
  { key: 'caixinhaNoiteFeliz', name: 'Caixinha Noite Feliz', id: 2784, categoria: 'consumivel' },
  { key: 'sucoGato', name: 'Suco de Gato', id: 12298, categoria: 'consumivel' },
]

async function updateSupabase(data: Record<string, unknown>): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rifa_prices?on_conflict=item_key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(data)
    })
    return response.ok
  } catch {
    return false
  }
}

async function fetchMarketPrice(itemId: number): Promise<{ price: number; avgPrice: number; sellers: number } | null> {
  if (itemId === 0) return null // ID não mapeado ainda
  
  try {
    const response = await fetch(`https://api.ragnatales.com.br/market/item/shopping?nameid=${itemId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    if (!data || data.length === 0) return null
    
    const prices = data.map((d: { price: number }) => d.price).sort((a: number, b: number) => a - b)
    const minPrice = prices[0]
    const top5 = prices.slice(0, Math.min(5, prices.length))
    const avgPrice = Math.round(top5.reduce((a: number, b: number) => a + b, 0) / top5.length)
    
    return { price: minPrice, avgPrice, sellers: data.length }
  } catch {
    return null
  }
}

export async function POST(): Promise<Response> {
  const results = {
    success: 0,
    failed: 0,
    noId: 0,
    noSales: 0,
    errors: [] as string[]
  }

  // Filtra apenas itens com ID mapeado
  const itemsWithId = RIFA_ITEMS.filter(item => item.id > 0)
  const itemsWithoutId = RIFA_ITEMS.filter(item => item.id === 0)
  
  results.noId = itemsWithoutId.length

  // Processa em lotes de 5 para não sobrecarregar
  const batchSize = 5
  
  for (let i = 0; i < itemsWithId.length; i += batchSize) {
    const batch = itemsWithId.slice(i, i + batchSize)
    
    await Promise.all(batch.map(async (item) => {
      try {
        const priceData = await fetchMarketPrice(item.id)
        
        if (priceData) {
          const updated = await updateSupabase({
            item_key: item.key,
            item_name: item.name,
            item_id: item.id,
            price: priceData.price,
            avg_price: priceData.avgPrice,
            categoria: item.categoria,
            sellers: priceData.sellers,
            updated_at: new Date().toISOString()
          })
          
          if (updated) {
            results.success++
          } else {
            results.failed++
          }
        } else {
          results.noSales++
        }
      } catch (error) {
        results.failed++
        results.errors.push(`${item.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }))
    
    // Pequena pausa entre lotes
    await new Promise(r => setTimeout(r, 500))
  }

  return NextResponse.json({
    message: `Sincronizados ${results.success} itens de rifa`,
    success: results.success,
    noSales: results.noSales,
    noId: results.noId,
    failed: results.failed,
    errors: results.errors.slice(0, 5)
  })
}

// GET para ver lista de itens e seus IDs
export async function GET(): Promise<Response> {
  const itemsWithId = RIFA_ITEMS.filter(item => item.id > 0)
  const itemsWithoutId = RIFA_ITEMS.filter(item => item.id === 0)
  
  return NextResponse.json({
    total: RIFA_ITEMS.length,
    mapeados: itemsWithId.length,
    pendentes: itemsWithoutId.length,
    itens: RIFA_ITEMS.map(item => ({
      key: item.key,
      name: item.name,
      id: item.id,
      mapeado: item.id > 0
    }))
  })
}
