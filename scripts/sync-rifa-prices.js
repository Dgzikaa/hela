/**
 * Script para sincronizar preços dos itens de rifa
 * Usa Puppeteer para contornar o Cloudflare
 * 
 * Uso: node sync-rifa-prices.js
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4';

// Itens das rifas com seus IDs
const RIFA_ITEMS = [
  // === PALITOS ===
  { key: 'palitosBaunilha', name: 'Palitos de Baunilha', id: 14618 },
  { key: 'palitosLaranja', name: 'Palitos de Laranja', id: 14616 },
  { key: 'palitosCassis', name: 'Palitos de Cassis', id: 14619 },
  { key: 'palitosChocolate', name: 'Palitos de Chocolate', id: 14617 },
  { key: 'palitosLimao', name: 'Palitos de Limão', id: 14620 },
  { key: 'palitosMorango', name: 'Palitos de Morango', id: 14621 },

  // === PERGAMINHOS E POÇÕES ===
  { key: 'pergaminhoEsquiva', name: 'Pergaminho de Esquiva', id: 14530 },
  { key: 'pocaoFurorFisico', name: 'Poção do Furor Físico', id: 12418 },
  { key: 'caliceIlusao', name: 'Cálice da Ilusão', id: 14538 },
  { key: 'pocaoFurorMagico', name: 'Poção do Furor Mágico', id: 12419 },
  { key: 'pocaoRegeneracao', name: 'Poção de Regeneração', id: 12461 },
  { key: 'pergaminhoPrecisao', name: 'Pergaminho de Precisão', id: 14531 },
  { key: 'acaraje', name: 'Acarajé', id: 12375 },
  { key: 'abrasivo', name: 'Abrasivo', id: 14536 },

  // === RIFA 4 ===
  { key: 'medicinaMilagrosa', name: 'Medicina Milagrosa', id: 12259 },
  { key: 'pergaminhoEden', name: 'Pergaminho do Éden', id: 17721 },

  // === RIFA 5 ===
  { key: 'espelhoConvexo', name: 'Espelho Convexo', id: 12214 },
  { key: 'amuletoZiegfried', name: 'Amuleto de Ziegfried', id: 7621 },

  // === CAIXA AUXILIARES A ===
  { key: 'frascosBombaDourado', name: 'Frasco de Bomba Dourado', id: 17620 },
  { key: 'frascosRevestimentoDourado', name: 'Frasco de Revestimento Dourado', id: 17619 },
  { key: 'pedraDourada', name: 'Pedra Dourada', id: 52011 },
  { key: 'pergaminhoDourado', name: 'Pergaminho Dourado', id: 52009 },
  { key: 'gemaAmarelaDourada', name: 'Gema Amarela Dourada', id: 102509 },
  { key: 'gemaVermelhoDourada', name: 'Gema Vermelha Dourada', id: 102510 },
  { key: 'gemaAzulDourada', name: 'Gema Azul Dourada', id: 102511 },

  // === CONVERSORES ETÉREOS ===
  { key: 'conversorFantasma', name: 'Conversor Elemental Fantasma', id: 102502 },
  { key: 'pergaminhoAspersio', name: 'Pergaminho de Aspersio', id: 12928 },

  // === CONSUMÍVEIS DOURADOS ===
  { key: 'pocaoAgilidadeDourada', name: 'Poção de Agilidade Dourada', id: 102503 },
  { key: 'panaceiaDourada', name: 'Panacéia Dourada', id: 52047 },
  { key: 'doceElviraDourado', name: 'Doce de Elvira Dourado', id: 52045 },
  { key: 'folhaYggdrasilDourada', name: 'Folha de Yggdrasil Dourada', id: 52046 },
  { key: 'pocaoAntiElementoDourada', name: 'Poção Anti-Elemento Dourada', id: 52048 },
  { key: 'conversorRemovedorDourado', name: 'Conversor Removedor Dourado', id: 52063 },

  // === DOCE DE ELVIRA ===
  { key: 'doceElvira', name: 'Doce de Elvira', id: 23044 },

  // === RIFA 8 ===
  { key: 'pocaoGuyak', name: 'Poção de Guyak', id: 12710 },
  { key: 'pocaoVento', name: 'Poção do Vento', id: 12016 },

  // === TROUXINHA DE COMIDAS ===
  { key: 'saladaFrutasTropicais', name: 'Salada de Frutas Tropicais', id: 12247 },
  { key: 'linguaVapor', name: 'Língua no Vapor', id: 12075 },
  { key: 'escorpioesVapor', name: 'Escorpiões do Deserto no Vapor', id: 12090 },
  { key: 'cozidoImortal', name: 'Cozido Imortal', id: 12085 },
  { key: 'coquetelSoproDragao', name: 'Coquetel Sopro do Dragão', id: 12080 },
  { key: 'tonicoHwergelmir', name: 'Tônico de Hwergelmir', id: 12095 },
  { key: 'noveCaudasCozidas', name: 'Nove Caudas Cozidas', id: 12100 },

  // === MUNIÇÕES DOURADAS ===
  { key: 'kunaiDourada', name: 'Kunai Dourada', id: 17616 },
  { key: 'flechaDourada', name: 'Flecha Dourada', id: 17614 },
  { key: 'projetilDourado', name: 'Projétil Dourado', id: 17617 },
  { key: 'shurikenDourada', name: 'Shuriken Dourada', id: 17615 },
  { key: 'capsulaDourada', name: 'Cápsula Dourada', id: 52010 },

  // === CONVERSORES ELEMENTAIS ===
  { key: 'conversorAgua', name: 'Conversor Elemental Água', id: 12115 },
  { key: 'conversorFogo', name: 'Conversor Elemental Fogo', id: 12114 },
  { key: 'conversorTerra', name: 'Conversor Elemental Terra', id: 12116 },
  { key: 'conversorVento', name: 'Conversor Elemental Vento', id: 12117 },
  { key: 'conversorRemovedor', name: 'Conversor Removedor Elemental', id: 102504 },

  // === AUXILIARES B ===
  { key: 'garrafaVenenoDourada', name: 'Garrafa de Veneno Dourada', id: 17618 },
  { key: 'kitToxinasDouradas', name: 'Kit de Toxinas Douradas', id: 102508 },
  { key: 'bolsaFalsaZenysDourada', name: 'Bolsa Falsa de Zenys Dourada', id: 17613 },
  { key: 'armadilhaDourada', name: 'Armadilha Dourada', id: 52053 },
  { key: 'esporoCogumeloDourado', name: 'Esporo de Cogumelo Dourado', id: 52059 },
  { key: 'sementeSelvagemDourada', name: 'Semente Selvagem Dourada', id: 52061 },
  { key: 'sementeSanguessugaDourada', name: 'Semente Sanguessuga Dourada', id: 52062 },

  // === SUPRIMENTOS CLASSE ===
  { key: 'garrafaVeneno', name: 'Garrafa de Veneno', id: 678 },
  { key: 'frascoFogoGrego', name: 'Frasco de Fogo Grego', id: 7135 },
  { key: 'frascoAcido', name: 'Frasco de Ácido', id: 7136 },
  { key: 'frascoRevestimento', name: 'Frasco de Revestimento', id: 7139 },

  // === INGREDIENTES DOURADOS ===
  { key: 'tuboEnsaioDourado', name: 'Tubo de Ensaio Dourado', id: 52056 },
  { key: 'garrafaVaziaDourada', name: 'Garrafa Vazia Dourada', id: 52055 },
  { key: 'garrafaPocaoDourada', name: 'Garrafa de Poção Dourada', id: 52057 },
  { key: 'vasilhaMisturaDourada', name: 'Vasilha de Mistura Dourada', id: 52054 },

  // === XAROPES ===
  { key: 'xaropeAzul', name: 'Xarope Azul', id: 11624 },
  { key: 'xaropeVermelho', name: 'Xarope Vermelho', id: 11621 },
  { key: 'xaropeBranco', name: 'Xarope Branco', id: 11623 },
  { key: 'xaropeAmarelo', name: 'Xarope Amarelo', id: 11622 },

  // === RIFA 13 ===
  { key: 'pocaoMental', name: 'Poção Mental', id: 14600 },
  { key: 'incensoQueimado', name: 'Incenso Queimado', id: 102501 },

  // === RIFA 14 ===
  { key: 'pedraSelamentoDourada', name: 'Pedra de Selamento Dourada', id: 52058 },
  { key: 'dogao', name: 'Dogão', id: 101900 },
  { key: 'bencaoTyr', name: 'Bênção de Tyr', id: 14601 },
  { key: 'caixinhaNoiteFeliz', name: 'Caixinha Noite Feliz', id: 2784 },
  { key: 'sucoGato', name: 'Suco de Gato', id: 12298 },
];

// Remove outliers usando IQR
function removeOutliers(prices) {
    if (prices.length < 4) return prices;
    
    const sorted = [...prices].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    const upperLimit = q3 + (iqr * 1.5);
    return sorted.filter(p => p <= upperLimit);
}

async function saveToSupabase(items) {
    console.log('\n📤 Salvando no Supabase...');
    
    for (const item of items) {
        try {
            // Upsert no Supabase
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rifa_prices`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    item_key: item.key,
                    item_name: item.name,
                    item_id: item.id,
                    price: item.minPrice || 0,
                    avg_price: item.avgPrice || 0,
                    sellers: item.sellers || 0,
                    updated_at: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                console.log(`   ✅ ${item.name}`);
            } else {
                const error = await response.text();
                console.log(`   ❌ ${item.name}: ${error}`);
            }
        } catch (err) {
            console.log(`   ❌ ${item.name}: ${err.message}`);
        }
    }
}

async function syncPrices() {
    console.log('🚀 Sincronizando preços dos itens de rifa...\n');
    console.log(`📦 Total de itens: ${RIFA_ITEMS.length}\n`);
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Passa pelo Cloudflare
    console.log('📡 Conectando ao RagnaTales...');
    await page.goto('https://ragnatales.com.br/market', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
    });
    await new Promise(r => setTimeout(r, 3000));
    console.log('✅ Conectado!\n');
    
    const results = [];
    let success = 0;
    let noSales = 0;
    let errors = 0;
    
    for (let i = 0; i < RIFA_ITEMS.length; i++) {
        const item = RIFA_ITEMS[i];
        const progress = `[${i + 1}/${RIFA_ITEMS.length}]`;
        
        try {
            // 1. Busca dados de venda via API
            const shopData = await page.evaluate(async (id) => {
                try {
                    const response = await fetch(`https://api.ragnatales.com.br/market/item/shopping?nameid=${id}`);
                    return await response.json();
                } catch {
                    return [];
                }
            }, item.id);
            
            // 2. Navega para a página do item para pegar média 45 dias
            await page.goto(`https://ragnatales.com.br/db/items/${item.id}`, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            await new Promise(r => setTimeout(r, 1500));
            
            // 3. Extrai média 45 dias
            const pageData = await page.evaluate(() => {
                const body = document.body.innerText;
                const avgMatch = body.match(/Média de preço deste item é de ([\d.,]+)\s*zenys/i);
                let avg45days = null;
                if (avgMatch) {
                    avg45days = parseInt(avgMatch[1].replace(/\./g, '').replace(',', '.'));
                }
                return { avg45days };
            });
            
            // Processa dados
            let minPrice = 0, sellers = 0;
            
            if (Array.isArray(shopData) && shopData.length > 0) {
                const allPrices = shopData.map(d => d.price).sort((a, b) => a - b);
                const cleanPrices = removeOutliers(allPrices);
                minPrice = cleanPrices[0] || allPrices[0];
                sellers = shopData.length;
            }
            
            const avgPrice = pageData.avg45days || minPrice || 0;
            
            if (avgPrice > 0 || minPrice > 0) {
                results.push({
                    key: item.key,
                    name: item.name,
                    id: item.id,
                    minPrice,
                    avgPrice,
                    sellers
                });
                success++;
                console.log(`${progress} ✅ ${item.name}`);
                console.log(`    💰 Mín: ${minPrice > 0 ? minPrice.toLocaleString() + 'z' : 'N/A'} | Média 45d: ${avgPrice > 0 ? avgPrice.toLocaleString() + 'z' : 'N/A'}`);
            } else {
                noSales++;
                console.log(`${progress} ⚠️  ${item.name} - Sem vendas/dados`);
                results.push({
                    key: item.key,
                    name: item.name,
                    id: item.id,
                    minPrice: 0,
                    avgPrice: 0,
                    sellers: 0
                });
            }
            
        } catch (error) {
            errors++;
            console.log(`${progress} ❌ ${item.name}: ${error.message}`);
            results.push({
                key: item.key,
                name: item.name,
                id: item.id,
                minPrice: 0,
                avgPrice: 0,
                sellers: 0
            });
        }
        
        // Delay entre requisições
        await new Promise(r => setTimeout(r, 500));
    }
    
    await browser.close();
    
    // Salva no Supabase
    if (results.length > 0) {
        await saveToSupabase(results);
    }
    
    console.log('\n════════════════════════════════════════');
    console.log('📊 RESUMO DA SINCRONIZAÇÃO');
    console.log('════════════════════════════════════════');
    console.log(`✅ Com preços: ${success}`);
    console.log(`⚠️  Sem vendas: ${noSales}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📦 Total: ${RIFA_ITEMS.length}`);
    console.log('\n✅ Sincronização concluída!');
}

syncPrices().catch(console.error);
