const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

// Remove outliers usando IQR (Interquartile Range)
function removeOutliers(prices) {
    if (prices.length < 4) return prices;
    
    const sorted = [...prices].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    // Limite superior: Q3 + 1.5 * IQR
    const upperLimit = q3 + (iqr * 1.5);
    
    // Remove valores acima do limite
    const filtered = sorted.filter(p => p <= upperLimit);
    
    // Se removeu demais, usa a mediana * 3 como fallback
    if (filtered.length < sorted.length * 0.5) {
        const median = sorted[Math.floor(sorted.length / 2)];
        return sorted.filter(p => p <= median * 3);
    }
    
    return filtered;
}

// Lista de itens para monitorar (nameid extraído das URLs)
const nameids = [
    25981,   // Âmago Sombrio
    25986,   // Alma Sombria
    1000401, // Pó de Meteorita Celeste
    1000403, // Pó de Meteorita Crepuscular
    1000398, // Pó de Meteorita Escarlate
    1000402, // Pó de Meteorita Oceânica
    1000399, // Pó de Meteorita Solar
    1000400, // Pó de Meteorita Verdejante
    25026,   // Essência de Batalha Concentrada
    1000445, 1000447, 1000442, 1000446, 1000443, 1000444,
    25006    // Sacola de Cash
];

async function fetchItems() {
    console.log('🚀 Buscando informações dos itens (com média de 45 dias)...\n');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Primeiro, passa pelo Cloudflare
    console.log('📡 Conectando ao RagnaTales...');
    await page.goto('https://ragnatales.com.br/market', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
    });
    await new Promise(r => setTimeout(r, 3000));
    console.log('✅ Conectado!\n');
    
    const items = [];
    
    for (const nameid of nameids) {
        try {
            // 1. Busca dados de venda atual via API
            const shopData = await page.evaluate(async (id) => {
                const response = await fetch(`https://api.ragnatales.com.br/market/item/shopping?nameid=${id}`);
                return await response.json();
            }, nameid);
            
            // 2. Navega para /db/items/ para pegar a média de 45 dias
            await page.goto(`https://ragnatales.com.br/db/items/${nameid}`, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            await new Promise(r => setTimeout(r, 2000));
            
            // 3. Extrai a média de 45 dias do texto da página
            const pageData = await page.evaluate(() => {
                const body = document.body.innerText;
                
                // Procura pelo texto "A Média de preço deste item é de X zenys nos últimos 45 dias"
                const avgMatch = body.match(/Média de preço deste item é de ([\d.,]+)\s*zenys/i);
                let avg45days = null;
                if (avgMatch) {
                    // Remove pontos de milhar (9.495 -> 9495)
                    avg45days = parseInt(avgMatch[1].replace(/\./g, '').replace(',', '.'));
                }
                
                // Pega o nome do item
                const nameMatch = body.match(/^([^\n]+)/);
                const title = nameMatch ? nameMatch[1].trim() : null;
                
                return { avg45days, title };
            });
            
            // Dados de venda atual (removendo outliers)
            let minPrice = 0, maxPrice = 0, sellers = 0, itemName = `Item ${nameid}`, outliersCount = 0;
            
            if (Array.isArray(shopData) && shopData.length > 0) {
                const allPrices = shopData.map(d => d.price).sort((a, b) => a - b);
                const cleanPrices = removeOutliers(allPrices);
                outliersCount = allPrices.length - cleanPrices.length;
                
                minPrice = allPrices[0]; // Menor real
                maxPrice = cleanPrices[cleanPrices.length - 1]; // Maior sem outliers
                sellers = cleanPrices.length;
                itemName = shopData[0].name;
            }
            
            // Preço de referência: usa média de 45 dias se disponível
            const referencePrice = pageData.avg45days || 0;
            
            if (referencePrice > 0 || sellers > 0) {
                items.push({
                    nameid: nameid,
                    name: itemName,
                    referencePrice: referencePrice || minPrice,
                    avg45days: pageData.avg45days,
                    currentMin: minPrice,
                    sellers: sellers,
                    enabled: referencePrice > 0
                });
                
                console.log(`✅ ${itemName} (${nameid})`);
                console.log(`   📊 Média 45 dias: ${pageData.avg45days ? pageData.avg45days.toLocaleString() + 'z' : 'N/A'}`);
                console.log(`   💰 Menor atual: ${minPrice > 0 ? minPrice.toLocaleString() + 'z' : 'Sem vendas'}`);
                console.log(`   🏪 Vendedores: ${sellers}${outliersCount > 0 ? ` (${outliersCount} outliers removidos)` : ''}`);
                
                if (pageData.avg45days && minPrice > 0) {
                    const diff = Math.round((minPrice / pageData.avg45days - 1) * 100);
                    const alertThreshold = Math.round(pageData.avg45days * 0.85);
                    const status = minPrice <= alertThreshold ? '🔥 BARATO!' : diff < 0 ? '📉 Abaixo da média' : '📈 Acima da média';
                    console.log(`   ${status} (${diff >= 0 ? '+' : ''}${diff}%)`);
                    console.log(`   🎯 Alerta se < ${alertThreshold.toLocaleString()}z`);
                }
                console.log('');
            } else {
                console.log(`⚠️  ${nameid}: Sem dados disponíveis\n`);
            }
            
        } catch (error) {
            console.log(`❌ ${nameid}: Erro - ${error.message}\n`);
        }
    }
    
    await browser.close();
    
    // Gera config atualizado
    const config = {
        checkIntervalMinutes: 3,
        alertThresholdPercent: 15, // 15% abaixo da média de 45 dias
        items: items.filter(i => i.avg45days > 0).map(i => ({
            nameid: i.nameid,
            name: i.name,
            referencePrice: i.referencePrice,
            enabled: true
        })),
        notifications: {
            windows: true,
            sound: true
        }
    };
    
    fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 CONFIG ATUALIZADO - Usando média de 45 dias como referência');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    config.items.forEach((item, i) => {
        const alertPrice = Math.round(item.referencePrice * 0.85);
        console.log(`${i + 1}. ${item.name}`);
        console.log(`   ID: ${item.nameid}`);
        console.log(`   Média 45d: ${item.referencePrice.toLocaleString()}z`);
        console.log(`   🔔 Alerta: < ${alertPrice.toLocaleString()}z (15% abaixo)`);
        console.log('');
    });
    
    console.log('✅ Config salvo! Execute: npm start');
}

fetchItems().catch(console.error);
