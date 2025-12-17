/**
 * SCRIPT PARA BAIXAR IMAGENS DO RAGNATALES
 * 
 * INSTRUÇÕES:
 * 1. Abra https://ragnatales.com.br/db/items no navegador
 * 2. Abra o DevTools (F12) → Console
 * 3. Cole este script e pressione Enter
 * 4. As imagens serão baixadas em um arquivo ZIP
 * 
 * NOTA: Este script usa JSZip que precisa ser carregado primeiro
 */

(async function() {
  // Carregar JSZip
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  document.head.appendChild(script);
  
  await new Promise(resolve => {
    script.onload = resolve;
    setTimeout(resolve, 3000); // fallback
  });
  
  if (typeof JSZip === 'undefined') {
    console.error('❌ Erro ao carregar JSZip. Tente recarregar a página.');
    return;
  }
  
  console.log('📦 JSZip carregado!');
  
  // Carregar dados salvos
  const weaponsData = await fetch('http://localhost:3000/data/ragnatales/weapons.json').then(r => r.json()).catch(() => []);
  const equipmentsData = await fetch('http://localhost:3000/data/ragnatales/equipments.json').then(r => r.json()).catch(() => []);
  const cardsData = await fetch('http://localhost:3000/data/ragnatales/cards.json').then(r => r.json()).catch(() => []);
  
  const allItems = [...weaponsData, ...equipmentsData, ...cardsData];
  console.log(`📋 Total de itens: ${allItems.length}`);
  
  if (allItems.length === 0) {
    console.error('❌ Nenhum item encontrado. Certifique-se que o servidor está rodando em localhost:3000');
    return;
  }
  
  const zip = new JSZip();
  const imgFolder = zip.folder('images');
  
  let downloaded = 0;
  let failed = 0;
  const batchSize = 10;
  
  async function downloadImage(item) {
    const id = item.id || item.nameid;
    const url = `https://api.ragnatales.com.br/database/item/icon?nameid=${id}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      imgFolder.file(`${id}.png`, arrayBuffer);
      downloaded++;
      return true;
    } catch (e) {
      failed++;
      return false;
    }
  }
  
  // Processar em lotes
  for (let i = 0; i < allItems.length; i += batchSize) {
    const batch = allItems.slice(i, i + batchSize);
    await Promise.all(batch.map(downloadImage));
    
    const progress = Math.round(((i + batch.length) / allItems.length) * 100);
    console.log(`⏳ Progresso: ${progress}% (${downloaded} baixadas, ${failed} falhas)`);
  }
  
  console.log(`✅ Download completo! ${downloaded} imagens baixadas, ${failed} falhas`);
  console.log('📦 Gerando arquivo ZIP...');
  
  const content = await zip.generateAsync({ type: 'blob' });
  
  // Baixar ZIP
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = 'ragnatales-images.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  console.log('🎉 Arquivo ZIP baixado! Extraia em public/images/ragnatales/');
})();

