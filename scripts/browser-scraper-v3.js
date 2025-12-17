/**
 * SCRIPT V3 - Coleta dados COMPLETOS do RagnaTales
 * Inclui informação de SLOT (onde equipa)
 * 
 * Cole no console em https://ragnatales.com.br/db/items
 */

(async function() {
  const API = 'https://api.ragnatales.com.br';
  const delay = ms => new Promise(r => setTimeout(r, ms));
  
  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob);
    a.download = filename; 
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a);
  }
  
  // Mapeamento do campo 'equip' para slot
  // Baseado nos bits do Ragnarok
  function getSlotFromEquip(equip) {
    if (equip & 256) return 'topo';      // EQP_HEAD_TOP
    if (equip & 512) return 'meio';      // EQP_HEAD_MID
    if (equip & 1) return 'baixo';       // EQP_HEAD_LOW
    if (equip & 16) return 'armadura';   // EQP_ARMOR
    if (equip & 2) return 'arma';        // EQP_WEAPON
    if (equip & 32) return 'escudo';     // EQP_SHIELD
    if (equip & 4) return 'capa';        // EQP_GARMENT
    if (equip & 64) return 'sapato';     // EQP_SHOES
    if (equip & 136) return 'acessorio'; // EQP_ACC_L ou EQP_ACC_R
    if (equip & 128) return 'acessorio'; // EQP_ACC
    if (equip & 8) return 'acessorio';   // EQP_ACC
    return 'outro';
  }
  
  async function fetchPage(page) {
    const url = `${API}/database/items?page=${page}&rows_per_page=100&filters=${encodeURIComponent(JSON.stringify({name:''}))}`;
    const response = await fetch(url);
    return response.json();
  }
  
  console.log('🚀 Iniciando coleta V3...');
  
  const first = await fetchPage(1);
  console.log(`📊 Total: ${first.total_count} itens em ${first.total_pages} páginas`);
  
  const allItems = [...first.rows];
  
  for (let page = 2; page <= first.total_pages; page++) {
    try {
      const data = await fetchPage(page);
      if (data.rows) allItems.push(...data.rows);
      if (page % 50 === 0) console.log(`📄 Página ${page}/${first.total_pages}`);
      await delay(30);
    } catch (e) {
      console.log(`⚠️ Erro na página ${page}`);
    }
  }
  
  console.log(`✅ Coletados ${allItems.length} itens`);
  
  // Separar por tipo
  // type 4 = Weapon, type 5 = Armor, type 6 = Card
  const weapons = allItems.filter(i => i.type === 4 && i.atk > 0);
  const armors = allItems.filter(i => i.type === 5);
  const cards = allItems.filter(i => i.type === 6);
  
  console.log(`⚔️ Armas: ${weapons.length}`);
  console.log(`🛡️ Armaduras: ${armors.length}`);
  console.log(`🃏 Cartas: ${cards.length}`);
  
  // Processar armas
  const processedWeapons = weapons.map(i => ({
    id: i.nameid,
    nameid: i.nameid,
    name: i.jname || i.name,
    slot: 'arma',
    slots: i.slot || 0,
    cardSlots: i.slot || 0,
    attack: i.atk || 0,
    weaponAttack: i.atk || 0,
    matk: i.matk || 0,
    defense: i.def || 0,
    weight: i.weight || 0,
    requiredLevel: i.elv || 0,
    weaponLevel: i.wlv || 0,
    level: i.wlv || 0,
    refinable: i.flag_refine === 1,
    image: `https://api.ragnatales.com.br/database/item/icon?nameid=${i.nameid}`,
    effects: []
  }));
  
  // Processar armaduras com slot correto
  const processedArmors = armors.map(i => ({
    id: i.nameid,
    nameid: i.nameid,
    name: i.jname || i.name,
    slot: getSlotFromEquip(i.equip),
    slots: i.slot || 0,
    cardSlots: i.slot || 0,
    attack: i.atk || 0,
    matk: i.matk || 0,
    defense: i.def || 0,
    weight: i.weight || 0,
    requiredLevel: i.elv || 0,
    refinable: i.flag_refine === 1,
    image: `https://api.ragnatales.com.br/database/item/icon?nameid=${i.nameid}`,
    effects: []
  }));
  
  // Processar cartas
  const processedCards = cards.map(i => ({
    id: i.nameid,
    nameid: i.nameid,
    name: i.jname || i.name,
    slot: 'card',
    image: `https://api.ragnatales.com.br/database/item/icon?nameid=${i.nameid}`,
    effects: []
  }));
  
  // Estatísticas de slots
  const slotStats = {};
  processedArmors.forEach(a => {
    slotStats[a.slot] = (slotStats[a.slot] || 0) + 1;
  });
  console.log('📊 Distribuição de slots:', slotStats);
  
  // Baixar arquivos
  downloadJSON(processedWeapons, 'ragnatales-weapons.json');
  await delay(1000);
  downloadJSON(processedArmors, 'ragnatales-equipments.json');
  await delay(1000);
  downloadJSON(processedCards, 'ragnatales-cards.json');
  
  console.log('🎉 PRONTO! 3 arquivos baixados com slots corretos!');
})();


