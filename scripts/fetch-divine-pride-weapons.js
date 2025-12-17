/**
 * Script para buscar armas físicas do Divine Pride
 * Uso: node scripts/fetch-divine-pride-weapons.js
 */

const fs = require('fs');
const path = require('path');

const API_KEY = '3156526f3ee11b366c8aa5173d8f1cfb';
const SERVER = 'bRO';
const BASE_URL = 'https://www.divine-pride.net/api/database/Item';

// Ranges de IDs de armas físicas no Ragnarok Online
const WEAPON_RANGES = {
  'Espada 1 Mão': { start: 1100, end: 1149 },
  'Espada 2 Mãos': { start: 1150, end: 1199 },
  'Adaga': { start: 1200, end: 1299 },
  'Machado 1 Mão': { start: 1300, end: 1349 },
  'Machado 2 Mãos': { start: 1350, end: 1399 },
  'Lança 1 Mão': { start: 1400, end: 1449 },
  'Lança 2 Mãos': { start: 1450, end: 1499 },
  'Arco': { start: 1700, end: 1799 },
  'Soqueira': { start: 1800, end: 1899 },
  'Instrumento': { start: 1900, end: 1999 },
  'Katar': { start: 2200, end: 2299 },
  'Maça': { start: 1500, end: 1549 }, // Maces
  'Revólver': { start: 13100, end: 13149 },
  'Rifle': { start: 13150, end: 13199 },
  'Shotgun': { start: 13150, end: 13199 },
  'Gatling': { start: 13200, end: 13249 },
  'Lança-Granadas': { start: 13250, end: 13299 },
};

// Equipamentos populares do RagnaTales (IDs conhecidos)
const RAGNATALES_POPULAR_WEAPONS = [
  // Espadas
  13411, 13412, 13413, 13414, 13415, // Espadas de classe
  1167, 1170, 1171, 1172, 1173, 1174, 1175, 1176, 1177, 1178, 1179,
  // Adagas
  1242, 1243, 1244, 1245, 1246, 1247, 1248, 1249,
  // Lanças
  1472, 1473, 1474, 1475, 1476, 1477, 1478, 1479,
  // Arcos
  1728, 1729, 1730, 1731, 1732, 1733, 1734, 1735,
  // Katars
  2214, 2215, 2216, 2217, 2218, 2219, 2220,
  // Soqueiras
  1819, 1820, 1821, 1822, 1823, 1824, 1825,
];

async function fetchItem(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}?apiKey=${API_KEY}&server=${SERVER}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.name || data.status === 'nok') return null;
    return data;
  } catch (error) {
    return null;
  }
}

function convertToEquipmentFormat(item) {
  // Mapear itemSubTypeId para tipo legível
  const subTypeMap = {
    256: 'Adaga',
    257: 'Espada',
    258: 'Espada 2 Mãos',
    259: 'Lança',
    260: 'Lança 2 Mãos',
    261: 'Machado',
    262: 'Machado 2 Mãos',
    263: 'Maça',
    264: 'Maça 2 Mãos',
    265: 'Bastão', // Mágico
    266: 'Chicote',
    267: 'Arco',
    268: 'Soqueira',
    269: 'Instrumento',
    512: 'Katar',
    513: 'Revólver',
    514: 'Livro',
    515: 'Rifle',
    516: 'Gatling',
    517: 'Shotgun',
    518: 'Lança-Granadas',
    519: 'Huuma Shuriken',
  };

  const weaponType = subTypeMap[item.itemSubTypeId] || 'Desconhecido';
  
  // Pular armas mágicas
  const magicTypes = ['Bastão', 'Livro'];
  if (magicTypes.includes(weaponType)) return null;

  // Gerar slug do nome
  const slug = item.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .trim();

  return {
    id: slug,
    divinePrideId: item.id,
    name: item.name,
    type: weaponType,
    slots: item.slots || 0,
    attack: item.attack || 0,
    matk: item.matk || 0,
    weight: item.weight || 0,
    requiredLevel: item.requiredLevel || 0,
    weaponLevel: item.itemLevel || 1,
    refinable: item.refinable || false,
    description: item.description || '',
    effects: [], // Será preenchido manualmente depois
    image: `/equipments/${slug}.png`,
  };
}

async function main() {
  console.log('🔍 Buscando armas físicas do Divine Pride...\n');
  
  const weapons = [];
  const processed = new Set();

  // Buscar por ranges de IDs
  for (const [category, range] of Object.entries(WEAPON_RANGES)) {
    console.log(`📦 Categoria: ${category} (${range.start}-${range.end})`);
    
    let found = 0;
    for (let id = range.start; id <= range.end; id++) {
      if (processed.has(id)) continue;
      
      const item = await fetchItem(id);
      if (item) {
        const weapon = convertToEquipmentFormat(item);
        if (weapon) {
          weapons.push(weapon);
          found++;
          process.stdout.write(`  ✓ ${item.name}\n`);
        }
      }
      
      processed.add(id);
      
      // Rate limiting - 100ms entre requests
      await new Promise(r => setTimeout(r, 100));
    }
    
    console.log(`  → Encontradas: ${found} armas\n`);
  }

  // Buscar IDs populares do RagnaTales
  console.log('📦 Armas populares do RagnaTales...');
  for (const id of RAGNATALES_POPULAR_WEAPONS) {
    if (processed.has(id)) continue;
    
    const item = await fetchItem(id);
    if (item) {
      const weapon = convertToEquipmentFormat(item);
      if (weapon) {
        weapons.push(weapon);
        process.stdout.write(`  ✓ ${item.name}\n`);
      }
    }
    
    processed.add(id);
    await new Promise(r => setTimeout(r, 100));
  }

  // Salvar arquivo
  const outputPath = path.join(__dirname, '..', 'public', 'data', 'physical-weapons.json');
  fs.writeFileSync(outputPath, JSON.stringify(weapons, null, 2), 'utf-8');
  
  console.log(`\n✅ Salvo ${weapons.length} armas físicas em ${outputPath}`);
}

main().catch(console.error);

