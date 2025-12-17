/**
 * Script para fazer scraping do banco de dados do RagnaTales
 * Coleta armas físicas, equipamentos e salva em JSON com imagens
 * 
 * Uso: node scripts/scrape-ragnatales.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://ragnatales.com.br';
const API_URL = 'https://api.ragnatales.com.br';

// Categorias de armas físicas para buscar
const WEAPON_CATEGORIES = [
  { type: 'weapon', subtype: 'dagger', name: 'Adagas' },
  { type: 'weapon', subtype: 'one_handed_sword', name: 'Espadas 1 Mão' },
  { type: 'weapon', subtype: 'two_handed_sword', name: 'Espadas 2 Mãos' },
  { type: 'weapon', subtype: 'one_handed_spear', name: 'Lanças 1 Mão' },
  { type: 'weapon', subtype: 'two_handed_spear', name: 'Lanças 2 Mãos' },
  { type: 'weapon', subtype: 'one_handed_axe', name: 'Machados 1 Mão' },
  { type: 'weapon', subtype: 'two_handed_axe', name: 'Machados 2 Mãos' },
  { type: 'weapon', subtype: 'mace', name: 'Maças' },
  { type: 'weapon', subtype: 'bow', name: 'Arcos' },
  { type: 'weapon', subtype: 'katar', name: 'Katars' },
  { type: 'weapon', subtype: 'knuckle', name: 'Soqueiras' },
  { type: 'weapon', subtype: 'instrument', name: 'Instrumentos' },
  { type: 'weapon', subtype: 'whip', name: 'Chicotes' },
  { type: 'weapon', subtype: 'revolver', name: 'Revólveres' },
  { type: 'weapon', subtype: 'rifle', name: 'Rifles' },
  { type: 'weapon', subtype: 'gatling', name: 'Gatlings' },
  { type: 'weapon', subtype: 'shotgun', name: 'Shotguns' },
  { type: 'weapon', subtype: 'grenade_launcher', name: 'Lança-granadas' },
  { type: 'weapon', subtype: 'huuma_shuriken', name: 'Huuma Shurikens' },
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

// Categorias de cartas
const CARD_CATEGORIES = [
  { type: 'card', subtype: '', name: 'Cartas' },
];

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'ragnatales');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'ragnatales');

// Garante que os diretórios existam
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(page, nameid, outputPath) {
  try {
    const imageUrl = `${API_URL}/database/item/icon?nameid=${nameid}`;
    const response = await page.goto(imageUrl, { waitUntil: 'networkidle0' });
    
    if (response && response.ok()) {
      const buffer = await response.buffer();
      fs.writeFileSync(outputPath, buffer);
      return true;
    }
  } catch (error) {
    console.error(`Erro ao baixar imagem ${nameid}:`, error.message);
  }
  return false;
}

async function fetchItemsFromCategory(page, category) {
  const items = [];
  let currentPage = 1;
  let hasMore = true;

  console.log(`\n📦 Buscando: ${category.name}`);

  while (hasMore) {
    const filters = JSON.stringify({
      name: '',
      type: category.type,
      subtype: category.subtype
    });
    
    const filtersBase64 = Buffer.from(filters).toString('base64');
    const url = `${BASE_URL}/db/items?page=${currentPage}&rowsPerPage=50&filters=${filtersBase64}`;
    
    console.log(`  Página ${currentPage}...`);
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(1000);

    // Interceptar a resposta da API
    const apiData = await page.evaluate(async (apiUrl, filters, pageNum) => {
      try {
        const response = await fetch(
          `${apiUrl}/database/items?page=${pageNum}&rows_per_page=50&filters=${encodeURIComponent(filters)}`
        );
        return await response.json();
      } catch (e) {
        return null;
      }
    }, API_URL, filters, currentPage);

    if (apiData && apiData.data && apiData.data.length > 0) {
      for (const item of apiData.data) {
        items.push({
          id: item.nameid,
          name: item.name,
        });
      }
      
      console.log(`    Encontrados: ${apiData.data.length} itens`);
      
      // Verifica se há mais páginas
      if (apiData.data.length < 50) {
        hasMore = false;
      } else {
        currentPage++;
      }
    } else {
      hasMore = false;
    }

    await delay(500);
  }

  console.log(`  Total: ${items.length} itens`);
  return items;
}

async function fetchItemDetails(page, nameid) {
  try {
    const data = await page.evaluate(async (apiUrl, id) => {
      try {
        const response = await fetch(`${apiUrl}/database/item?nameid=${id}`);
        return await response.json();
      } catch (e) {
        return null;
      }
    }, API_URL, nameid);

    return data;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do item ${nameid}:`, error.message);
    return null;
  }
}

function processItemData(rawData) {
  if (!rawData) return null;

  // Gerar slug do nome
  const slug = rawData.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .trim();

  return {
    id: slug,
    nameid: rawData.nameid,
    name: rawData.name,
    type: rawData.type || '',
    subtype: rawData.subtype || '',
    slots: rawData.slots || 0,
    attack: rawData.atk || 0,
    matk: rawData.matk || 0,
    defense: rawData.def || 0,
    weight: rawData.weight || 0,
    requiredLevel: rawData.equip_level_min || 0,
    weaponLevel: rawData.weapon_level || 0,
    refinable: rawData.refinable || false,
    description: rawData.description || '',
    script: rawData.script || '',
    equipLocations: rawData.equip_locations || [],
    jobs: rawData.equip_jobs || [],
    image: `/images/ragnatales/${rawData.nameid}.png`,
  };
}

async function main() {
  console.log('🚀 Iniciando scraping do RagnaTales...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Configura user agent para evitar bloqueios
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Primeiro, acessa a página principal para pegar cookies
  console.log('📡 Conectando ao RagnaTales...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await delay(2000);

  const allWeapons = [];
  const allEquipments = [];
  const allCards = [];

  // Busca armas
  console.log('\n⚔️ BUSCANDO ARMAS FÍSICAS...');
  for (const category of WEAPON_CATEGORIES) {
    try {
      const items = await fetchItemsFromCategory(page, category);
      
      for (const item of items) {
        const details = await fetchItemDetails(page, item.id);
        if (details) {
          const processed = processItemData(details);
          if (processed) {
            processed.category = category.name;
            allWeapons.push(processed);
            
            // Baixa imagem
            const imagePath = path.join(IMAGES_DIR, `${item.id}.png`);
            if (!fs.existsSync(imagePath)) {
              // A imagem será baixada depois
            }
          }
        }
        await delay(200);
      }
    } catch (error) {
      console.error(`Erro na categoria ${category.name}:`, error.message);
    }
  }

  // Busca equipamentos
  console.log('\n🛡️ BUSCANDO EQUIPAMENTOS...');
  for (const category of EQUIPMENT_CATEGORIES) {
    try {
      const items = await fetchItemsFromCategory(page, category);
      
      for (const item of items) {
        const details = await fetchItemDetails(page, item.id);
        if (details) {
          const processed = processItemData(details);
          if (processed) {
            processed.category = category.name;
            allEquipments.push(processed);
          }
        }
        await delay(200);
      }
    } catch (error) {
      console.error(`Erro na categoria ${category.name}:`, error.message);
    }
  }

  // Salva os dados
  console.log('\n💾 Salvando dados...');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'weapons.json'),
    JSON.stringify(allWeapons, null, 2),
    'utf-8'
  );
  console.log(`  ✓ Salvas ${allWeapons.length} armas em weapons.json`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'equipments.json'),
    JSON.stringify(allEquipments, null, 2),
    'utf-8'
  );
  console.log(`  ✓ Salvados ${allEquipments.length} equipamentos em equipments.json`);

  // Baixa as imagens
  console.log('\n🖼️ Baixando imagens...');
  const allItems = [...allWeapons, ...allEquipments];
  let downloaded = 0;
  
  for (const item of allItems) {
    const imagePath = path.join(IMAGES_DIR, `${item.nameid}.png`);
    if (!fs.existsSync(imagePath)) {
      const success = await downloadImage(page, item.nameid, imagePath);
      if (success) downloaded++;
      await delay(100);
    }
  }
  console.log(`  ✓ Baixadas ${downloaded} imagens`);

  await browser.close();

  console.log('\n✅ Scraping concluído!');
  console.log(`   - ${allWeapons.length} armas`);
  console.log(`   - ${allEquipments.length} equipamentos`);
  console.log(`   - Dados salvos em: ${OUTPUT_DIR}`);
  console.log(`   - Imagens salvas em: ${IMAGES_DIR}`);
}

main().catch(console.error);

