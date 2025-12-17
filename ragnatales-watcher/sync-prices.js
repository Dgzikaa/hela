const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4';

// ============================================
// ITENS PARA SINCRONIZAR
// Para adicionar um novo item:
// 1. Acesse https://ragnatales.com.br/db/items/NUMERO
// 2. Pegue o ID do item na URL
// 3. Adicione aqui com uma key única
// ============================================

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
];

// Runas
const RUNAS = [
    { id: 17917, name: 'Runa Ruby da Celia' },
    { id: 17918, name: 'Runa Ruby da Gertie' },
    { id: 17919, name: 'Runa Ruby do Alphoccio' },
    { id: 17920, name: 'Runa Ruby da Tretini' },
    { id: 17921, name: 'Runa Ruby do Randel' },
    { id: 17922, name: 'Runa Safira da Celia' },
    { id: 17923, name: 'Runa Safira da Gertie' },
    { id: 17924, name: 'Runa Safira do Alphoccio' },
    { id: 17925, name: 'Runa Safira do Flamel' },
    { id: 17926, name: 'Runa Safira da Tretini' },
    { id: 17927, name: 'Runa Topazio da Celia' },
    { id: 17928, name: 'Runa Topazio da Gertie' },
    { id: 17929, name: 'Runa Topazio do Chen' },
    { id: 17930, name: 'Runa Topazio da Tretini' },
    { id: 17931, name: 'Runa Topazio do Alphoccio' },
    { id: 17932, name: 'Runa Ametista do Alphoccio' },
    { id: 17933, name: 'Runa Ametista do Randel' },
    { id: 17934, name: 'Runa Ametista do Chen' },
    { id: 17935, name: 'Runa Ametista do Flamel' },
    { id: 17936, name: 'Runa Ametista da Gertie' },
    { id: 17937, name: 'Runa Jade do Alphoccio' },
    { id: 17938, name: 'Runa Jade do Chen' },
    { id: 17939, name: 'Runa Jade do Flamel' },
    { id: 17940, name: 'Runa Jade da Tretini' },
    { id: 17941, name: 'Runa Jade da Gertie' },
    { id: 17942, name: 'Runa Citrina do Alphoccio' },
    { id: 17943, name: 'Runa Citrina do Randel' },
    { id: 17944, name: 'Runa Citrina do Chen' },
    { id: 17945, name: 'Runa Citrina da Gertie' },
    { id: 17946, name: 'Runa Citrina do Flamel' },
];

function formatZeny(value) {
    if (value >= 1000000000) return (value / 1000000000).toFixed(2) + 'B';
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return Math.round(value / 1000) + 'K';
    return value.toLocaleString('pt-BR');
}

async function updateSupabase(table, data) {
    try {
        // Usa UPSERT com on_conflict na coluna única (item_key para market_prices, runa_id para runa_prices)
        const conflictColumn = table === 'market_prices' ? 'item_key' : 'runa_id';
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${conflictColumn}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const text = await response.text();
            console.log(`   ⚠️ Supabase ${table}: ${response.status} - ${text.slice(0, 100)}`);
        }
        return response.ok;
    } catch (error) {
        console.log(`   ⚠️ Erro Supabase: ${error.message}`);
        return false;
    }
}

async function syncPrices() {
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║  🔄 SINCRONIZANDO PREÇOS COM SUPABASE             ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    let browser;
    let page;

    try {
        // Inicia browser
        console.log('🌐 Iniciando navegador...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Acessa o market para passar pelo Cloudflare
        console.log('🔑 Passando pelo Cloudflare...');
        await page.goto('https://ragnatales.com.br/market', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 3000));
        console.log('✅ Cloudflare OK!\n');

        // Sincroniza itens gerais
        console.log('📦 Sincronizando itens...');
        let successCount = 0;
        let noSalesCount = 0;
        
        for (const item of ITEMS_TO_SYNC) {
            try {
                const url = `https://api.ragnatales.com.br/market/item/shopping?nameid=${item.id}`;
                const response = await page.evaluate(async (url) => {
                    const res = await fetch(url);
                    return res.json();
                }, url);

                if (response && response.length > 0) {
                    const prices = response.map(d => d.price).sort((a, b) => a - b);
                    const minPrice = prices[0]; // Menor preço
                    const top5 = prices.slice(0, Math.min(5, prices.length));
                    const avgPrice = Math.round(top5.reduce((a, b) => a + b, 0) / top5.length);

                    // Atualiza no Supabase com menor preço e média
                    const updated = await updateSupabase('market_prices', {
                        item_key: item.key,
                        item_name: item.name,
                        item_id: item.id,
                        price: minPrice, // Usar menor preço
                        avg_price: avgPrice,
                        categoria: item.categoria || 'outros',
                        sellers: response.length,
                        updated_at: new Date().toISOString()
                    });

                    if (updated) {
                        console.log(`   ✓ ${item.name}: ${formatZeny(minPrice)} (${response.length} vendedores)`);
                        successCount++;
                    }
                } else {
                    console.log(`   - ${item.name}: sem vendas no market`);
                    noSalesCount++;
                    
                    // Salva como sem vendas (preço 0) para saber que foi checado
                    await updateSupabase('market_prices', {
                        item_key: item.key,
                        item_name: item.name,
                        item_id: item.id,
                        price: 0,
                        avg_price: 0,
                        categoria: item.categoria || 'outros',
                        sellers: 0,
                        updated_at: new Date().toISOString()
                    });
                }

                await new Promise(r => setTimeout(r, 300));
            } catch (error) {
                console.log(`   ⚠️ ${item.name}: erro - ${error.message}`);
            }
        }

        // Sincroniza runas
        console.log('\n🧬 Sincronizando runas...');
        let runaCount = 0;

        for (const runa of RUNAS) {
            try {
                const url = `https://api.ragnatales.com.br/market/item/shopping?nameid=${runa.id}`;
                const response = await page.evaluate(async (url) => {
                    const res = await fetch(url);
                    return res.json();
                }, url);

                if (response && response.length > 0) {
                    const prices = response.map(d => d.price).sort((a, b) => a - b);
                    const minPrice = prices[0];
                    const top5 = prices.slice(0, Math.min(5, prices.length));
                    const avgPrice = Math.round(top5.reduce((a, b) => a + b, 0) / top5.length);

                    const updated = await updateSupabase('runa_prices', {
                        runa_id: runa.id,
                        runa_name: runa.name,
                        price: minPrice,
                        avg_price: avgPrice,
                        sellers: response.length,
                        updated_at: new Date().toISOString()
                    });

                    if (updated) {
                        runaCount++;
                    }
                }

                await new Promise(r => setTimeout(r, 200));
            } catch (error) {
                // silencioso
            }
        }

        console.log(`   ✓ ${runaCount} runas atualizadas`);

        console.log(`\n✅ Sincronização concluída!`);
        console.log(`   📦 ${successCount}/${ITEMS_TO_SYNC.length} itens com preço`);
        console.log(`   ❌ ${noSalesCount} itens sem vendas`);
        console.log(`   🧬 ${runaCount}/${RUNAS.length} runas`);
        console.log(`   🕐 ${new Date().toLocaleString('pt-BR')}\n`);

    } catch (error) {
        console.error('❌ Erro na sincronização:', error.message);
    } finally {
        if (browser) await browser.close();
    }
}

// Exporta a lista de itens para outros módulos
module.exports = { syncPrices, ITEMS_TO_SYNC, RUNAS };

// Se executado diretamente
if (require.main === module) {
    syncPrices();
}
