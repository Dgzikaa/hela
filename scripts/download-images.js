const https = require('https');
const fs = require('fs');
const path = require('path');

// Criar diretórios
const bossesDir = path.join(__dirname, '../public/images/bosses');
if (!fs.existsSync(bossesDir)) {
  fs.mkdirSync(bossesDir, { recursive: true });
}

// Bosses para baixar
const bosses = [
  { id: 28221, name: 'hela.png' },
  { id: 21857, name: 'freylith.png' },
  { id: 20431, name: 'tyrgrim.png' },
  { id: 28292, name: 'skollgrim.png' },
  { id: 21856, name: 'baldira.png' },
  { id: 20433, name: 'thorvald.png' },
  { id: 21858, name: 'glacius.png' }
];

// Função para baixar imagem
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✅ Baixado: ${filepath}`);
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${url}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Baixar todas as imagens
async function downloadAll() {
  console.log('🔽 Baixando imagens dos bosses...\n');
  
  for (const boss of bosses) {
    const url = `https://api.ragnatales.com.br/database/mob/image?mob_id=${boss.id}`;
    const filepath = path.join(bossesDir, boss.name);
    
    try {
      await downloadImage(url, filepath);
    } catch (error) {
      console.error(`❌ Erro ao baixar ${boss.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Download concluído!');
}

downloadAll();

