/**
 * Script COMPLETO para scraping do banco de dados do RagnaTales
 * Coleta armas físicas e equipamentos
 * 
 * Uso: node scripts/scrape-ragnatales-full.js
 * 
 * ATENÇÃO: Este script pode demorar vários minutos dependendo
 * da quantidade de itens a serem coletados.
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const BASE_URL = 'https://ragnatales.com.br';
const API_URL = 'https://api.ragnatales.com.br';

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'ragnatales');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'ragnatales');

// Garante que os diretórios existam
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Categorias de armas físicas
const WEAPON_CATEGORIES = [
  { subtype: 'dagger', name: 'Adagas' },
  { subtype: 'one_handed_sword', name: 'Espadas 1 Mão' },
  { subtype: 'two_handed_sword', name: 'Espadas 2 Mãos' },
  { subtype: 'one_handed_spear', name: 'Lanças 1 Mão' },
  { subtype: 'two_handed_spear', name: 'Lanças 2 Mãos' },
  { subtype: 'one_handed_axe', name: 'Machados 1 Mão' },
  { subtype: 'two_handed_axe', name: 'Machados 2 Mãos' },
  { subtype: 'mace', name: 'Maças' },
  { subtype: 'bow', name: 'Arcos' },
  { subtype: 'katar', name: 'Katars' },
  { subtype: 'knuckle', name: 'Soqueiras' },
  { subtype: 'huuma_shuriken', name: 'Huuma Shurikens' },
];

// Categorias de equipamentos
const EQUIPMENT_CATEGORIES = [
  { type: 'armor', subtype: 'armor', name: 'Armaduras' },
  { type: 'armor', subtype: 'shield', name: 'Escudos' },
  { type: 'armor', subtype: 'garment', name: 'Capas' },
  { type: 'armor', subtype: 'footgear', name: 'Sapatos' },
  { type: 'armor', subtype: 'accessory', name: 'Acessórios' },
  { type: 'armor', subtype: 'headgear_top', name: 'Topos' },
  { type: 'armor', subtype: 'headgear_mid', name: 'Meios' },
  { type: 'armor', subtype: 'headgear_low', name: 'Baixos' },
];

// Categoria de cartas
const CARD_CATEGORIES = [
  { type: 'card', subtype: '', name: 'Cartas' },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function collectItemsFromPage(page, type, subtype) {
  const items = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore) {
    const filters = JSON.stringify({ name: '', type, subtype });
    const filtersBase64 = Buffer.from(filters).toString('base64');
    const url = `${BASE_URL}/db/items?page=${currentPage}&rowsPerPage=50&filters=${filtersBase64}`;
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(2000);

    // Extrai do DOM
    const pageItems = await page.evaluate(() => {
      const items = [];
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

    if (pageItems.length > 0) {
      items.push(...pageItems);
      console.log(`    Página ${currentPage}: ${pageItems.length} itens`);
      
      if (pageItems.length < 50) {
        hasMore = false;
      } else {
        currentPage++;
      }
    } else {
      hasMore = false;
    }

    await delay(500);
  }

  return items;
}

async function getItemDetails(page, nameid) {
  return new Promise(async (resolve) => {
    let details = null;

    const handler = async (response) => {
      const url = response.url();
      if (url.includes(`/database/item?nameid=${nameid}`)) {
        try {
          const text = await response.text();
          details = JSON.parse(text);
        } catch (e) {}
      }
    };

    page.on('response', handler);

    try {
      await page.goto(`${BASE_URL}/db/items/${nameid}`, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(1500);
    } catch (e) {}

    page.off('response', handler);
    resolve(details);
  });
}

async function downloadImage(page, nameid) {
  const imagePath = path.join(IMAGES_DIR, `${nameid}.png`);
  
  if (fs.existsSync(imagePath)) {
    return true; // Já existe
  }

  try {
    const response = await page.goto(`${API_URL}/database/item/icon?nameid=${nameid}`, { timeout: 10000 });
    if (response && response.ok()) {
      const buffer = await response.buffer();
      fs.writeFileSync(imagePath, buffer);
      return true;
    }
  } catch (e) {}

  return false;
}

function processItem(raw, categoryName) {
  if (!raw) return null;

  const slug = (raw.jname || raw.name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .trim();

  return {
    id: slug || `item-${raw.nameid}`,
    nameid: raw.nameid,
    name: raw.jname || raw.name,
    nameEn: raw.name,
    category: categoryName,
    type: raw.type,
    subtype: raw.subtype,
    slots: raw.slot || 0,
    attack: raw.atk || 0,
    matk: raw.matk || 0,
    defense: raw.def || 0,
    weight: raw.weight || 0,
    requiredLevel: raw.elv || 0,
    maxLevel: raw.elvmax || 0,
    weaponLevel: raw.wlv || 0,
    range: raw.range || 0,
    refinable: raw.flag_refine === 1,
    description: raw.info?.description_name || raw.data?.description || '',
    image: `/images/ragnatales/${raw.nameid}.png`,
  };
}

async function main() {
  console.log('🚀 Iniciando scraping COMPLETO do RagnaTales...\n');
  console.log('⚠️  Este processo pode demorar vários minutos.\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  // Acessa a página principal primeiro
  console.log('📡 Conectando ao RagnaTales...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await delay(3000);
  console.log('  ✓ Conectado!\n');

  const allWeapons = [];
  const allEquipments = [];
  const allCards = [];

  // ============ ARMAS ============
  console.log('⚔️  COLETANDO ARMAS FÍSICAS...\n');
  
  for (const category of WEAPON_CATEGORIES) {
    console.log(`📦 ${category.name}...`);
    
    const items = await collectItemsFromPage(page, 'weapon', category.subtype);
    console.log(`  Total: ${items.length} itens`);

    // Busca detalhes de cada item
    let count = 0;
    for (const item of items) {
      const details = await getItemDetails(page, item.nameid);
      if (details) {
        const processed = processItem(details, category.name);
        if (processed) {
          allWeapons.push(processed);
          count++;
        }
      }
      
      // Progress
      if (count % 10 === 0) {
        process.stdout.write(`  Processados: ${count}/${items.length}\r`);
      }
    }
    console.log(`  ✓ Processados: ${count} itens\n`);
  }

  // ============ EQUIPAMENTOS ============
  console.log('\n🛡️  COLETANDO EQUIPAMENTOS...\n');
  
  for (const category of EQUIPMENT_CATEGORIES) {
    console.log(`📦 ${category.name}...`);
    
    const items = await collectItemsFromPage(page, category.type, category.subtype);
    console.log(`  Total: ${items.length} itens`);

    let count = 0;
    for (const item of items) {
      const details = await getItemDetails(page, item.nameid);
      if (details) {
        const processed = processItem(details, category.name);
        if (processed) {
          allEquipments.push(processed);
          count++;
        }
      }
      
      if (count % 10 === 0) {
        process.stdout.write(`  Processados: ${count}/${items.length}\r`);
      }
    }
    console.log(`  ✓ Processados: ${count} itens\n`);
  }

  // ============ SALVAR DADOS ============
  console.log('\n💾 Salvando dados...');

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'weapons.json'),
    JSON.stringify(allWeapons, null, 2),
    'utf-8'
  );
  console.log(`  ✓ ${allWeapons.length} armas salvas em weapons.json`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'equipments.json'),
    JSON.stringify(allEquipments, null, 2),
    'utf-8'
  );
  console.log(`  ✓ ${allEquipments.length} equipamentos salvos em equipments.json`);

  // ============ BAIXAR IMAGENS ============
  console.log('\n🖼️  Baixando imagens...');
  
  const allItems = [...allWeapons, ...allEquipments];
  let downloaded = 0;
  let skipped = 0;

  for (const item of allItems) {
    const success = await downloadImage(page, item.nameid);
    if (success) {
      downloaded++;
    } else {
      skipped++;
    }
    
    if ((downloaded + skipped) % 20 === 0) {
      process.stdout.write(`  Progresso: ${downloaded + skipped}/${allItems.length}\r`);
    }
  }
  console.log(`  ✓ ${downloaded} imagens baixadas, ${skipped} já existiam ou falharam\n`);

  await browser.close();

  console.log('\n✅ SCRAPING CONCLUÍDO!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Armas: ${allWeapons.length}`);
  console.log(`   Equipamentos: ${allEquipments.length}`);
  console.log(`   Total: ${allWeapons.length + allEquipments.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📁 Dados salvos em: ${OUTPUT_DIR}`);
  console.log(`🖼️  Imagens salvas em: ${IMAGES_DIR}`);
}

main().catch(console.error);

