/**
 * SCRIPT PARA EXECUTAR NO CONSOLE DO NAVEGADOR
 * 
 * INSTRUÇÕES:
 * 1. Abra https://ragnatales.com.br/db/items no navegador
 * 2. Abra o DevTools (F12) e vá na aba Console
 * 3. Cole este script e pressione Enter
 * 4. Aguarde a coleta terminar
 * 5. O arquivo JSON será baixado automaticamente
 */

(async function() {
  const API_URL = 'https://api.ragnatales.com.br';
  
  // Categorias de armas físicas
  const WEAPON_SUBTYPES = [
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

  async function fetchItems(type, subtype) {
    const filters = JSON.stringify({ name: '', type, subtype });
    const url = `${API_URL}/database/items?page=1&rows_per_page=500&filters=${encodeURIComponent(filters)}`;
    const response = await fetch(url);
    return await response.json();
  }

  async function fetchItemDetails(nameid) {
    const url = `${API_URL}/database/item?nameid=${nameid}`;
    const response = await fetch(url);
    return await response.json();
  }

  function processItem(raw, category) {
    if (!raw) return null;
    return {
      id: raw.nameid,
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
      image: `https://api.ragnatales.com.br/database/item/icon?nameid=${raw.nameid}`,
    };
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

  console.log('🚀 Iniciando coleta de armas...\n');

  const allWeapons = [];

  for (const category of WEAPON_SUBTYPES) {
    console.log(`⚔️ Coletando ${category.name}...`);
    
    try {
      const listData = await fetchItems('weapon', category.subtype);
      
      if (listData && listData.data && listData.data.length > 0) {
        console.log(`  Encontrados: ${listData.data.length} itens`);
        
        for (const item of listData.data) {
          try {
            const details = await fetchItemDetails(item.nameid);
            const processed = processItem(details, category.name);
            if (processed) {
              allWeapons.push(processed);
            }
            await delay(50);
          } catch (e) {
            console.warn(`  ⚠️ Erro em ${item.nameid}`);
          }
        }
        
        console.log(`  ✓ ${listData.data.length} processados`);
      }
    } catch (e) {
      console.error(`  ❌ Erro: ${e.message}`);
    }
    
    await delay(200);
  }

  console.log(`\n✅ CONCLUÍDO! Total: ${allWeapons.length} armas`);
  console.log('📥 Baixando arquivo JSON...');
  
  downloadJSON(allWeapons, 'ragnatales-weapons.json');
  
  console.log('\n🎉 Arquivo baixado! Mova-o para public/data/ragnatales/weapons.json');
  
  // Também salva no window para acesso posterior
  window.ragnatalesWeapons = allWeapons;
  console.log('💾 Dados também salvos em window.ragnatalesWeapons');
})();

