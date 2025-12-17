/**
 * SCRIPT SIMPLIFICADO - Coleta TODOS os itens do RagnaTales
 * Cole no console do navegador em https://ragnatales.com.br/db/items
 */

(async function() {
  const API = 'https://api.ragnatales.com.br';
  const delay = ms => new Promise(r => setTimeout(r, ms));
  
  // Tipos de armas físicas (IDs do jogo)
  const PHYSICAL_WEAPON_TYPES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 16, 17, 18, 19, 20, 21]; // dagger, sword, etc
  
  async function fetchAllItems() {
    const allItems = [];
    let page = 1;
    let hasMore = true;
    
    console.log('📦 Buscando todos os itens...');
    
    while (hasMore) {
      const filters = encodeURIComponent(JSON.stringify({ name: '' }));
      const url = `${API}/database/items?page=${page}&rows_per_page=100&filters=${filters}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.data && data.data.length > 0) {
          allItems.push(...data.data);
          console.log(`  Página ${page}: +${data.data.length} (Total: ${allItems.length})`);
          
          if (data.data.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      } catch (e) {
        console.error(`  Erro na página ${page}:`, e.message);
        hasMore = false;
      }
      
      await delay(100);
    }
    
    return allItems;
  }
  
  async function fetchDetails(nameid) {
    try {
      const response = await fetch(`${API}/database/item?nameid=${nameid}`);
      return await response.json();
    } catch (e) {
      return null;
    }
  }
  
  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Coleta todos os itens
  const allItems = await fetchAllItems();
  console.log(`\n✅ Total de itens encontrados: ${allItems.length}`);
  
  // Separa por tipo
  const weapons = [];
  const armors = [];
  const cards = [];
  const others = [];
  
  console.log('\n🔍 Buscando detalhes de cada item...');
  
  let processed = 0;
  for (const item of allItems) {
    const details = await fetchDetails(item.nameid);
    
    if (details) {
      const processedItem = {
        id: details.nameid,
        nameid: details.nameid,
        name: details.jname || details.name,
        nameEn: details.name,
        type: details.type,
        subtype: details.subtype,
        slots: details.slot || 0,
        attack: details.atk || 0,
        matk: details.matk || 0,
        defense: details.def || 0,
        weight: details.weight || 0,
        requiredLevel: details.elv || 0,
        weaponLevel: details.wlv || 0,
        range: details.range || 0,
        refinable: details.flag_refine === 1,
        description: details.info?.description_name || '',
        image: `https://api.ragnatales.com.br/database/item/icon?nameid=${details.nameid}`,
      };
      
      // Classifica por tipo
      if (details.type === 4) { // Weapon
        weapons.push(processedItem);
      } else if (details.type === 5) { // Armor
        armors.push(processedItem);
      } else if (details.type === 6) { // Card
        cards.push(processedItem);
      } else {
        others.push(processedItem);
      }
    }
    
    processed++;
    if (processed % 50 === 0) {
      console.log(`  Processados: ${processed}/${allItems.length}`);
    }
    
    await delay(30);
  }
  
  console.log('\n📊 Resumo:');
  console.log(`  Armas: ${weapons.length}`);
  console.log(`  Armaduras: ${armors.length}`);
  console.log(`  Cartas: ${cards.length}`);
  console.log(`  Outros: ${others.length}`);
  
  // Filtra armas físicas (ATK > 0 e MATK == 0 ou ATK > MATK)
  const physicalWeapons = weapons.filter(w => w.attack > 0 && (w.matk === 0 || w.attack > w.matk));
  console.log(`  Armas Físicas: ${physicalWeapons.length}`);
  
  // Downloads
  console.log('\n📥 Baixando arquivos...');
  
  downloadJSON(physicalWeapons, 'ragnatales-weapons.json');
  await delay(500);
  downloadJSON(armors, 'ragnatales-equipments.json');
  await delay(500);
  downloadJSON(cards, 'ragnatales-cards.json');
  
  console.log('\n🎉 CONCLUÍDO!');
  console.log('Mova os arquivos para: public/data/ragnatales/');
  
  // Salva no window
  window.ragnatalesData = { weapons: physicalWeapons, armors, cards, others };
})();

