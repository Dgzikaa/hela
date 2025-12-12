const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function debugPage() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    console.log('📡 Acessando página do item...');
    
    // Acessa a página /db/items/ (onde está a média de 45 dias)
    await page.goto('https://ragnatales.com.br/db/items/25986', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
    });
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('✅ Página carregada!\n');
    
    // Extrai todo o texto da página
    const pageText = await page.evaluate(() => document.body.innerText);
    
    // Procura pelo texto da média
    console.log('🔍 Procurando texto da média de 45 dias...\n');
    
    const lines = pageText.split('\n').filter(l => l.trim());
    lines.forEach((line, i) => {
        if (line.toLowerCase().includes('média') || 
            line.toLowerCase().includes('preço') ||
            line.toLowerCase().includes('zenys') ||
            line.toLowerCase().includes('45 dias')) {
            console.log(`[${i}] ${line}`);
        }
    });
    
    // Tenta capturar via regex
    console.log('\n\n📊 Tentando extrair via regex...');
    
    const patterns = [
        /Média de preço.*?([\d.,]+)\s*zenys/i,
        /média.*?([\d.,]+)\s*z/i,
        /([\d.,]+)\s*zenys.*?45 dias/i,
        /preço médio.*?([\d.,]+)/i
    ];
    
    patterns.forEach((pattern, i) => {
        const match = pageText.match(pattern);
        if (match) {
            console.log(`Pattern ${i}: ${match[0]}`);
            console.log(`   Valor: ${match[1]}`);
        }
    });
    
    // Também verifica se existe uma API para isso
    console.log('\n\n🔍 Verificando requisições de rede...');
    
    await browser.close();
}

debugPage().catch(console.error);

