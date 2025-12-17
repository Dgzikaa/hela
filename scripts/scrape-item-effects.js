/**
 * SCRIPT PARA COLETAR EFEITOS DOS ITENS DO RAGNATALES
 * 
 * INSTRUÇÕES:
 * 1. Abra https://ragnatales.com.br/db/items no navegador
 * 2. Abra o DevTools (F12) → Console
 * 3. Cole este script e pressione Enter
 * 4. Aguarde a coleta (pode demorar alguns minutos)
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
  
  // Parser de efeitos - converte descrição em efeitos estruturados
  function parseEffects(description, item) {
    const effects = [];
    if (!description) return effects;
    
    const lines = description.split('\n').map(l => l.trim()).filter(l => l);
    let currentCondition = null;
    
    for (const line of lines) {
      // Detectar condições de refino
      if (line.match(/refino\s*\+?(\d+)\s*(ou\s*mais|ou\s*superior|\+)/i)) {
        const match = line.match(/refino\s*\+?(\d+)/i);
        currentCondition = { type: 'refine_min', value: parseInt(match[1]) };
        continue;
      }
      
      if (line.match(/a cada refino/i)) {
        currentCondition = { type: 'per_refine' };
        continue;
      }
      
      if (line.match(/até o \+(\d+)/i)) {
        const match = line.match(/até o \+(\d+)/i);
        currentCondition = { type: 'per_refine', max: parseInt(match[1]) };
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
    const patterns = [
      // ATK +X%
      { regex: /ATQ?\s*\+?\s*(\d+)%/i, stat: 'atk_percent', multiplier: 1 },
      { regex: /ATQ?\s*\+?\s*(\d+)(?!%)/i, stat: 'atk_flat', multiplier: 1 },
      
      // Dano físico
      { regex: /dano\s*f[ií]sico\s*\+?\s*(\d+)%/i, stat: 'physical_damage_percent', multiplier: 1 },
      { regex: /dano\s*f[ií]sico\s*a\s*dist[aâ]ncia\s*\+?\s*(\d+)%/i, stat: 'ranged_damage_percent', multiplier: 1 },
      { regex: /dano\s*f[ií]sico\s*corpo\s*a\s*corpo\s*\+?\s*(\d+)%/i, stat: 'melee_damage_percent', multiplier: 1 },
      
      // Dano vs Tamanho
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?tamanho\s*pequeno\s*\+?\s*(\d+)%/i, stat: 'damage_vs_small', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?tamanho\s*m[ée]dio\s*\+?\s*(\d+)%/i, stat: 'damage_vs_medium', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?tamanho\s*grande\s*\+?\s*(\d+)%/i, stat: 'damage_vs_large', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?todos\s*(?:os\s*)?tamanhos?\s*\+?\s*(\d+)%/i, stat: 'damage_vs_all_sizes', multiplier: 1 },
      
      // Dano vs Raça
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:da\s*)?ra[çc]a\s*morto[s-]?vivo[s]?\s*\+?\s*(\d+)%/i, stat: 'damage_vs_undead', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:da\s*)?ra[çc]a\s*dem[oô]nio\s*\+?\s*(\d+)%/i, stat: 'damage_vs_demon', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:da\s*)?ra[çc]a\s*humanoide\s*\+?\s*(\d+)%/i, stat: 'damage_vs_demi_human', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:da\s*)?ra[çc]a\s*bruto\s*\+?\s*(\d+)%/i, stat: 'damage_vs_brute', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:da\s*)?ra[çc]a\s*planta\s*\+?\s*(\d+)%/i, stat: 'damage_vs_plant', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:da\s*)?ra[çc]a\s*inseto\s*\+?\s*(\d+)%/i, stat: 'damage_vs_insect', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:da\s*)?ra[çc]a\s*peixe\s*\+?\s*(\d+)%/i, stat: 'damage_vs_fish', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:da\s*)?ra[çc]a\s*drag[aã]o\s*\+?\s*(\d+)%/i, stat: 'damage_vs_dragon', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:da\s*)?ra[çc]a\s*anjo\s*\+?\s*(\d+)%/i, stat: 'damage_vs_angel', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:da\s*)?ra[çc]a\s*amorfo\s*\+?\s*(\d+)%/i, stat: 'damage_vs_formless', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?todas\s*(?:as\s*)?ra[çc]as?\s*\+?\s*(\d+)%/i, stat: 'damage_vs_all_races', multiplier: 1 },
      
      // Dano vs Elemento
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?elemento\s*fogo\s*\+?\s*(\d+)%/i, stat: 'damage_vs_fire', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?elemento\s*[aá]gua\s*\+?\s*(\d+)%/i, stat: 'damage_vs_water', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?elemento\s*vento\s*\+?\s*(\d+)%/i, stat: 'damage_vs_wind', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?elemento\s*terra\s*\+?\s*(\d+)%/i, stat: 'damage_vs_earth', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?elemento\s*sombrio\s*\+?\s*(\d+)%/i, stat: 'damage_vs_shadow', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?elemento\s*sagrado\s*\+?\s*(\d+)%/i, stat: 'damage_vs_holy', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?elemento\s*fantasma\s*\+?\s*(\d+)%/i, stat: 'damage_vs_ghost', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?elemento\s*veneno\s*\+?\s*(\d+)%/i, stat: 'damage_vs_poison', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?elemento\s*neutro\s*\+?\s*(\d+)%/i, stat: 'damage_vs_neutral', multiplier: 1 },
      { regex: /dano\s*(?:f[ií]sico\s*)?(?:contra\s*)?(?:monstros?\s*)?(?:de\s*)?elemento\s*maldito\s*\+?\s*(\d+)%/i, stat: 'damage_vs_undead_ele', multiplier: 1 },
      
      // Ignora DEF
      { regex: /ignora\s*(\d+)%\s*(?:da\s*)?DEF/i, stat: 'ignore_def_percent', multiplier: 1 },
      { regex: /ignora\s*(\d+)%\s*(?:da\s*)?MDEF/i, stat: 'ignore_mdef_percent', multiplier: 1 },
      
      // Crítico
      { regex: /dano\s*cr[ií]tico\s*\+?\s*(\d+)%/i, stat: 'crit_damage_percent', multiplier: 1 },
      { regex: /taxa\s*(?:de\s*)?cr[ií]tico\s*\+?\s*(\d+)%?/i, stat: 'crit_rate', multiplier: 1 },
      
      // ASPD
      { regex: /velocidade\s*(?:de\s*)?ataque\s*\+?\s*(\d+)%/i, stat: 'aspd_percent', multiplier: 1 },
      
      // Habilidades específicas
      { regex: /dano\s*(?:de\s*)?\[([^\]]+)\]\s*(?:em\s*)?\+?\s*(\d+)%/i, stat: 'skill_damage', skill: true },
      { regex: /aumenta\s*(?:o\s*)?dano\s*(?:de\s*)?\[([^\]]+)\]\s*(?:em\s*)?\+?\s*(\d+)%/i, stat: 'skill_damage', skill: true },
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        if (pattern.skill) {
          return {
            stat: pattern.stat,
            skill: match[1],
            value: parseInt(match[2]) * (pattern.multiplier || 1)
          };
        }
        return {
          stat: pattern.stat,
          value: parseInt(match[1]) * (pattern.multiplier || 1)
        };
      }
    }
    
    return null;
  }
  
  // Buscar detalhes de um item
  async function fetchItemDetails(nameid) {
    try {
      const response = await fetch(`${API}/database/item?nameid=${nameid}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      return null;
    }
  }
  
  // Carregar lista de itens já baixados
  async function fetchPage(page) {
    const url = `${API}/database/items?page=${page}&rows_per_page=100&filters=${encodeURIComponent(JSON.stringify({name:''}))}`;
    const response = await fetch(url);
    return await response.json();
  }
  
  console.log('🚀 Iniciando coleta de efeitos...');
  
  // Primeiro, coletar todos os IDs
  const first = await fetchPage(1);
  console.log(`📊 Total: ${first.total_count} itens`);
  
  const allItems = [...first.rows];
  for (let page = 2; page <= Math.min(first.total_pages, 10); page++) { // Limitar para teste
    const data = await fetchPage(page);
    if (data.rows) allItems.push(...data.rows);
    console.log(`Página ${page}/${first.total_pages}`);
    await delay(100);
  }
  
  // Filtrar apenas armas e armaduras (type 4 e 5)
  const weapons = allItems.filter(i => i.type === 4);
  const armors = allItems.filter(i => i.type === 5);
  const cards = allItems.filter(i => i.type === 6);
  
  console.log(`🗡️ Armas: ${weapons.length}, 🛡️ Armaduras: ${armors.length}, 🃏 Cartas: ${cards.length}`);
  
  // Coletar detalhes de cada arma (primeiras 50 para teste)
  const weaponsWithEffects = [];
  const testWeapons = weapons.slice(0, 50);
  
  console.log('📝 Coletando detalhes das armas...');
  for (let i = 0; i < testWeapons.length; i++) {
    const weapon = testWeapons[i];
    const details = await fetchItemDetails(weapon.nameid);
    
    if (details) {
      const effects = parseEffects(details.description, weapon);
      weaponsWithEffects.push({
        id: weapon.nameid,
        nameid: weapon.nameid,
        name: weapon.jname || weapon.name,
        slots: weapon.slot || 0,
        attack: weapon.atk || 0,
        weaponLevel: weapon.wlv || 1,
        requiredLevel: weapon.elv || 0,
        description: details.description,
        effects: effects,
        image: `https://api.ragnatales.com.br/database/item/icon?nameid=${weapon.nameid}`
      });
    }
    
    if ((i + 1) % 10 === 0) {
      console.log(`Armas: ${i + 1}/${testWeapons.length}`);
    }
    await delay(100);
  }
  
  console.log(`✅ Armas processadas: ${weaponsWithEffects.length}`);
  downloadJSON(weaponsWithEffects, 'ragnatales-weapons-with-effects.json');
  
  console.log('🎉 PRONTO! Arquivo baixado.');
  console.log('Para coletar TODOS os itens, remova o limite de páginas e itens no código.');
})();


