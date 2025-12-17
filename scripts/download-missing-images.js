/**
 * SCRIPT PARA BAIXAR IMAGENS FALTANTES DO RAGNATALES
 * 
 * INSTRUÇÕES:
 * 1. Abra https://ragnatales.com.br/db/items no navegador
 * 2. Abra o DevTools (F12) → Console
 * 3. Cole este script e pressione Enter
 * 4. As imagens serão baixadas em lotes
 */

(async function() {
  // IDs das imagens faltantes (gerado automaticamente)
  const missingIds = [
    24940, 510032, 24954, 700032, 18152, 18149, 1865, 24951, 630012, 550026,
    500026, 24939, 1391, 24941, 500059, 630025, 24952, 620005, 510031, 24953,
    // Adicione mais IDs aqui se necessário
  ];
  
  // Ou buscar TODOS os IDs do JSON diretamente
  console.log('🔍 Buscando lista completa de IDs...');
  
  const API = 'https://api.ragnatales.com.br';
  const delay = ms => new Promise(r => setTimeout(r, ms));
  
  // Função para baixar uma imagem
  async function downloadImage(nameid) {
    try {
      const url = `${API}/database/item/icon?nameid=${nameid}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      
      const blob = await response.blob();
      return { nameid, blob };
    } catch (e) {
      return null;
    }
  }
  
  // Função para salvar arquivo
  function saveFile(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }
  
  // Carregar JSZip
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  document.head.appendChild(script);
  
  await new Promise(resolve => {
    script.onload = resolve;
    setTimeout(resolve, 3000);
  });
  
  if (typeof JSZip === 'undefined') {
    console.error('❌ Erro ao carregar JSZip');
    return;
  }
  
  console.log('📦 JSZip carregado!');
  
  // Buscar todos os itens para pegar os IDs
  async function fetchAllItems() {
    const firstPage = await fetch(`${API}/database/items?page=1&rows_per_page=100&filters=${encodeURIComponent(JSON.stringify({name:''}))}`).then(r => r.json());
    const totalPages = firstPage.total_pages;
    const allItems = [...firstPage.rows];
    
    console.log(`📊 Total: ${firstPage.total_count} itens em ${totalPages} páginas`);
    
    for (let page = 2; page <= totalPages; page++) {
      const data = await fetch(`${API}/database/items?page=${page}&rows_per_page=100&filters=${encodeURIComponent(JSON.stringify({name:''}))}`).then(r => r.json());
      if (data.rows) allItems.push(...data.rows);
      if (page % 50 === 0) console.log(`Página ${page}/${totalPages}`);
      await delay(30);
    }
    
    return allItems;
  }
  
  console.log('🚀 Buscando todos os itens...');
  const allItems = await fetchAllItems();
  const allIds = [...new Set(allItems.map(i => i.nameid))];
  
  console.log(`📋 Total de IDs únicos: ${allIds.length}`);
  console.log('📥 Iniciando download das imagens...');
  
  const zip = new JSZip();
  const imgFolder = zip.folder('images');
  
  let downloaded = 0;
  let failed = 0;
  const batchSize = 20;
  
  for (let i = 0; i < allIds.length; i += batchSize) {
    const batch = allIds.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(downloadImage));
    
    for (const result of results) {
      if (result) {
        const arrayBuffer = await result.blob.arrayBuffer();
        imgFolder.file(`${result.nameid}.png`, arrayBuffer);
        downloaded++;
      } else {
        failed++;
      }
    }
    
    const progress = Math.round(((i + batch.length) / allIds.length) * 100);
    if (progress % 10 === 0 || i + batchSize >= allIds.length) {
      console.log(`⏳ Progresso: ${progress}% (${downloaded} ok, ${failed} falhas)`);
    }
    
    await delay(100);
  }
  
  console.log(`✅ Download completo! ${downloaded} imagens`);
  console.log('📦 Gerando arquivo ZIP...');
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveFile(content, 'ragnatales-all-images.zip');
  
  console.log('🎉 Arquivo ZIP baixado! Extraia em public/images/ragnatales/');
})();


