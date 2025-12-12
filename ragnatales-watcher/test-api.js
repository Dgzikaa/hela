// Teste simples da API do RagnaTales
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function testAPI() {
    console.log('🚀 Iniciando teste da API...\n');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📡 Passando pelo Cloudflare...');
    await page.goto('https://ragnatales.com.br/market', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
    });
    await new Promise(r => setTimeout(r, 5000));
    console.log('✅ Conectado!\n');
    
    // Testa um item específico
    const testItem = { nameid: 25981, name: 'Âmago Sombrio' };
    
    console.log(`📦 Testando item: ${testItem.name} (ID: ${testItem.nameid})`);
    
    // Primeiro, vamos ver o que a página retorna
    const pageContent = await page.content();
    console.log(`   📄 Página tem ${pageContent.length} caracteres`);
    
    // Tenta fazer o fetch da API
    const result = await page.evaluate(async (nameid) => {
        try {
            const url = `https://api.ragnatales.com.br/market/item/shopping?nameid=${nameid}`;
            console.log('Fetching:', url);
            
            const response = await fetch(url);
            const text = await response.text();
            
            return {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                bodyPreview: text.substring(0, 500),
                bodyLength: text.length,
                isHTML: text.startsWith('<') || text.startsWith('<!'),
                url: url
            };
        } catch (e) {
            return { 
                error: e.message, 
                type: e.name,
                stack: e.stack 
            };
        }
    }, testItem.nameid);
    
    console.log('\n📊 Resultado:');
    console.log(JSON.stringify(result, null, 2));
    
    // Testa também a URL base da API
    console.log('\n🔍 Testando URL base da API...');
    const apiTest = await page.evaluate(async () => {
        try {
            const response = await fetch('https://api.ragnatales.com.br/');
            return {
                status: response.status,
                bodyPreview: (await response.text()).substring(0, 200)
            };
        } catch (e) {
            return { error: e.message };
        }
    });
    console.log(JSON.stringify(apiTest, null, 2));
    
    await browser.close();
    console.log('\n✅ Teste concluído!');
}

testAPI().catch(err => {
    console.error('❌ Erro:', err);
    process.exit(1);
});
