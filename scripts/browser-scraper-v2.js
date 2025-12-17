/**
 * SCRIPT CORRIGIDO - Coleta armas físicas do RagnaTales
 * Cole no console do navegador em https://ragnatales.com.br/db/items
 */

(async function() {
  const API = 'https://api.ragnatales.com.br';
  const delay = ms => new Promise(r => setTimeout(r, ms));
  
  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  async function fetchPage(page) {
    const filters = encodeURIComponent(JSON.stringify({ name: '' }));
    const url = `${API}/database/items?page=${page}&rows_per_page=100&filters=${filters}`;
    const response = await fetch(url);
    return await response.json();
  }
  
  console.log('🚀 Iniciando coleta de itens do RagnaTales...\n');
  
  // Busca primeira página para saber o total
  const first = await fetchPage(1);
  const totalPages = first.total_pages;
  const totalItems = first.total_count;
  
  console.log(`📊 Total: ${totalItems} itens em ${totalPages} páginas`);
  console.log('⏳ Isso pode demorar alguns minutos...\n');
  
  const allItems = [...first.rows];
  
  // Busca restante das páginas
  for (let page = 2; page <= totalPages; page++) {
    try {
      const data = await fetchPage(page);
      if (data.rows) {
        allItems.push(...data.rows);
      }
      
      if (page % 50 === 0) {
        console.log(`  Página ${page}/${totalPages} (${allItems.length} itens)`);
      }
    } catch (e) {
      console.warn(`  ⚠️ Erro na página ${page}`);
    }
    
    await delay(50);
  }
  
  console.log(`\n✅ Coletados ${allItems.length} itens!`);
  
  // Separa por tipo
  // type 4 = Weapon, type 5 = Armor, type 6 = Card
  const weapons = allItems.filter(i => i.type === 4);
  const armors = allItems.filter(i => i.type === 5);
  const cards = allItems.filter(i => i.type === 6);
  
  console.log(`\n📊 Classificação:`);
  console.log(`  Armas (type=4): ${weapons.length}`);
  console.log(`  Armaduras (type=5): ${armors.length}`);
  console.log(`  Cartas (type=6): ${cards.length}`);
  
  // Filtra armas físicas (ATK > 0)
  const physicalWeapons = weapons.filter(w => w.atk > 0);
  console.log(`  Armas Físicas (atk>0): ${physicalWeapons.length}`);
  
  // Processa para formato final
  function process(item) {
    return {
      id: item.nameid,
      nameid: item.nameid,
      name: item.jname || item.name,
      nameEn: item.name,
      type: item.type,
      subtype: item.subtype,
      slots: item.slot || 0,
      attack: item.atk || 0,
      matk: item.matk || 0,
      defense: item.def || 0,
      weight: item.weight || 0,
      requiredLevel: item.elv || 0,
      weaponLevel: item.wlv || 0,
      range: item.range || 0,
      refinable: item.flag_refine === 1,
      description: item.info?.description_name || '',
      image: `https://api.ragnatales.com.br/database/item/icon?nameid=${item.nameid}`,
    };
  }
  
  const weaponsProcessed = physicalWeapons.map(process);
  const armorsProcessed = armors.map(process);
  const cardsProcessed = cards.map(process);
  
  // Downloads
  console.log('\n📥 Baixando arquivos...');
  
  downloadJSON(weaponsProcessed, 'ragnatales-weapons.json');
  console.log('  ✓ ragnatales-weapons.json');
  
  await delay(1000);
  downloadJSON(armorsProcessed, 'ragnatales-equipments.json');
  console.log('  ✓ ragnatales-equipments.json');
  
  await delay(1000);
  downloadJSON(cardsProcessed, 'ragnatales-cards.json');
  console.log('  ✓ ragnatales-cards.json');
  
  console.log('\n🎉 CONCLUÍDO!');
  console.log('Mova os arquivos para: F:\\Hela\\public\\data\\ragnatales\\');
  
  // Salva no window para debug
  window.ragnatalesData = { 
    weapons: weaponsProcessed, 
    armors: armorsProcessed, 
    cards: cardsProcessed,
    all: allItems
  };
  console.log('💾 Dados salvos em window.ragnatalesData');
})();

