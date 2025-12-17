/**
 * SCRIPT PARA BAIXAR IMAGENS DO RAGNATALES (V2)
 * 
 * INSTRUÇÕES:
 * 1. Abra https://ragnatales.com.br/db/items no navegador
 * 2. Abra o DevTools (F12) → Console
 * 3. Cole este script e pressione Enter
 * 4. Aguarde - pode demorar alguns minutos
 * 5. O arquivo ZIP será baixado automaticamente
 */

(async function() {
  const API = 'https://api.ragnatales.com.br';
  const delay = ms => new Promise(r => setTimeout(r, ms));
  
  // Carregar JSZip
  console.log('📦 Carregando JSZip...');
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  document.head.appendChild(script);
  
  await new Promise(resolve => {
    script.onload = resolve;
    setTimeout(resolve, 5000);
  });
  
  if (typeof JSZip === 'undefined') {
    console.error('❌ Erro ao carregar JSZip');
    return;
  }
  
  console.log('✅ JSZip carregado!');
  
  // Coletar IDs primeiro
  console.log('🔍 Coletando IDs dos itens...');
  
  async function fetchPage(page) {
    const url = `${API}/database/items?page=${page}&rows_per_page=100&filters=${encodeURIComponent(JSON.stringify({name:''}))}`;
    const response = await fetch(url);
    return response.json();
  }
  
  const first = await fetchPage(1);
  console.log(`📊 Total: ${first.total_count} itens`);
  
  // Coletar apenas armas (type=4), armaduras (type=5) e cartas (type=6)
  const itemIds = [];
  const allItems = [...first.rows];
  
  for (let page = 2; page <= Math.min(first.total_pages, 400); page++) {
    try {
      const data = await fetchPage(page);
      if (data.rows) allItems.push(...data.rows);
      if (page % 50 === 0) console.log(`📄 Página ${page}/${first.total_pages}`);
      await delay(30);
    } catch (e) {
      console.log(`⚠️ Erro na página ${page}, continuando...`);
    }
  }
  
  // Filtrar itens relevantes (armas, armaduras, cartas)
  const relevantItems = allItems.filter(i => [4, 5, 6].includes(i.type));
  console.log(`🎯 Itens relevantes: ${relevantItems.length}`);
  
  const zip = new JSZip();
  
  let downloaded = 0;
  let failed = 0;
  const batchSize = 5;
  
  async function downloadImage(item) {
    const id = item.nameid;
    const url = `${API}/database/item/icon?nameid=${id}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      if (blob.size < 100) throw new Error('Imagem muito pequena');
      
      const arrayBuffer = await blob.arrayBuffer();
      zip.file(`${id}.png`, arrayBuffer);
      downloaded++;
      return true;
    } catch (e) {
      failed++;
      return false;
    }
  }
  
  console.log('📥 Baixando imagens...');
  
  // Processar em lotes
  for (let i = 0; i < relevantItems.length; i += batchSize) {
    const batch = relevantItems.slice(i, i + batchSize);
    await Promise.all(batch.map(downloadImage));
    
    if ((i + batchSize) % 100 === 0 || i + batchSize >= relevantItems.length) {
      const progress = Math.round(((i + batch.length) / relevantItems.length) * 100);
      console.log(`⏳ ${progress}% (${downloaded} ok, ${failed} falhas)`);
    }
    
    await delay(50);
  }
  
  console.log(`✅ Download: ${downloaded} imagens, ${failed} falhas`);
  console.log('📦 Gerando ZIP (pode demorar)...');
  
  const content = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = 'ragnatales-images.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  console.log('🎉 PRONTO! Extraia o ZIP em public/images/ragnatales/');
})();

