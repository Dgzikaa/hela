/**
 * Script de TESTE para scraping do RagnaTales
 * Usa puppeteer-extra com stealth plugin
 * 
 * Uso: node scripts/scrape-ragnatales-test.js
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

// Adiciona plugin stealth
puppeteer.use(StealthPlugin());

const BASE_URL = 'https://ragnatales.com.br';
const API_URL = 'https://api.ragnatales.com.br';

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'ragnatales');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'ragnatales');

// Garante que os diretórios existam
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Iniciando teste de scraping com Stealth...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
    ],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  
  // Armazena os dados capturados via rede
  let capturedItems = null;
  let capturedItemDetails = null;

  // Escuta responses da rede
  page.on('response', async (response) => {
    const url = response.url();
    
    if (url.includes('/database/items?')) {
      try {
        const text = await response.text();
        const data = JSON.parse(text);
        if (data && data.data) {
          capturedItems = data;
          console.log(`  📥 Capturado via rede: ${data.data.length} itens`);
        }
      } catch (e) {}
    }
    
    if (url.includes('/database/item?nameid=')) {
      try {
        const text = await response.text();
        const data = JSON.parse(text);
        if (data && data.nameid) {
          capturedItemDetails = data;
          console.log(`  📥 Capturado via rede: detalhes de ${data.name}`);
        }
      } catch (e) {}
    }
  });

  // Acessa a página principal
  console.log('📡 Conectando ao RagnaTales...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  console.log('  ✓ Página inicial carregada');
  await delay(2000);

  // Acessa a lista de adagas
  console.log('\n📦 Navegando para adagas...');
  const filters = JSON.stringify({ name: '', type: 'weapon', subtype: 'dagger' });
  const filtersBase64 = Buffer.from(filters).toString('base64');
  const listUrl = `${BASE_URL}/db/items?page=1&rowsPerPage=10&filters=${filtersBase64}`;
  
  await page.goto(listUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  console.log('  ✓ Página de lista carregada');
  await delay(3000);

  // Verifica se capturou via rede
  if (capturedItems && capturedItems.data) {
    console.log(`\n✅ Capturados ${capturedItems.data.length} itens via interceptação de rede!`);
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'test-items.json'),
      JSON.stringify(capturedItems.data, null, 2),
      'utf-8'
    );
    console.log('💾 Itens salvos em test-items.json');
  } else {
    console.log('\n⚠️ Não capturou via rede, tentando extrair do DOM...');
    
    // Extrai do DOM
    const domData = await page.evaluate(() => {
      const items = [];
      // Tenta diferentes seletores
      const links = document.querySelectorAll('a[href*="/db/items/"]');
      links.forEach(link => {
        const text = link.textContent || '';
        const match = text.match(/(.+?)\s*\(id:\s*(\d+)\)/);
        if (match) {
          items.push({
            name: match[1].trim(),
            nameid: parseInt(match[2])
          });
        }
      });
      return items;
    });
    
    if (domData.length > 0) {
      console.log(`\n✅ Extraídos ${domData.length} itens do DOM!`);
      capturedItems = { data: domData };
      
      fs.writeFileSync(
        path.join(OUTPUT_DIR, 'test-items.json'),
        JSON.stringify(domData, null, 2),
        'utf-8'
      );
      console.log('💾 Itens salvos em test-items.json');
    } else {
      console.log('❌ Não conseguiu extrair itens');
    }
  }

  // Se tem itens, busca detalhes do primeiro
  if (capturedItems && capturedItems.data && capturedItems.data.length > 0) {
    const firstItem = capturedItems.data[0];
    console.log(`\n🔍 Navegando para detalhes de: ${firstItem.name || firstItem.nameid}`);
    
    await page.goto(`${BASE_URL}/db/items/${firstItem.nameid}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(3000);
    
    if (capturedItemDetails) {
      console.log('\n📊 Detalhes capturados via rede!');
      console.log(JSON.stringify(capturedItemDetails, null, 2));
      
      fs.writeFileSync(
        path.join(OUTPUT_DIR, 'test-item-detail.json'),
        JSON.stringify(capturedItemDetails, null, 2),
        'utf-8'
      );
      console.log('💾 Detalhes salvos em test-item-detail.json');
    } else {
      console.log('\n⚠️ Detalhes não capturados via rede');
    }

    // Baixa a imagem
    console.log('\n🖼️ Baixando imagem...');
    const imagePath = path.join(IMAGES_DIR, `${firstItem.nameid}.png`);
    
    try {
      const client = await page.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: IMAGES_DIR,
      });
      
      const imageResponse = await page.goto(`${API_URL}/database/item/icon?nameid=${firstItem.nameid}`, { timeout: 30000 });
      if (imageResponse && imageResponse.ok()) {
        const buffer = await imageResponse.buffer();
        fs.writeFileSync(imagePath, buffer);
        console.log(`  ✓ Imagem salva: ${imagePath}`);
      }
    } catch (e) {
      console.log('  ⚠️ Erro ao baixar imagem:', e.message);
    }
  }

  console.log('\n✅ Teste concluído!');
  console.log(`\n📁 Arquivos salvos em: ${OUTPUT_DIR}`);
  console.log('O browser vai fechar em 5 segundos...');
  
  await delay(5000);
  await browser.close();
}

main().catch(console.error);
