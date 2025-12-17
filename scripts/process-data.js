const fs = require('fs');
const path = require('path');

// Function to read and parse tRPC response
function readAndParse(filename) {
  let content = fs.readFileSync(filename, 'utf16le');
  // Remove BOM if present
  content = content.replace(/^\uFEFF/, '').trim();
  const data = JSON.parse(content);
  return data[0].result.data.json;
}

// Process all data files
const dataDir = path.join(__dirname, '..', 'public', 'data');

try {
  // Monsters
  const monsters = readAndParse(path.join(__dirname, '..', 'temp_monsters.json'));
  fs.writeFileSync(path.join(dataDir, 'monsters.json'), JSON.stringify(monsters, null, 2));
  console.log('✓ Monsters:', monsters.length);

  // Equipments
  const equipments = readAndParse(path.join(__dirname, '..', 'temp_equipments.json'));
  fs.writeFileSync(path.join(dataDir, 'equipments.json'), JSON.stringify(equipments, null, 2));
  console.log('✓ Equipments:', equipments.length);

  // Cards
  const cards = readAndParse(path.join(__dirname, '..', 'temp_cards.json'));
  fs.writeFileSync(path.join(dataDir, 'cards.json'), JSON.stringify(cards, null, 2));
  console.log('✓ Cards:', cards.length);

  // Runes
  const runes = readAndParse(path.join(__dirname, '..', 'temp_runas.json'));
  fs.writeFileSync(path.join(dataDir, 'runes.json'), JSON.stringify(runes, null, 2));
  console.log('✓ Runes:', runes.length);

  // Weapons
  const weapons = readAndParse(path.join(__dirname, '..', 'temp_weapons.json'));
  fs.writeFileSync(path.join(dataDir, 'weapons.json'), JSON.stringify(weapons, null, 2));
  console.log('✓ Weapons:', weapons.length);

  console.log('\n✅ All data processed successfully!');
} catch (err) {
  console.error('Error:', err.message);
}

