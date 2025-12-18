const fs = require('fs');
const w = require('../public/data/ragnatales/weapons-with-effects.json');
const e = require('../public/data/ragnatales/equipments-with-effects.json');
const c = require('../public/data/ragnatales/cards-with-effects.json');

const imgDir = './public/images/ragnatales';
const existingImages = new Set(fs.readdirSync(imgDir).map(f => f.replace('.png', '')));

console.log('Total imagens existentes:', existingImages.size);

// IDs faltando
const allItems = [...w, ...e, ...c];
const missingIds = new Set();
allItems.forEach(item => {
  const id = String(item.id || item.nameid);
  if (!existingImages.has(id)) {
    missingIds.add(id);
  }
});

const uniqueMissing = [...missingIds];
console.log('IDs faltando:', uniqueMissing.length);

// Salvar em JSON
fs.writeFileSync('./scripts/missing-ids-updated.json', JSON.stringify(uniqueMissing, null, 2));
console.log('Lista salva em scripts/missing-ids-updated.json');

