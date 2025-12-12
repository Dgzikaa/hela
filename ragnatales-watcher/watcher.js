const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const notifier = require('node-notifier');
const open = require('open');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

puppeteer.use(StealthPlugin());

// Arquivos
const CONFIG_FILE = path.join(__dirname, 'config.json');
const HISTORY_FILE = path.join(__dirname, 'price-history.json');
const ALERTS_FILE = path.join(__dirname, 'alerts.log');
const ACTIVE_ALERTS_FILE = path.join(__dirname, 'active-alerts.json');

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4';

// Itens para sincronizar com Supabase
const ITEMS_TO_SYNC = [
    { key: 'poEscarlate', id: 1000398, name: 'Pó de Meteorita Escarlate' },
    { key: 'poSolar', id: 1000399, name: 'Pó de Meteorita Solar' },
    { key: 'poVerdejante', id: 1000400, name: 'Pó de Meteorita Verdejante' },
    { key: 'poCeleste', id: 1000401, name: 'Pó de Meteorita Celeste' },
    { key: 'poOceanica', id: 1000402, name: 'Pó de Meteorita Oceânica' },
    { key: 'poCrepuscular', id: 1000403, name: 'Pó de Meteorita Crepuscular' },
    { key: 'almaSombria', id: 25986, name: 'Alma Sombria' },
    { key: 'bencaoFerreiro', id: 6635, name: 'Bênção do Ferreiro' },
    { key: 'bencaoMestreFerreiro', id: 1006442, name: 'Bênção do Mestre-Ferreiro' },
    { key: 'desmembrador', id: 1600008, name: 'Desmembrador Químico' },
    { key: 'auraMente', id: 19439, name: 'Aura da Mente Corrompida' },
    { key: 'mantoAbstrato', id: 20986, name: 'Manto Abstrato' },
    { key: 'livroPerverso', id: 540042, name: 'Livro Perverso' },
    { key: 'garraFerro', id: 1837, name: 'Garra de Ferro' },
    { key: 'jackEstripadora', id: 28767, name: 'Jack Estripadora' },
    { key: 'mascaraNobreza', id: 5985, name: 'Máscara da Nobreza' },
    { key: 'livroAmaldicoado', id: 18752, name: 'Livro Amaldiçoado' },
    { key: 'quepeGeneral', id: 19379, name: 'Quepe do General' },
    { key: 'chapeuMaestro', id: 5905, name: 'Chapéu de Maestro' },
];

// Runas para sincronizar
const RUNAS_TO_SYNC = [
    { id: 17917, name: 'Runa Ruby da Celia' },
    { id: 17918, name: 'Runa Ruby da Gertie' },
    { id: 17919, name: 'Runa Ruby do Alphoccio' },
    { id: 17920, name: 'Runa Ruby da Tretini' },
    { id: 17921, name: 'Runa Ruby do Randel' },
    { id: 17922, name: 'Runa Safira da Celia' },
    { id: 17923, name: 'Runa Safira da Gertie' },
    { id: 17924, name: 'Runa Safira do Alphoccio' },
    { id: 17925, name: 'Runa Safira do Flamel' },
    { id: 17926, name: 'Runa Safira da Tretini' },
    { id: 17927, name: 'Runa Topazio da Celia' },
    { id: 17928, name: 'Runa Topazio da Gertie' },
    { id: 17929, name: 'Runa Topazio do Chen' },
    { id: 17930, name: 'Runa Topazio da Tretini' },
    { id: 17931, name: 'Runa Topazio do Alphoccio' },
    { id: 17932, name: 'Runa Ametista do Alphoccio' },
    { id: 17933, name: 'Runa Ametista do Randel' },
    { id: 17934, name: 'Runa Ametista do Chen' },
    { id: 17935, name: 'Runa Ametista do Flamel' },
    { id: 17936, name: 'Runa Ametista da Gertie' },
    { id: 17937, name: 'Runa Jade do Alphoccio' },
    { id: 17938, name: 'Runa Jade do Chen' },
    { id: 17939, name: 'Runa Jade do Flamel' },
    { id: 17940, name: 'Runa Jade da Tretini' },
    { id: 17941, name: 'Runa Jade da Gertie' },
    { id: 17942, name: 'Runa Citrina do Alphoccio' },
    { id: 17943, name: 'Runa Citrina do Randel' },
    { id: 17944, name: 'Runa Citrina do Chen' },
    { id: 17945, name: 'Runa Citrina da Gertie' },
    { id: 17946, name: 'Runa Citrina do Flamel' },
];

// Carrega alertas ativos (para não repetir e poder deletar)
function loadActiveAlerts() {
    if (fs.existsSync(ACTIVE_ALERTS_FILE)) {
        return JSON.parse(fs.readFileSync(ACTIVE_ALERTS_FILE, 'utf-8'));
    }
    return {};
}

// Salva alertas ativos
function saveActiveAlerts(alerts) {
    fs.writeFileSync(ACTIVE_ALERTS_FILE, JSON.stringify(alerts, null, 2));
}

// Gera ID único para um alerta (item + vendedor + preço)
function getAlertKey(nameid, charName, price) {
    return `${nameid}_${charName}_${price}`;
}

// Deleta mensagem do Discord
async function deleteDiscordMessage(webhookUrl, messageId) {
    try {
        // Extrai a URL base do webhook
        const deleteUrl = `${webhookUrl}/messages/${messageId}`;
        const response = await fetch(deleteUrl, { method: 'DELETE' });
        return response.ok;
    } catch (error) {
        console.log(`   ⚠️ Erro ao deletar msg Discord: ${error.message}`);
        return false;
    }
}

// Atualiza item no Supabase
async function updateSupabase(table, data) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${table === 'market_prices' ? 'item_key' : 'runa_id'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const text = await response.text();
            console.log(`   ⚠️ Supabase ${table}: ${response.status} - ${text.slice(0, 100)}`);
        }
        return response.ok;
    } catch (error) {
        console.log(`   ⚠️ Supabase erro: ${error.message}`);
        return false;
    }
}

// Sincroniza preços com Supabase (chamada a cada 1h)
async function syncPricesToSupabase(page) {
    console.log('\n┌─────────────────────────────────────────┐');
    console.log('│  🔄 SINCRONIZANDO COM SUPABASE          │');
    console.log('└─────────────────────────────────────────┘');
    
    let itemCount = 0;
    let runaCount = 0;
    let errors = [];
    
    // Sincroniza itens gerais
    console.log('📦 Buscando itens...');
    for (const item of ITEMS_TO_SYNC) {
        try {
            const url = `https://api.ragnatales.com.br/market/item/shopping?nameid=${item.id}`;
            const response = await page.evaluate(async (url) => {
                try {
                    const res = await fetch(url);
                    const text = await res.text();
                    // Verifica se é JSON válido
                    if (text.startsWith('<') || text.startsWith('<!')) {
                        return { error: 'Cloudflare block' };
                    }
                    return JSON.parse(text);
                } catch (e) {
                    return { error: e.message };
                }
            }, url);

            if (response && response.error) {
                if (errors.length < 3) errors.push(`${item.name}: ${response.error}`);
                continue;
            }

            if (response && Array.isArray(response) && response.length > 0) {
                const prices = response.map(d => d.price).sort((a, b) => a - b);
                const top5 = prices.slice(0, Math.min(5, prices.length));
                const avgPrice = Math.round(top5.reduce((a, b) => a + b, 0) / top5.length);

                const updated = await updateSupabase('market_prices', {
                    item_key: item.key,
                    item_name: item.name,
                    item_id: item.id,
                    price: avgPrice,
                    sellers: response.length,
                    updated_at: new Date().toISOString()
                });

                if (updated) {
                    itemCount++;
                    console.log(`   ✓ ${item.name}: ${formatZeny(avgPrice)}`);
                } else {
                    errors.push(`${item.name}: Supabase error`);
                }
            }
            await new Promise(r => setTimeout(r, 300));
        } catch (error) {
            errors.push(`${item.name}: ${error.message}`);
        }
    }

    // Sincroniza runas
    console.log('🧬 Buscando runas...');
    for (const runa of RUNAS_TO_SYNC) {
        try {
            const url = `https://api.ragnatales.com.br/market/item/shopping?nameid=${runa.id}`;
            const response = await page.evaluate(async (url) => {
                try {
                    const res = await fetch(url);
                    const text = await res.text();
                    if (text.startsWith('<') || text.startsWith('<!')) {
                        return { error: 'Cloudflare' };
                    }
                    return JSON.parse(text);
                } catch (e) {
                    return { error: e.message };
                }
            }, url);

            if (response && response.error) continue;

            if (response && Array.isArray(response) && response.length > 0) {
                const prices = response.map(d => d.price).sort((a, b) => a - b);
                const top5 = prices.slice(0, Math.min(5, prices.length));
                const avgPrice = Math.round(top5.reduce((a, b) => a + b, 0) / top5.length);

                const updated = await updateSupabase('runa_prices', {
                    runa_id: runa.id,
                    runa_name: runa.name,
                    price: avgPrice,
                    sellers: response.length,
                    updated_at: new Date().toISOString()
                });

                if (updated) runaCount++;
            }
            await new Promise(r => setTimeout(r, 200));
        } catch (error) {
            // silencioso para runas
        }
    }

    console.log(`\n✅ Supabase atualizado: ${itemCount} itens, ${runaCount} runas`);
    if (errors.length > 0) {
        console.log(`⚠️ Erros: ${errors.slice(0, 3).join(', ')}`);
    }
    console.log(`🕐 Próxima sync em 1 hora\n`);
}

// Carrega config
function loadConfig() {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

// Carrega histórico
function loadHistory() {
    if (fs.existsSync(HISTORY_FILE)) {
        return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }
    return {};
}

// Salva histórico
function saveHistory(history) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

// Formata número
function formatZeny(value) {
    return value.toLocaleString('pt-BR') + 'z';
}

// Remove outliers usando IQR (Interquartile Range)
function removeOutliers(prices) {
    if (prices.length < 4) return prices;
    
    const sorted = [...prices].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    // Limite superior: Q3 + 1.5 * IQR (padrão estatístico)
    const upperLimit = q3 + (iqr * 1.5);
    
    // Remove valores acima do limite
    const filtered = sorted.filter(p => p <= upperLimit);
    
    // Se removeu demais, usa a mediana * 3 como fallback
    if (filtered.length < sorted.length * 0.5) {
        const median = sorted[Math.floor(sorted.length / 2)];
        return sorted.filter(p => p <= median * 3);
    }
    
    return filtered;
}

// Toca som de alerta do Windows
function playAlertSound() {
    // Toca o som padrão do Windows
    exec('powershell -c "(New-Object Media.SoundPlayer \'C:\\Windows\\Media\\notify.wav\').PlaySync();"');
}

// Salva alerta no log
function logAlert(item, cheapest, discount) {
    const timestamp = new Date().toLocaleString('pt-BR');
    const logLine = `[${timestamp}] ${item.name} - ${discount}% OFF - ${formatZeny(cheapest.price)} por ${cheapest.char_name} - Loja: "${cheapest.shop_name}"\n`;
    fs.appendFileSync(ALERTS_FILE, logLine);
}

// Envia alerta para Discord via Webhook (retorna message_id)
async function sendDiscordAlert(config, item, cheapest, discount, referencePrice) {
    const discordConfig = config.notifications?.discord;
    if (!discordConfig?.enabled || !discordConfig?.webhookUrl || discordConfig.webhookUrl === 'COLE_SEU_WEBHOOK_AQUI') {
        return null;
    }
    
    const embed = {
        title: `🔥 ${item.name} - ${discount}% OFF!`,
        color: 0xFF6B00, // Laranja
        fields: [
            {
                name: '💰 Preço',
                value: formatZeny(cheapest.price),
                inline: true
            },
            {
                name: '📊 Média mercado',
                value: formatZeny(Math.round(referencePrice)),
                inline: true
            },
            {
                name: '📦 Quantidade',
                value: `${cheapest.amount}x`,
                inline: true
            },
            {
                name: '🏪 Loja',
                value: `"${cheapest.shop_name}"`,
                inline: true
            },
            {
                name: '👤 Vendedor',
                value: cheapest.char_name,
                inline: true
            },
            {
                name: '📍 Local',
                value: `${cheapest.mapname} (${cheapest.map_x}, ${cheapest.map_y})`,
                inline: true
            }
        ],
        thumbnail: {
            url: `https://api.ragnatales.com.br/database/item/icon?nameid=${item.nameid}`
        },
        footer: {
            text: 'RagnaTales Market Watcher'
        },
        timestamp: new Date().toISOString()
    };
    
    try {
        // Adiciona ?wait=true para receber o message_id
        const response = await fetch(discordConfig.webhookUrl + '?wait=true', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'RagnaTales Watcher',
                embeds: [embed]
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('   📨 Alerta enviado ao Discord!');
            return data.id; // Retorna o message_id
        }
    } catch (error) {
        console.log(`   ⚠️ Erro ao enviar Discord: ${error.message}`);
    }
    return null;
}

// Notificação Windows com ação
function sendNotification(title, message, item, cheapest, config) {
    console.log(`\n🔔 ALERTA: ${title}`);
    console.log(`   ${message}`);
    
    // Toca som (se habilitado)
    if (config.notifications?.sound !== false) {
        playAlertSound();
    }
    
    // Notificação Windows (se habilitado)
    if (config.notifications?.windows !== false) {
        const itemUrl = `https://ragnatales.com.br/market/item/${item.nameid}`;
        
        notifier.notify({
            title: `🎯 ${title}`,
            message: message + '\n\n🖱️ Clique para abrir no navegador',
            sound: true,
            wait: true,
            icon: path.join(__dirname, 'icon.png'),
            timeout: 30
        }, (err, response, metadata) => {
            if (response === 'activate' || metadata?.activationType === 'clicked') {
                console.log('   📱 Abrindo no navegador...');
                open(itemUrl);
            }
        });
    }
}

// Função principal de monitoramento
async function runWatcher() {
    const config = loadConfig();
    const history = loadHistory();
    
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║           🎮 RagnaTales Market Watcher v1.0               ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║ 📋 Monitorando: ${String(config.items.filter(i => i.enabled).length).padEnd(3)} itens                              ║`);
    console.log(`║ ⏱️  Intervalo:  ${String(config.checkIntervalMinutes).padEnd(3)} minutos                            ║`);
    console.log(`║ 📉 Alerta:      ${String(config.alertThresholdPercent).padEnd(3)}% abaixo do preço de referência   ║`);
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║ 💡 Notificações Windows ativas - clique para abrir item   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    
    console.log('🚀 Iniciando browser...');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Passa pelo Cloudflare primeiro
    console.log('📡 Conectando ao RagnaTales...');
    await page.goto('https://ragnatales.com.br/market', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
    });
    await new Promise(r => setTimeout(r, 3000));
    console.log('✅ Conectado ao Market!\n');
    
    // Contador de alertas
    let alertCount = 0;
    let checksSinceReconnect = 0;
    const RECONNECT_EVERY_N_CHECKS = 10; // Reconecta a cada 10 verificações (~50 min)
    
    // Função para reconectar ao Cloudflare
    async function reconnectCloudflare(reason) {
        console.log(`\n  🔄 Reconectando... (${reason})`);
        try {
            // Limpa cookies e cache para forçar nova sessão do Cloudflare
            const client = await page.target().createCDPSession();
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
            
            // Recarrega a página principal para passar pelo Cloudflare novamente
            await page.goto('https://ragnatales.com.br/', { 
                waitUntil: 'networkidle2',
                timeout: 60000 
            });
            await new Promise(r => setTimeout(r, 3000));
            
            // Agora vai para o market
            await page.goto('https://ragnatales.com.br/market', { 
                waitUntil: 'networkidle2',
                timeout: 60000 
            });
            await new Promise(r => setTimeout(r, 5000));
            console.log(`  ✅ Reconectado!`);
            return true;
        } catch (e) {
            console.log(`  ❌ Falha ao reconectar: ${e.message}`);
            return false;
        }
    }
    
    // Loop de monitoramento
    async function checkPrices() {
        const config = loadConfig(); // Recarrega config para pegar mudanças
        const now = new Date().toLocaleTimeString('pt-BR');
        const date = new Date().toLocaleDateString('pt-BR');
        
        console.log(`\n┌─────────────────────────────────────────┐`);
        console.log(`│ ⏰ ${date} ${now}                    │`);
        console.log(`└─────────────────────────────────────────┘`);
        
        let foundDeals = 0;
        let failedCount = 0; // Conta quantos falharam
        const activeAlerts = loadActiveAlerts();
        const currentDeals = {}; // Deals que ainda existem nesta verificação
        
        for (const item of config.items.filter(i => i.enabled)) {
            try {
                const data = await page.evaluate(async (nameid) => {
                    try {
                        const response = await fetch(`https://api.ragnatales.com.br/market/item/shopping?nameid=${nameid}`);
                        const text = await response.text();
                        // Verifica se é JSON válido
                        if (text.startsWith('<') || text.startsWith('<!')) {
                            return { error: 'Cloudflare bloqueou' };
                        }
                        return JSON.parse(text);
                    } catch (e) {
                        return { error: e.message };
                    }
                }, item.nameid);
                
                if (data.error) {
                    console.log(`  ⚠️  ${item.name}: ${data.error}`);
                    failedCount++;
                    continue;
                }
                
                if (!Array.isArray(data) || data.length === 0) {
                    console.log(`  ❌ ${item.name}: Sem vendas`);
                    continue;
                }
                
                // Calcula estatísticas (removendo outliers como 111.111.111z)
                const allPrices = data.map(d => d.price).sort((a, b) => a - b);
                const cleanPrices = removeOutliers(allPrices);
                const minPrice = allPrices[0]; // Menor preço real
                const outliersRemoved = allPrices.length - cleanPrices.length;
                
                // Nova lógica: pula os primeiros N e pega média dos próximos M
                let referencePrice;
                const skipFirst = config.skipFirst || 0; // Quantos pular (ignora o 1º)
                const topN = config.useTopNAverage || 10; // Quantos usar pra média
                
                if (cleanPrices.length > skipFirst) {
                    const selectedPrices = cleanPrices.slice(skipFirst, skipFirst + topN);
                    referencePrice = selectedPrices.reduce((a, b) => a + b, 0) / selectedPrices.length;
                } else {
                    referencePrice = item.referencePrice || cleanPrices.reduce((a, b) => a + b, 0) / cleanPrices.length;
                }
                
                const alertPrice = referencePrice * (1 - config.alertThresholdPercent / 100);
                
                // Salva histórico
                if (!history[item.nameid]) {
                    history[item.nameid] = { checks: [] };
                }
                history[item.nameid].checks.push({
                    time: new Date().toISOString(),
                    min: minPrice,
                    avg: Math.round(referencePrice),
                    count: data.length
                });
                // Mantém só os últimos 100 registros
                if (history[item.nameid].checks.length > 100) {
                    history[item.nameid].checks = history[item.nameid].checks.slice(-100);
                }
                
                // Verifica alertas
                const isGoodDeal = minPrice <= alertPrice;
                const cheapest = data.find(d => d.price === minPrice);
                const alertKey = getAlertKey(item.nameid, cheapest.char_name, cheapest.price);
                
                // Marca este vendedor como "ainda disponível"
                currentDeals[alertKey] = true;
                
                if (isGoodDeal) {
                    const discount = Math.round((1 - minPrice / referencePrice) * 100);
                    
                    // Verifica se já alertou esse mesmo deal
                    if (activeAlerts[alertKey]) {
                        console.log(`  🔄 ${item.name}: ${formatZeny(minPrice)} (já alertado)`);
                    } else {
                        // Novo deal!
                        foundDeals++;
                        alertCount++;
                        
                        console.log(`  🔥 ${item.name} - ${discount}% OFF!`);
                        console.log(`     💰 ${formatZeny(minPrice)} (ref: ${formatZeny(Math.round(referencePrice))})`);
                        console.log(`     🏪 "${cheapest.shop_name}" por ${cheapest.char_name}`);
                        console.log(`     📦 ${cheapest.amount}x disponível`);
                        console.log(`     📍 ${cheapest.mapname} (${cheapest.map_x}, ${cheapest.map_y})`);
                        
                        // Log e notificação
                        logAlert(item, cheapest, discount);
                        sendNotification(
                            `${item.name} - ${discount}% OFF!`,
                            `${formatZeny(minPrice)} por ${cheapest.char_name}\n${cheapest.amount}x em "${cheapest.shop_name}"`,
                            item,
                            cheapest,
                            config
                        );
                        
                        // Discord - salva message_id
                        const messageId = await sendDiscordAlert(config, item, cheapest, discount, referencePrice);
                        if (messageId) {
                            activeAlerts[alertKey] = {
                                messageId: messageId,
                                itemName: item.name,
                                price: cheapest.price,
                                seller: cheapest.char_name,
                                timestamp: new Date().toISOString()
                            };
                        }
                    }
                } else {
                    // Log normal (compacto)
                    const priceDiff = Math.round((minPrice / referencePrice - 1) * 100);
                    const diffStr = priceDiff >= 0 ? `+${priceDiff}%` : `${priceDiff}%`;
                    const skipFirst = config.skipFirst || 0;
                    const topN = config.useTopNAverage || 10;
                    const refType = skipFirst > 0 ? `#${skipFirst+1}-${skipFirst+topN}` : `top${topN}`;
                    console.log(`  ✓ ${item.name}: ${formatZeny(minPrice)} | ${refType}: ${formatZeny(Math.round(referencePrice))} | alerta: <${formatZeny(Math.round(alertPrice))}`);
                }
                
            } catch (error) {
                console.log(`  ⚠️  ${item.name}: Erro - ${error.message}`);
            }
        }
        
        // Salva histórico
        saveHistory(history);
        
        // Verifica alertas antigos que não existem mais (item foi vendido)
        const webhookUrl = config.notifications?.discord?.webhookUrl;
        let deletedCount = 0;
        
        for (const [key, alert] of Object.entries(activeAlerts)) {
            if (!currentDeals[key]) {
                // Este deal não existe mais - item foi vendido!
                console.log(`  🛒 VENDIDO: ${alert.itemName} por ${alert.seller}`);
                
                // Deleta a mensagem do Discord
                if (webhookUrl && alert.messageId) {
                    const deleted = await deleteDiscordMessage(webhookUrl, alert.messageId);
                    if (deleted) {
                        console.log(`     🗑️ Mensagem removida do Discord`);
                    }
                }
                
                // Remove do registro
                delete activeAlerts[key];
                deletedCount++;
            }
        }
        
        // Salva alertas ativos
        saveActiveAlerts(activeAlerts);
        
        // Incrementa contador de verificações
        checksSinceReconnect++;
        
        // Verifica se precisa reconectar (muitas falhas OU reconexão preventiva)
        const totalItems = config.items.filter(i => i.enabled).length;
        if (failedCount > totalItems / 2) {
            await reconnectCloudflare(`${failedCount}/${totalItems} falhas`);
            checksSinceReconnect = 0;
        } else if (checksSinceReconnect >= RECONNECT_EVERY_N_CHECKS) {
            await reconnectCloudflare('reconexão preventiva');
            checksSinceReconnect = 0;
        }
        
        // Resumo
        console.log(`\n  ───────────────────────────────────────`);
        if (foundDeals > 0) {
            console.log(`  🎯 ${foundDeals} nova(s) oportunidade(s)!`);
        }
        if (deletedCount > 0) {
            console.log(`  🛒 ${deletedCount} item(ns) vendido(s)`);
        }
        if (failedCount > 0) {
            console.log(`  ⚠️ ${failedCount} item(ns) com erro`);
        }
        console.log(`  📊 Alertas ativos: ${Object.keys(activeAlerts).length}`);
        console.log(`  ⏭️  Próxima verificação em ${config.checkIntervalMinutes} min`);
    }
    
    // Primeira verificação
    await checkPrices();
    
    // Primeira sincronização com Supabase
    await syncPricesToSupabase(page);
    
    // Loop contínuo - alertas
    const intervalMs = config.checkIntervalMinutes * 60 * 1000;
    setInterval(checkPrices, intervalMs);
    
    // Loop contínuo - sincronização Supabase (1 hora)
    const syncIntervalMs = 60 * 60 * 1000; // 1 hora
    setInterval(() => syncPricesToSupabase(page), syncIntervalMs);
    
    // Mantém o processo rodando
    console.log('\n💡 Dica: Minimize esta janela - as notificações aparecerão mesmo assim!');
    console.log('🔄 Sincronização Supabase: a cada 1 hora');
    console.log('🛑 Pressione Ctrl+C para parar\n');
    
    // Tratamento de saída limpa
    process.on('SIGINT', async () => {
        console.log('\n\n🛑 Parando watcher...');
        await browser.close();
        console.log(`📊 Sessão encerrada com ${alertCount} alertas`);
        console.log('👋 Até mais!');
        process.exit(0);
    });
}

// Inicia
runWatcher().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
