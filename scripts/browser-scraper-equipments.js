/**
 * SCRIPT PARA COLETAR EQUIPAMENTOS - EXECUTE NO CONSOLE DO NAVEGADOR
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
  
  const EQUIPMENT_TYPES = [
    { type: 'armor', subtype: 'armor', name: 'Armaduras' },
    { type: 'armor', subtype: 'shield', name: 'Escudos' },
    { type: 'armor', subtype: 'garment', name: 'Capas' },
    { type: 'armor', subtype: 'footgear', name: 'Sapatos' },
    { type: 'armor', subtype: 'accessory', name: 'Acessórios' },
    { type: 'armor', subtype: 'headgear_top', name: 'Topos' },
    { type: 'armor', subtype: 'headgear_mid', name: 'Meios' },
    { type: 'armor', subtype: 'headgear_low', name: 'Baixos' },
  ];

  const delay = ms => new Promise(r => setTimeout(r, ms));

  async function fetchItems(type, subtype) {
    const filters = JSON.stringify({ name: '', type, subtype });
    const url = `${API_URL}/database/items?page=1&rows_per_page=1000&filters=${encodeURIComponent(filters)}`;
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

  console.log('🚀 Iniciando coleta de equipamentos...\n');

  const allEquipments = [];

  for (const category of EQUIPMENT_TYPES) {
    console.log(`🛡️ Coletando ${category.name}...`);
    
    try {
      const listData = await fetchItems(category.type, category.subtype);
      
      if (listData && listData.data && listData.data.length > 0) {
        console.log(`  Encontrados: ${listData.data.length} itens`);
        
        for (const item of listData.data) {
          try {
            const details = await fetchItemDetails(item.nameid);
            const processed = processItem(details, category.name);
            if (processed) {
              allEquipments.push(processed);
            }
            await delay(30);
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

  console.log(`\n✅ CONCLUÍDO! Total: ${allEquipments.length} equipamentos`);
  console.log('📥 Baixando arquivo JSON...');
  
  downloadJSON(allEquipments, 'ragnatales-equipments.json');
  
  console.log('\n🎉 Arquivo baixado! Mova-o para public/data/ragnatales/equipments.json');
  
  window.ragnatalesEquipments = allEquipments;
  console.log('💾 Dados também salvos em window.ragnatalesEquipments');
})();

