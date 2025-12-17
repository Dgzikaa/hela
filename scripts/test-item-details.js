/**
 * TESTE - Verificar se a API retorna detalhes do item
 * 
 * Cole no console do navegador em https://ragnatales.com.br/db/items
 */

(async function() {
  const API = 'https://api.ragnatales.com.br';
  
  // Testar com a Maça de Ignição (ID provável)
  const testIds = [1545, 1546, 1547, 1548, 1549, 1550, 16000, 16001, 16002];
  
  console.log('🔍 Testando API de detalhes...');
  
  for (const id of testIds) {
    try {
      const response = await fetch(`${API}/database/item?nameid=${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`\n✅ ID ${id}: ${data.jname || data.name}`);
        console.log('Descrição:', data.description?.substring(0, 200) + '...');
      } else {
        console.log(`❌ ID ${id}: Status ${response.status}`);
      }
    } catch (e) {
      console.log(`❌ ID ${id}: Erro - ${e.message}`);
    }
  }
  
  // Buscar a Maça de Ignição pelo nome
  console.log('\n🔍 Buscando "Maça de Ignição"...');
  const searchResponse = await fetch(`${API}/database/items?page=1&rows_per_page=10&filters=${encodeURIComponent(JSON.stringify({name:'Maça de Ignição'}))}`);
  const searchData = await searchResponse.json();
  
  if (searchData.rows && searchData.rows.length > 0) {
    const maca = searchData.rows[0];
    console.log('✅ Encontrada:', maca.jname || maca.name, 'ID:', maca.nameid);
    
    // Buscar detalhes
    const detailsResponse = await fetch(`${API}/database/item?nameid=${maca.nameid}`);
    const details = await detailsResponse.json();
    console.log('\n📝 Detalhes completos:');
    console.log(JSON.stringify(details, null, 2));
  } else {
    console.log('❌ Maça de Ignição não encontrada');
  }
})();


