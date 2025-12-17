/**
 * SCRIPT PARA COLETAR CARTAS - EXECUTE NO CONSOLE DO NAVEGADOR
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
  
  const delay = ms => new Promise(r => setTimeout(r, ms));

  async function fetchItems(page = 1) {
    const filters = JSON.stringify({ name: '', type: 'card', subtype: '' });
    const url = `${API_URL}/database/items?page=${page}&rows_per_page=100&filters=${encodeURIComponent(filters)}`;
    const response = await fetch(url);
    return await response.json();
  }

  async function fetchItemDetails(nameid) {
    const url = `${API_URL}/database/item?nameid=${nameid}`;
    const response = await fetch(url);
    return await response.json();
  }

  function processCard(raw) {
    if (!raw) return null;
    
    // Extrai slot da descrição
    let slot = 'accessory';
    const desc = (raw.info?.description_name || '').toLowerCase();
    if (desc.includes('arma') || desc.includes('weapon')) slot = 'weapon';
    else if (desc.includes('armadura') || desc.includes('armor')) slot = 'armor';
    else if (desc.includes('escudo') || desc.includes('shield')) slot = 'shield';
    else if (desc.includes('sapato') || desc.includes('footgear')) slot = 'footgear';
    else if (desc.includes('capa') || desc.includes('garment')) slot = 'garment';
    else if (desc.includes('topo') || desc.includes('headgear')) slot = 'headgear';
    
    return {
      id: raw.nameid,
      nameid: raw.nameid,
      name: raw.jname || raw.name,
      nameEn: raw.name,
      slot,
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

  console.log('🚀 Iniciando coleta de cartas...\n');

  const allCards = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    console.log(`📄 Página ${page}...`);
    
    try {
      const listData = await fetchItems(page);
      
      if (listData && listData.data && listData.data.length > 0) {
        console.log(`  Encontradas: ${listData.data.length} cartas`);
        
        for (const item of listData.data) {
          try {
            const details = await fetchItemDetails(item.nameid);
            const processed = processCard(details);
            if (processed) {
              allCards.push(processed);
            }
            await delay(30);
          } catch (e) {}
        }
        
        if (listData.data.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    } catch (e) {
      console.error(`  ❌ Erro: ${e.message}`);
      hasMore = false;
    }
    
    await delay(200);
  }

  console.log(`\n✅ CONCLUÍDO! Total: ${allCards.length} cartas`);
  console.log('📥 Baixando arquivo JSON...');
  
  downloadJSON(allCards, 'ragnatales-cards.json');
  
  console.log('\n🎉 Arquivo baixado! Mova-o para public/data/ragnatales/cards.json');
  
  window.ragnatalesCards = allCards;
  console.log('💾 Dados também salvos em window.ragnatalesCards');
})();

