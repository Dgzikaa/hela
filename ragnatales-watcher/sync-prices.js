const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4';

// Itens para sincronizar
const ITEMS_TO_SYNC = [
    { key: 'poEscarlate', id: 1000398, name: 'Pó de Meteorita Escarlate' },
    { key: 'poSolar', id: 1000399, name: 'Pó de Meteorita Solar' },
    { key: 'poVerdejante', id: 1000400, name: 'Pó de Meteorita Verdejante' },
    { key: 'poCeleste', id: 1000401, name: 'Pó de Meteorita Celeste' },
    { key: 'poOceanica', id: 1000402, name: 'Pó de Meteorita Oceânica' },
    { key: 'poCrepuscular', id: 1000403, name: 'Pó de Meteorita Crepuscular' },
    { key: 'almaSombria', id: 25986, name: 'Alma Sombria' },
    { key: 'bencaoFerreiro', id: 6226, name: 'Bênção do Ferreiro' },
    { key: 'bencaoMestreFerreiro', id: 6225, name: 'Bênção do Mestre-Ferreiro' },
    { key: 'desmembrador', id: 1000389, name: 'Desmembrador Químico' },
    { key: 'auraMente', id: 19439, name: 'Aura da Mente Corrompida' },
    { key: 'mantoAbstrato', id: 20986, name: 'Manto Abstrato' },
    { key: 'livroPerverso', id: 540042, name: 'Livro Perverso' },
    { key: 'garraFerro', id: 1837, name: 'Garra de Ferro' },
    { key: 'jackEstripadora', id: 28767, name: 'Jack Estripadora' },
    { key: 'mascaraNobreza', id: 5985, name: 'Máscara da Nobreza' },
    { key: 'livroAmaldicoado', id: 18752, name: 'Livro Amaldiçoado' },
    { key: 'quepeGeneral', id: 19379, name: 'Quepe do General' },
    { key: 'chapeuMaestro', id: 5905, name: 'Chapéu de Maestro' },
    { key: 'botasCapricornio', id: 470010, name: 'Botas de Capricórnio' },
    { key: 'palhetaElunium', id: 490141, name: 'Palheta de Elunium' },
    { key: 'luvasCorrida', id: 2935, name: 'Luvas de Corrida' },
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
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(data)
        });
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
        
        for (const item of ITEMS_TO_SYNC) {
            try {
                const url = `https://api.ragnatales.com.br/market/item/shopping?nameid=${item.id}`;
                const response = await page.evaluate(async (url) => {
                    const res = await fetch(url);
                    return res.json();
                }, url);

                if (response && response.length > 0) {
                    const prices = response.map(d => d.price).sort((a, b) => a - b);
                    const top5 = prices.slice(0, Math.min(5, prices.length));
                    const avgPrice = Math.round(top5.reduce((a, b) => a + b, 0) / top5.length);

                    // Atualiza no Supabase
                    const updated = await updateSupabase('market_prices', {
                        item_key: item.key,
                        item_name: item.name,
                        item_id: item.id,
                        price: avgPrice,
                        sellers: response.length,
                        updated_at: new Date().toISOString()
                    });

                    if (updated) {
                        console.log(`   ✓ ${item.name}: ${formatZeny(avgPrice)}`);
                        successCount++;
                    }
                } else {
                    console.log(`   - ${item.name}: sem vendas`);
                }

                await new Promise(r => setTimeout(r, 300));
            } catch (error) {
                console.log(`   ⚠️ ${item.name}: erro`);
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
                    const top5 = prices.slice(0, Math.min(5, prices.length));
                    const avgPrice = Math.round(top5.reduce((a, b) => a + b, 0) / top5.length);

                    const updated = await updateSupabase('runa_prices', {
                        runa_id: runa.id,
                        runa_name: runa.name,
                        price: avgPrice,
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
        console.log(`   📦 ${successCount}/${ITEMS_TO_SYNC.length} itens`);
        console.log(`   🧬 ${runaCount}/${RUNAS.length} runas`);
        console.log(`   🕐 ${new Date().toLocaleString('pt-BR')}\n`);

    } catch (error) {
        console.error('❌ Erro na sincronização:', error.message);
    } finally {
        if (browser) await browser.close();
    }
}

// Executa
syncPrices();

// Exporta para uso no watcher
module.exports = { syncPrices };

