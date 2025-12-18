/**
 * SCRIPT ALTERNATIVO - Baixa imagens acessando a página de cada item
 * Pode funcionar melhor que a API direta
 * 
 * INSTRUÇÕES:
 * 1. Abra https://ragnatales.com.br/db/items no navegador
 * 2. Abra o DevTools (F12) → Console
 * 3. Cole este script e pressione Enter
 */

(async function() {
  // Apenas os primeiros 50 para testar
  const TEST_IDS = [
    "32257", // Anel de Júpiter
    "24940","510032","24954","700032","18152","18149","1865","24951","630012",
    "550026","24946","28762","24944","540021","32301","640019","24952","640033",
    "610022","580017","24949","16066","600013","24989","530010","24987","550088",
    "540022","24945","28629","24938","500025","24955","820002","820000","560019",
    "24947","24996","2000007","28767","24950","610020","610015","24907","13412",
    "13413","24942","530013","32006"
  ];

  console.log('🔍 Testando download de', TEST_IDS.length, 'imagens...');
  console.log('Verificando diferentes endpoints...\n');

  // Testar diferentes URLs
  const endpoints = [
    (id) => `https://api.ragnatales.com.br/database/item/icon?nameid=${id}`,
    (id) => `https://ragnatales.com.br/database/item/icon?nameid=${id}`,
    (id) => `https://static.divine-pride.net/images/items/item/${id}.png`,
  ];

  for (const getUrl of endpoints) {
    const testId = "32257"; // Anel de Júpiter
    const url = getUrl(testId);
    console.log('🔗 Testando:', url);
    
    try {
      const response = await fetch(url);
      console.log('   Status:', response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('   Tamanho:', blob.size, 'bytes');
        console.log('   Tipo:', blob.type);
        
        if (blob.size > 100 && (blob.type.includes('image') || blob.type === 'application/octet-stream')) {
          console.log('   ✅ FUNCIONA!\n');
        } else {
          console.log('   ❌ Resposta inválida\n');
        }
      } else {
        console.log('   ❌ Erro HTTP\n');
      }
    } catch (e) {
      console.log('   ❌ Erro:', e.message, '\n');
    }
    
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n=== Resultado ===');
  console.log('Se nenhum endpoint funcionou, as imagens podem não estar disponíveis.');
  console.log('Tente verificar manualmente: https://ragnatales.com.br/db/items/32257');
})();



