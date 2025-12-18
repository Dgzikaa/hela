import { NextResponse } from 'next/server'

const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

const ITEMS_TO_SYNC = [
  // === PÓS DE METEORITA ===
  { key: 'po_meteorita_escarlate', id: 1000398, name: 'Pó de Meteorita Escarlate', categoria: 'material' },
  { key: 'po_meteorita_solar', id: 1000399, name: 'Pó de Meteorita Solar', categoria: 'material' },
  { key: 'po_meteorita_verdejante', id: 1000400, name: 'Pó de Meteorita Verdejante', categoria: 'material' },
  { key: 'po_meteorita_celeste', id: 1000401, name: 'Pó de Meteorita Celeste', categoria: 'material' },
  { key: 'po_meteorita_oceanica', id: 1000402, name: 'Pó de Meteorita Oceânica', categoria: 'material' },
  { key: 'po_meteorita_crepuscular', id: 1000403, name: 'Pó de Meteorita Crepuscular', categoria: 'material' },

  // === MATERIAIS DE CRAFT ===
  { key: 'alma_sombria', id: 25986, name: 'Alma Sombria', categoria: 'material' },
  { key: 'bencao_ferreiro', id: 6226, name: 'Bênção do Ferreiro', categoria: 'material' },
  { key: 'bencao_mestre_ferreiro', id: 6225, name: 'Bênção do Mestre-Ferreiro', categoria: 'material' },
  { key: 'desmembrador_quimico', id: 1000389, name: 'Desmembrador Químico', categoria: 'material' },

  // === EQUIPAMENTOS PARA PREÇO ===
  { key: 'aura_mente_corrompida', id: 19439, name: 'Aura da Mente Corrompida', categoria: 'equip' },
  { key: 'manto_abstrato', id: 20986, name: 'Manto Abstrato', categoria: 'equip' },
  { key: 'livro_perverso', id: 540042, name: 'Livro Perverso', categoria: 'equip' },
  { key: 'garra_ferro', id: 1837, name: 'Garra de Ferro', categoria: 'equip' },
  { key: 'jack_estripadora', id: 28767, name: 'Jack Estripadora', categoria: 'equip' },
  { key: 'mascara_nobreza', id: 5985, name: 'Máscara da Nobreza', categoria: 'equip' },
  { key: 'livro_amaldicoado', id: 18752, name: 'Livro Amaldiçoado', categoria: 'equip' },
  { key: 'quepe_general', id: 19379, name: 'Quepe do General', categoria: 'equip' },
  { key: 'chapeu_maestro', id: 5905, name: 'Chapéu de Maestro', categoria: 'equip' },
  { key: 'botas_capricornio', id: 470010, name: 'Botas de Capricórnio', categoria: 'equip' },
  { key: 'palheta_elunium', id: 490141, name: 'Palheta de Elunium', categoria: 'equip' },
  { key: 'luvas_corrida', id: 2935, name: 'Luvas de Corrida', categoria: 'equip' },

  // === CONSUMÍVEIS DE BUFF ===
  { key: 'pocao_furor_fisico', id: 12418, name: 'Poção de Furor Físico', categoria: 'consumivel' },
  { key: 'pocao_furor_magico', id: 12419, name: 'Poção de Furor Mágico', categoria: 'consumivel' },
  { key: 'pocao_grande_hp', id: 14536, name: 'Poção Grande de HP', categoria: 'consumivel' },
  { key: 'pocao_grande_sp', id: 14537, name: 'Poção Grande de SP', categoria: 'consumivel' },
  { key: 'salada_frutas_tropicais', id: 12247, name: 'Salada de Frutas Tropicais', categoria: 'consumivel' },
  { key: 'biscoito_natalino', id: 2784, name: 'Biscoito Natalino', categoria: 'consumivel' },
  { key: 'suco_gato', id: 12298, name: 'Suco de Gato', categoria: 'consumivel' },
  { key: 'cozido_imortal', id: 12085, name: 'Cozido Imortal', categoria: 'consumivel' },
  { key: 'bencao_tyr', id: 14601, name: 'Benção de Tyr', categoria: 'consumivel' },
  { key: 'suco_celular_enriquecido', id: 12437, name: 'Suco Celular Enriquecido', categoria: 'consumivel' },
  { key: 'ativador_erva_vermelha', id: 100232, name: 'Ativador de Erva Vermelha', categoria: 'consumivel' },
  
  // === POÇÕES DE USO ===
  { key: 'pocao_dourada_concentrada', id: 12424, name: 'Poção Dourada Concentrada', categoria: 'consumivel' },
  { key: 'pocao_branca', id: 547, name: 'Poção Branca', categoria: 'consumivel' },
  { key: 'pocao_azul_concentrada', id: 1100004, name: 'Poção Azul Concentrada', categoria: 'consumivel' },
  
  // === ITENS ESPECIAIS ===
  { key: 'amuleto_ziegfried', id: 7621, name: 'Amuleto de Ziegfried', categoria: 'consumivel' },
  { key: 'goma_bolha', id: 25006, name: 'Goma de Bolha', categoria: 'cash' },
  { key: 'pergaminho_eden', id: 14584, name: 'Pergaminho do Éden', categoria: 'consumivel' },
  
  // === ENTRADAS DE DUNGEON ===
  { key: 'amago', id: 25981, name: 'Âmago', categoria: 'material' },
  { key: 'amago_sombrio', id: 25981, name: 'Âmago Sombrio', categoria: 'material' },
  { key: 'alma_condensada', id: 25987, name: 'Alma Condensada', categoria: 'material' },
  
  // === THANATOS ===
  { key: 'pocao_arvore_envenenada', id: 17632, name: 'Poção da Árvore Envenenada Diluída', categoria: 'consumivel' },
  { key: 'fragmento_maldicao', id: 1222000, name: 'Fragmento da Maldição', categoria: 'material' },
  { key: 'essencia_thanatos', id: 1222012, name: 'Essência de Thanatos', categoria: 'drop_raro' },
  
  // === DROPS PARA VENDA ===
  { key: 'verus_drop', id: 25317, name: 'Giroparafuso Rígido', categoria: 'drop_npc' },
  { key: 'rossata_stone', id: 7444, name: 'Fragment of Rossata Stone', categoria: 'drop_npc' },
]

async function updateSupabase(data: Record<string, unknown>) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/market_prices?on_conflict=item_key`, {
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
  try {
    const response = await fetch(`https://api.ragnatales.com.br/market/item/shopping?nameid=${itemId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    if (!data || data.length === 0) {
      return null
    }
    
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
    noSales: 0,
    errors: [] as string[]
  }

  // Processa em lotes de 5 para não sobrecarregar
  const batchSize = 5
  
  for (let i = 0; i < ITEMS_TO_SYNC.length; i += batchSize) {
    const batch = ITEMS_TO_SYNC.slice(i, i + batchSize)
    
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
          // Sem vendas no market
          await updateSupabase({
            item_key: item.key,
            item_name: item.name,
            item_id: item.id,
            price: 0,
            avg_price: 0,
            categoria: item.categoria,
            sellers: 0,
            updated_at: new Date().toISOString()
          })
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
    message: `Sincronizados ${results.success} itens do mercado`,
    success: results.success,
    noSales: results.noSales,
    failed: results.failed,
    errors: results.errors.slice(0, 5) // Só mostra os 5 primeiros erros
  })
}
