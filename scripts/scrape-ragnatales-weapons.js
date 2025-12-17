/**
 * Script para scraping de ARMAS do RagnaTales
 * Coleta apenas armas físicas
 * 
 * Uso: node scripts/scrape-ragnatales-weapons.js
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

const delay = ms => new Promise(r => setTimeout(r, ms));

async function collectItemsFromPage(page, subtype) {
  const items = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore) {
    const filters = JSON.stringify({ name: '', type: 'weapon', subtype });
    const filtersBase64 = Buffer.from(filters).toString('base64');
    const url = `${BASE_URL}/db/items?page=${currentPage}&rowsPerPage=50&filters=${filtersBase64}`;
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await delay(2000);

      const pageItems = await page.evaluate(() => {
        const items = [];
        const links = document.querySelectorAll('a[href*="/db/items/"]');
        links.forEach(link => {
          const text = link.textContent || '';
          const match = text.match(/(.+?)\s*\(id:\s*(\d+)\)/);
          if (match) {
            items.push({ name: match[1].trim(), nameid: parseInt(match[2]) });
          }
        });
        return items;
      });

      if (pageItems.length > 0) {
        items.push(...pageItems);
        console.log(`    Página ${currentPage}: ${pageItems.length} itens`);
        hasMore = pageItems.length >= 50;
        currentPage++;
      } else {
        hasMore = false;
      }
    } catch (e) {
      console.log(`    ⚠️ Erro na página ${currentPage}: ${e.message}`);
      hasMore = false;
    }

    await delay(300);
  }

  return items;
}

async function getItemDetails(page, nameid) {
  return new Promise(async (resolve) => {
    let details = null;

    const handler = async (response) => {
      if (response.url().includes(`/database/item?nameid=${nameid}`)) {
        try {
          details = JSON.parse(await response.text());
        } catch (e) {}
      }
    };

    page.on('response', handler);

    try {
      await page.goto(`${BASE_URL}/db/items/${nameid}`, { waitUntil: 'networkidle2', timeout: 20000 });
      await delay(1000);
    } catch (e) {}

    page.off('response', handler);
    resolve(details);
  });
}

async function downloadImage(page, nameid) {
  const imagePath = path.join(IMAGES_DIR, `${nameid}.png`);
  if (fs.existsSync(imagePath)) return true;

  try {
    const response = await page.goto(`${API_URL}/database/item/icon?nameid=${nameid}`, { timeout: 10000 });
    if (response && response.ok()) {
      fs.writeFileSync(imagePath, await response.buffer());
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
  console.log('🚀 Scraping de ARMAS do RagnaTales\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  console.log('📡 Conectando...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await delay(2000);
  console.log('  ✓ Conectado!\n');

  const allWeapons = [];

  for (const category of WEAPON_CATEGORIES) {
    console.log(`⚔️  ${category.name}...`);
    
    const items = await collectItemsFromPage(page, category.subtype);
    console.log(`  Total: ${items.length}`);

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
      process.stdout.write(`  Detalhes: ${count}/${items.length}\r`);
    }
    console.log(`  ✓ ${count} processados\n`);
  }

  // Salva dados
  console.log('💾 Salvando...');
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'weapons.json'),
    JSON.stringify(allWeapons, null, 2),
    'utf-8'
  );
  console.log(`  ✓ ${allWeapons.length} armas salvas\n`);

  // Baixa imagens
  console.log('🖼️  Baixando imagens...');
  let imgCount = 0;
  for (const item of allWeapons) {
    await downloadImage(page, item.nameid);
    imgCount++;
    if (imgCount % 10 === 0) process.stdout.write(`  ${imgCount}/${allWeapons.length}\r`);
  }
  console.log(`  ✓ Imagens baixadas\n`);

  await browser.close();

  console.log('✅ CONCLUÍDO!');
  console.log(`   Total: ${allWeapons.length} armas`);
  console.log(`   Dados: ${OUTPUT_DIR}/weapons.json`);
}

main().catch(console.error);

