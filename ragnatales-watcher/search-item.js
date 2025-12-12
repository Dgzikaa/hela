const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const searchTerm = process.argv[2];

if (!searchTerm) {
    console.log('❌ Uso: npm run search -- "nome do item"');
    console.log('   Exemplo: npm run search -- "oridecon"');
    process.exit(1);
}

async function searchItem() {
    console.log(`🔍 Buscando "${searchTerm}"...`);
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Passa pelo Cloudflare
    await page.goto('https://ragnatales.com.br/market', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
    });
    await new Promise(r => setTimeout(r, 2000));
    
    // Busca
    const data = await page.evaluate(async (query) => {
        const response = await fetch(`https://api.ragnatales.com.br/market?page=1&rows_per_page=20&filters={"query":"${query}"}`);
        return await response.json();
    }, searchTerm);
    
    await browser.close();
    
    if (!data.rows || data.rows.length === 0) {
        console.log('❌ Nenhum item encontrado.');
        return;
    }
    
    // Agrupa por nameid para não repetir
    const uniqueItems = {};
    data.rows.forEach(item => {
        if (!uniqueItems[item.nameid]) {
            uniqueItems[item.nameid] = {
                nameid: item.nameid,
                name: item.name,
                minPrice: item.price,
                maxPrice: item.price,
                count: 1
            };
        } else {
            uniqueItems[item.nameid].minPrice = Math.min(uniqueItems[item.nameid].minPrice, item.price);
            uniqueItems[item.nameid].maxPrice = Math.max(uniqueItems[item.nameid].maxPrice, item.price);
            uniqueItems[item.nameid].count++;
        }
    });
    
    console.log(`\n✅ Encontrados ${Object.keys(uniqueItems).length} itens diferentes:\n`);
    console.log('╔════════════╦══════════════════════════════════════════╦═══════════════════╦═══════════╗');
    console.log('║   NAMEID   ║ NOME                                     ║ PREÇO (min-max)   ║ VENDAS    ║');
    console.log('╠════════════╬══════════════════════════════════════════╬═══════════════════╬═══════════╣');
    
    Object.values(uniqueItems).forEach(item => {
        const nameid = item.nameid.toString().padEnd(10);
        const name = item.name.slice(0, 40).padEnd(40);
        const price = item.minPrice === item.maxPrice 
            ? item.minPrice.toLocaleString().padEnd(17)
            : `${item.minPrice.toLocaleString()} - ${item.maxPrice.toLocaleString()}`.slice(0, 17).padEnd(17);
        const count = item.count.toString().padEnd(9);
        
        console.log(`║ ${nameid} ║ ${name} ║ ${price} ║ ${count} ║`);
    });
    
    console.log('╚════════════╩══════════════════════════════════════════╩═══════════════════╩═══════════╝');
    
    console.log('\n💡 Para adicionar um item ao watcher, edite config.json e adicione:');
    console.log('   { "nameid": XXXXX, "name": "Nome", "referencePrice": YYYY, "enabled": true }');
}

searchItem().catch(console.error);

