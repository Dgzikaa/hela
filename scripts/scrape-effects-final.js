/**
 * SCRIPT FINAL - Coleta itens com efeitos parseados do RagnaTales
 * 
 * INSTRUÇÕES:
 * 1. Abra https://ragnatales.com.br/db/items no navegador
 * 2. Abra o DevTools (F12) → Console
 * 3. Cole este script e pressione Enter
 * 4. Aguarde (pode demorar 10-20 minutos para todos os itens)
 * 5. Os arquivos serão baixados automaticamente
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
  
  // Limpar HTML e converter para texto
  function cleanHTML(html) {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
  
  // Parser de efeitos - converte descrição em efeitos estruturados
  function parseEffects(htmlDescription) {
    const effects = [];
    if (!htmlDescription) return effects;
    
    const text = cleanHTML(htmlDescription);
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && l !== '--------------------------');
    
    let currentCondition = null;
    
    for (const line of lines) {
      // Ignorar linhas descritivas
      if (line.match(/^(Uma|Um|Esta|Este|Classe:|Forca de Ataque:|Peso:|Nível|Classes que utilizam)/i)) {
        continue;
      }
      
      // Detectar condições
      if (line.match(/^A cada refino/i)) {
        const maxMatch = line.match(/até o \+(\d+)/i);
        currentCondition = { 
          type: 'per_refine', 
          max: maxMatch ? parseInt(maxMatch[1]) : 20 
        };
        continue;
      }
      
      if (line.match(/^Refino \+(\d+) ou (mais|superior)/i)) {
        const match = line.match(/Refino \+(\d+)/i);
        currentCondition = { type: 'refine_min', value: parseInt(match[1]) };
        continue;
      }
      
      if (line.match(/^Refino \+(\d+):/i)) {
        const match = line.match(/Refino \+(\d+)/i);
        currentCondition = { type: 'refine_exact', value: parseInt(match[1]) };
        continue;
      }
      
      if (line.match(/^Ao realizar ataques/i) || line.match(/^Quando atacar/i)) {
        currentCondition = { type: 'on_attack' };
        continue;
      }
      
      if (line.match(/^Ao receber/i)) {
        currentCondition = { type: 'on_hit' };
        continue;
      }
      
      // Parsear efeitos
      const effect = parseEffectLine(line);
      if (effect) {
        if (currentCondition) {
          effect.condition = { ...currentCondition };
        }
        effects.push(effect);
      }
    }
    
    return effects;
  }
  
  function parseEffectLine(line) {
    // Normalizar linha
    const normalized = line
      .replace(/\s+/g, ' ')
      .replace(/,/g, '.')
      .trim();
    
    const patterns = [
      // ATK
      { regex: /ATQ?\s*\+\s*(\d+)%/i, stat: 'atk_percent' },
      { regex: /ATQ?\s*\+\s*(\d+)(?!%)/i, stat: 'atk_flat' },
      
      // Dano físico geral
      { regex: /Dano f[ií]sico\s*\+\s*(\d+)%/i, stat: 'physical_damage_percent' },
      { regex: /Dano f[ií]sico a dist[aâ]ncia\s*\+\s*(\d+)%/i, stat: 'ranged_damage_percent' },
      { regex: /Dano f[ií]sico corpo a corpo\s*\+\s*(\d+)%/i, stat: 'melee_damage_percent' },
      
      // Dano vs Tamanho
      { regex: /Dano f[ií]sico contra (?:monstros de )?tamanho pequeno\s*\+\s*(\d+)%/i, stat: 'damage_vs_small' },
      { regex: /Dano f[ií]sico contra (?:monstros de )?tamanho m[ée]dio\s*\+\s*(\d+)%/i, stat: 'damage_vs_medium' },
      { regex: /Dano f[ií]sico contra (?:monstros de )?tamanho grande\s*\+\s*(\d+)%/i, stat: 'damage_vs_large' },
      { regex: /Dano f[ií]sico contra todos os tamanhos\s*\+\s*(\d+)%/i, stat: 'damage_vs_all_sizes' },
      
      // Dano vs Raça
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros da )?ra[çc]a morto[s-]?vivo\s*\+\s*(\d+)%/i, stat: 'damage_vs_undead' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros da )?ra[çc]a dem[oô]nio\s*\+\s*(\d+)%/i, stat: 'damage_vs_demon' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros da )?ra[çc]a humanoide\s*\+\s*(\d+)%/i, stat: 'damage_vs_demi_human' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros da )?ra[çc]a bruto\s*\+\s*(\d+)%/i, stat: 'damage_vs_brute' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros da )?ra[çc]a planta\s*\+\s*(\d+)%/i, stat: 'damage_vs_plant' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros da )?ra[çc]a inseto\s*\+\s*(\d+)%/i, stat: 'damage_vs_insect' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros da )?ra[çc]a peixe\s*\+\s*(\d+)%/i, stat: 'damage_vs_fish' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros da )?ra[çc]a drag[aã]o\s*\+\s*(\d+)%/i, stat: 'damage_vs_dragon' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros da )?ra[çc]a anjo\s*\+\s*(\d+)%/i, stat: 'damage_vs_angel' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros da )?ra[çc]a amorfo\s*\+\s*(\d+)%/i, stat: 'damage_vs_formless' },
      { regex: /Dano (?:f[ií]sico )?contra todas as ra[çc]as\s*\+\s*(\d+)%/i, stat: 'damage_vs_all_races' },
      
      // Dano vs Elemento
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros de )?elemento fogo\s*\+\s*(\d+)%/i, stat: 'damage_vs_fire' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros de )?elemento [aá]gua\s*\+\s*(\d+)%/i, stat: 'damage_vs_water' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros de )?elemento vento\s*\+\s*(\d+)%/i, stat: 'damage_vs_wind' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros de )?elemento terra\s*\+\s*(\d+)%/i, stat: 'damage_vs_earth' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros de )?elemento sombrio\s*\+\s*(\d+)%/i, stat: 'damage_vs_shadow' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros de )?elemento sagrado\s*\+\s*(\d+)%/i, stat: 'damage_vs_holy' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros de )?elemento fantasma\s*\+\s*(\d+)%/i, stat: 'damage_vs_ghost' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros de )?elemento veneno\s*\+\s*(\d+)%/i, stat: 'damage_vs_poison' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros de )?elemento neutro\s*\+\s*(\d+)%/i, stat: 'damage_vs_neutral' },
      { regex: /Dano (?:f[ií]sico )?contra (?:monstros de )?elemento maldito\s*\+\s*(\d+)%/i, stat: 'damage_vs_undead_ele' },
      
      // Ignora DEF/MDEF
      { regex: /Ignora (\d+)% da DEF/i, stat: 'ignore_def_percent' },
      { regex: /Ignora (\d+)% da MDEF/i, stat: 'ignore_mdef_percent' },
      
      // Crítico
      { regex: /Dano cr[ií]tico\s*\+\s*(\d+)%/i, stat: 'crit_damage_percent' },
      { regex: /Taxa (?:de )?cr[ií]tico\s*\+\s*(\d+)/i, stat: 'crit_rate' },
      
      // ASPD
      { regex: /Velocidade de ataque\s*\+\s*(\d+)%/i, stat: 'aspd_percent' },
      { regex: /ASPD\s*\+\s*(\d+)/i, stat: 'aspd_flat' },
      
      // Stats base
      { regex: /FOR\s*\+\s*(\d+)/i, stat: 'str' },
      { regex: /AGI\s*\+\s*(\d+)/i, stat: 'agi' },
      { regex: /VIT\s*\+\s*(\d+)/i, stat: 'vit' },
      { regex: /INT\s*\+\s*(\d+)/i, stat: 'int' },
      { regex: /DES\s*\+\s*(\d+)/i, stat: 'dex' },
      { regex: /SOR\s*\+\s*(\d+)/i, stat: 'luk' },
      
      // HP/SP
      { regex: /HP M[aá]ximo\s*\+\s*(\d+)%/i, stat: 'hp_percent' },
      { regex: /HP M[aá]ximo\s*\+\s*(\d+)(?!%)/i, stat: 'hp_flat' },
      { regex: /SP M[aá]ximo\s*\+\s*(\d+)%/i, stat: 'sp_percent' },
      { regex: /SP M[aá]ximo\s*\+\s*(\d+)(?!%)/i, stat: 'sp_flat' },
      
      // Skill damage
      { regex: /(?:Aumenta o )?[Dd]ano (?:de )?\[([^\]]+)\](?: em)?\s*\+?\s*(\d+)%/i, stat: 'skill_damage', isSkill: true },
    ];
    
    for (const pattern of patterns) {
      const match = normalized.match(pattern.regex);
      if (match) {
        if (pattern.isSkill) {
          return {
            stat: pattern.stat,
            skill: match[1],
            value: parseInt(match[2])
          };
        }
        return {
          stat: pattern.stat,
          value: parseInt(match[1])
        };
      }
    }
    
    return null;
  }
  
  // Determinar slot do equipamento baseado no campo equip (bitmask)
  function getSlot(item) {
    const equip = item.equip || 0;
    
    if (item.type === 4) return 'weapon'; // Arma
    if (item.type === 6) return 'card'; // Carta
    
    // Bitmask para armaduras
    if (equip & 256) return 'topo';      // Upper headgear
    if (equip & 512) return 'meio';      // Middle headgear
    if (equip & 1) return 'baixo';       // Lower headgear
    if (equip & 16) return 'armadura';   // Armor
    if (equip & 32) return 'escudo';     // Shield
    if (equip & 4) return 'capa';        // Garment
    if (equip & 64) return 'sapato';     // Footgear
    if (equip & 136) return 'acessorio'; // Accessory
    
    return 'outro';
  }
  
  // Buscar detalhes de um item
  async function fetchItemDetails(nameid) {
    try {
      const response = await fetch(`${API}/database/item?nameid=${nameid}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.data || data;
    } catch (e) {
      return null;
    }
  }
  
  // Buscar página de itens
  async function fetchPage(page) {
    const url = `${API}/database/items?page=${page}&rows_per_page=100&filters=${encodeURIComponent(JSON.stringify({name:''}))}`;
    const response = await fetch(url);
    return await response.json();
  }
  
  console.log('🚀 Iniciando coleta completa de efeitos...');
  console.log('⏰ Isso pode demorar 10-20 minutos. Não feche a aba!');
  
  // Coletar todos os IDs
  const first = await fetchPage(1);
  console.log(`📊 Total: ${first.total_count} itens em ${first.total_pages} páginas`);
  
  const allItems = [...first.rows];
  for (let page = 2; page <= first.total_pages; page++) {
    const data = await fetchPage(page);
    if (data.rows) allItems.push(...data.rows);
    if (page % 50 === 0) console.log(`📄 Páginas: ${page}/${first.total_pages}`);
    await delay(50);
  }
  
  // Filtrar por tipo
  const weapons = allItems.filter(i => i.type === 4 && i.atk > 0);
  const armors = allItems.filter(i => i.type === 5);
  const cards = allItems.filter(i => i.type === 6);
  
  console.log(`\n🗡️ Armas físicas: ${weapons.length}`);
  console.log(`🛡️ Armaduras: ${armors.length}`);
  console.log(`🃏 Cartas: ${cards.length}`);
  
  // Processar armas
  console.log('\n📝 Coletando detalhes das armas...');
  const weaponsWithEffects = [];
  
  for (let i = 0; i < weapons.length; i++) {
    const weapon = weapons[i];
    const details = await fetchItemDetails(weapon.nameid);
    
    const description = details?.description || '';
    const effects = parseEffects(description);
    
    weaponsWithEffects.push({
      id: weapon.nameid,
      nameid: weapon.nameid,
      name: weapon.jname || weapon.name,
      slot: 'weapon',
      slots: weapon.slot || 0,
      attack: weapon.atk || 0,
      weaponLevel: weapon.wlv || 1,
      requiredLevel: weapon.elv || 0,
      weight: weapon.weight || 0,
      refinable: weapon.flag_refine === 1,
      description: cleanHTML(description),
      effects: effects,
      image: `https://api.ragnatales.com.br/database/item/icon?nameid=${weapon.nameid}`
    });
    
    if ((i + 1) % 50 === 0) {
      console.log(`🗡️ Armas: ${i + 1}/${weapons.length}`);
    }
    await delay(30);
  }
  
  // Processar armaduras
  console.log('\n📝 Coletando detalhes das armaduras...');
  const armorsWithEffects = [];
  
  for (let i = 0; i < armors.length; i++) {
    const armor = armors[i];
    const details = await fetchItemDetails(armor.nameid);
    
    const description = details?.description || '';
    const effects = parseEffects(description);
    
    armorsWithEffects.push({
      id: armor.nameid,
      nameid: armor.nameid,
      name: armor.jname || armor.name,
      slot: getSlot(armor),
      slots: armor.slot || 0,
      defense: armor.def || 0,
      requiredLevel: armor.elv || 0,
      weight: armor.weight || 0,
      refinable: armor.flag_refine === 1,
      description: cleanHTML(description),
      effects: effects,
      image: `https://api.ragnatales.com.br/database/item/icon?nameid=${armor.nameid}`
    });
    
    if ((i + 1) % 100 === 0) {
      console.log(`🛡️ Armaduras: ${i + 1}/${armors.length}`);
    }
    await delay(30);
  }
  
  // Processar cartas
  console.log('\n📝 Coletando detalhes das cartas...');
  const cardsWithEffects = [];
  
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const details = await fetchItemDetails(card.nameid);
    
    const description = details?.description || '';
    const effects = parseEffects(description);
    
    // Determinar slots compatíveis baseado na descrição
    let compatibleSlots = [];
    const descLower = description.toLowerCase();
    if (descLower.includes('arma') || descLower.includes('weapon')) compatibleSlots.push('weapon');
    if (descLower.includes('armadura') || descLower.includes('armor')) compatibleSlots.push('armadura');
    if (descLower.includes('escudo') || descLower.includes('shield')) compatibleSlots.push('escudo');
    if (descLower.includes('capa') || descLower.includes('garment')) compatibleSlots.push('capa');
    if (descLower.includes('sapato') || descLower.includes('calçado') || descLower.includes('footgear')) compatibleSlots.push('sapato');
    if (descLower.includes('acessório') || descLower.includes('accessory')) compatibleSlots.push('acessorio');
    if (descLower.includes('chapéu') || descLower.includes('headgear') || descLower.includes('topo')) {
      compatibleSlots.push('topo', 'meio', 'baixo');
    }
    
    // Se não encontrou nenhum, assume que serve em qualquer lugar
    if (compatibleSlots.length === 0) {
      compatibleSlots = ['weapon', 'armadura', 'escudo', 'capa', 'sapato', 'acessorio', 'topo', 'meio', 'baixo'];
    }
    
    cardsWithEffects.push({
      id: card.nameid,
      nameid: card.nameid,
      name: card.jname || card.name,
      compatibleSlots: compatibleSlots,
      description: cleanHTML(description),
      effects: effects,
      image: `https://api.ragnatales.com.br/database/item/icon?nameid=${card.nameid}`
    });
    
    if ((i + 1) % 100 === 0) {
      console.log(`🃏 Cartas: ${i + 1}/${cards.length}`);
    }
    await delay(30);
  }
  
  console.log('\n✅ Coleta completa!');
  console.log(`🗡️ Armas com efeitos: ${weaponsWithEffects.length}`);
  console.log(`🛡️ Armaduras com efeitos: ${armorsWithEffects.length}`);
  console.log(`🃏 Cartas com efeitos: ${cardsWithEffects.length}`);
  
  // Baixar arquivos
  console.log('\n📥 Baixando arquivos...');
  
  downloadJSON(weaponsWithEffects, 'weapons-with-effects.json');
  await delay(1000);
  
  downloadJSON(armorsWithEffects, 'equipments-with-effects.json');
  await delay(1000);
  
  downloadJSON(cardsWithEffects, 'cards-with-effects.json');
  
  console.log('\n🎉 PRONTO! 3 arquivos baixados!');
  console.log('📁 Mova para: public/data/ragnatales/');
  
  // Mostrar exemplo
  const exemplo = weaponsWithEffects.find(w => w.name.includes('Ignição'));
  if (exemplo) {
    console.log('\n📝 Exemplo (Maça de Ignição):');
    console.log(JSON.stringify(exemplo, null, 2));
  }
})();

