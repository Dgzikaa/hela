/**
 * Script SIMPLES para coletar dados do RagnaTales
 * Usa fetch direto sem Puppeteer
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = 'https://api.ragnatales.com.br';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'ragnatales');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'ragnatales');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Categorias de armas físicas
const WEAPON_SUBTYPES = [
  'dagger', 'one_handed_sword', 'two_handed_sword',
  'one_handed_spear', 'two_handed_spear',
  'one_handed_axe', 'two_handed_axe',
  'mace', 'bow', 'katar', 'knuckle', 'huuma_shuriken'
];

const delay = ms => new Promise(r => setTimeout(r, ms));

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://ragnatales.com.br/',
        'Origin': 'https://ragnatales.com.br'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Parse error: ' + data.substring(0, 200)));
        }
      });
    }).on('error', reject);
  });
}

async function fetchItems(type, subtype, page = 1) {
  const filters = encodeURIComponent(JSON.stringify({ name: '', type, subtype }));
  const url = `${API_URL}/database/items?page=${page}&rows_per_page=100&filters=${filters}`;
  return await fetchJSON(url);
}

async function fetchItemDetails(nameid) {
  const url = `${API_URL}/database/item?nameid=${nameid}`;
  return await fetchJSON(url);
}

async function downloadImage(nameid) {
  const imagePath = path.join(IMAGES_DIR, `${nameid}.png`);
  if (fs.existsSync(imagePath)) return;

  return new Promise((resolve) => {
    const url = `${API_URL}/database/item/icon?nameid=${nameid}`;
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          fs.writeFileSync(imagePath, Buffer.concat(chunks));
          resolve();
        });
      } else {
        resolve();
      }
    }).on('error', () => resolve());
  });
}

function processItem(raw, category) {
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
    category,
    slots: raw.slot || 0,
    attack: raw.atk || 0,
    matk: raw.matk || 0,
    defense: raw.def || 0,
    weight: raw.weight || 0,
    requiredLevel: raw.elv || 0,
    weaponLevel: raw.wlv || 0,
    range: raw.range || 0,
    refinable: raw.flag_refine === 1,
    description: raw.info?.description_name || '',
    image: `/images/ragnatales/${raw.nameid}.png`,
  };
}

async function main() {
  console.log('🚀 Coletando armas do RagnaTales via API\n');

  const allWeapons = [];

  for (const subtype of WEAPON_SUBTYPES) {
    console.log(`⚔️  ${subtype}...`);
    
    try {
      // Busca lista de itens
      const listData = await fetchItems('weapon', subtype, 1);
      
      if (listData && listData.data) {
        console.log(`  ${listData.data.length} itens encontrados`);
        
        // Busca detalhes de cada item
        for (const item of listData.data) {
          try {
            const details = await fetchItemDetails(item.nameid);
            const processed = processItem(details, subtype);
            if (processed) {
              allWeapons.push(processed);
            }
            await delay(100);
          } catch (e) {
            console.log(`  ⚠️ Erro em ${item.nameid}: ${e.message}`);
          }
        }
        
        // Baixa imagens
        for (const item of listData.data) {
          await downloadImage(item.nameid);
        }
        
        console.log(`  ✓ ${listData.data.length} processados\n`);
      }
    } catch (e) {
      console.log(`  ❌ Erro: ${e.message}\n`);
    }
    
    await delay(500);
  }

  // Salva
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'weapons.json'),
    JSON.stringify(allWeapons, null, 2)
  );

  console.log(`\n✅ Salvas ${allWeapons.length} armas em weapons.json`);
}

main().catch(console.error);

