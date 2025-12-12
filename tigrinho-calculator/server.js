const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');
const { 
    TREASURES, COMPENDIO_IDS, OTHER_ITEM_IDS, METEORITE_IDS,
    SOMATOLOGY, RUNA_IDS, CAIXA_ITEM_IDS 
} = require('./treasures');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3333;

// Cache de preços
let priceCache = {};
let lastUpdate = null;
let browser = null;
let page = null;

// Arquivo de cache
const CACHE_FILE = path.join(__dirname, 'price-cache.json');

// Carrega cache do arquivo
function loadCache() {
    if (fs.existsSync(CACHE_FILE)) {
        const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        priceCache = data.prices || {};
        lastUpdate = data.lastUpdate ? new Date(data.lastUpdate) : null;
        console.log(`📂 Cache carregado: ${Object.keys(priceCache).length} itens`);
    }
}

// Salva cache no arquivo
function saveCache() {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({
        prices: priceCache,
        lastUpdate: lastUpdate?.toISOString()
    }, null, 2));
}

// Inicializa o browser
async function initBrowser() {
    if (browser) return;
    
    console.log('🚀 Iniciando browser...');
    browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Passa pelo Cloudflare
    console.log('📡 Conectando ao RagnaTales...');
    await page.goto('https://ragnatales.com.br/market', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
    });
    await new Promise(r => setTimeout(r, 3000));
    console.log('✅ Conectado!');
}

// Busca preço de um item
async function fetchItemPrice(nameid) {
    if (!page) await initBrowser();
    
    try {
        const data = await page.evaluate(async (id) => {
            try {
                const response = await fetch(`https://api.ragnatales.com.br/market/item/shopping?nameid=${id}`);
                const text = await response.text();
                if (text.startsWith('<')) return { error: 'blocked' };
                return JSON.parse(text);
            } catch (e) {
                return { error: e.message };
            }
        }, nameid);
        
        if (data.error) return null;
        if (!Array.isArray(data) || data.length === 0) return null;
        
        // Pega os 3 menores preços (ignora o 1º como outlier)
        const prices = data.map(d => d.price).sort((a, b) => a - b);
        const avgPrice = prices.length >= 4 
            ? (prices[1] + prices[2] + prices[3]) / 3 
            : prices[0];
        
        return {
            name: data[0].name,
            minPrice: prices[0],
            avgPrice: Math.round(avgPrice),
            sellers: data.length
        };
    } catch (error) {
        console.log(`   ⚠️ Erro ${nameid}: ${error.message}`);
        return null;
    }
}

// Busca média de 45 dias de um item
async function fetchItem45DayAvg(nameid) {
    if (!page) await initBrowser();
    
    try {
        await page.goto(`https://ragnatales.com.br/db/items/${nameid}`, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        await new Promise(r => setTimeout(r, 2000));
        
        const data = await page.evaluate(() => {
            const body = document.body.innerText;
            const avgMatch = body.match(/Média de preço deste item é de ([\d.,]+)\s*zenys/i);
            let avg45days = null;
            if (avgMatch) {
                avg45days = parseInt(avgMatch[1].replace(/\./g, '').replace(',', '.'));
            }
            
            const nameMatch = body.match(/^([^\n]+)/);
            const name = nameMatch ? nameMatch[1].trim() : null;
            
            return { avg45days, name };
        });
        
        return data;
    } catch (error) {
        return null;
    }
}

// Atualiza todos os preços
async function updateAllPrices() {
    console.log('\n📊 Atualizando preços...');
    
    await initBrowser();
    
    const allIds = [...new Set([
        ...METEORITE_IDS, 
        ...COMPENDIO_IDS, 
        ...OTHER_ITEM_IDS,
        ...RUNA_IDS,
        ...CAIXA_ITEM_IDS,
        SOMATOLOGY.costItemId // Alma Sombria
    ])];
    
    for (const id of allIds) {
        console.log(`   Buscando ${id}...`);
        const price = await fetchItemPrice(id);
        if (price) {
            priceCache[id] = {
                ...price,
                updatedAt: new Date().toISOString()
            };
        }
        // Pequeno delay para não sobrecarregar
        await new Promise(r => setTimeout(r, 500));
    }
    
    lastUpdate = new Date();
    saveCache();
    console.log(`✅ Preços atualizados: ${Object.keys(priceCache).length} itens`);
}

// Calcula valor esperado das Runas Somatológicas
function calculateSomatologyValue() {
    const somatology = SOMATOLOGY;
    
    // Custo (9990 Almas Sombrias)
    const almaPrice = priceCache[somatology.costItemId]?.avgPrice || 
                      priceCache[somatology.costItemId]?.minPrice || 0;
    const totalCost = almaPrice * somatology.totalCost;
    
    // Valor esperado da Runa aleatória (média de todas as runas)
    const runaPrices = RUNA_IDS
        .map(id => priceCache[id]?.avgPrice || priceCache[id]?.minPrice || 0)
        .filter(p => p > 0);
    
    const avgRunaPrice = runaPrices.length > 0 
        ? runaPrices.reduce((a, b) => a + b, 0) / runaPrices.length 
        : 0;
    
    // Calcula valor esperado
    let expectedValue = 0;
    const dropDetails = [];
    
    for (const drop of somatology.drops) {
        let itemPrice = 0;
        let priceSource = 'desconhecido';
        
        if (drop.type === 'runa') {
            itemPrice = avgRunaPrice;
            priceSource = `média de ${runaPrices.length} runas`;
        } else if (drop.fixedPrice) {
            itemPrice = drop.fixedPrice;
            priceSource = 'fixo (estimado)';
        }
        
        const dropValue = (drop.chance / 100) * itemPrice * drop.quantity;
        expectedValue += dropValue;
        
        dropDetails.push({
            name: drop.name,
            chance: drop.chance,
            quantity: drop.quantity,
            itemPrice: itemPrice,
            priceSource: priceSource,
            expectedValue: dropValue
        });
    }
    
    // Lista de runas com preços
    const runasList = RUNA_IDS.map(id => {
        const data = priceCache[id];
        return {
            id: id,
            name: data?.name || `Runa ${id}`,
            price: data?.avgPrice || data?.minPrice || 0,
            sellers: data?.sellers || 0
        };
    }).filter(r => r.price > 0).sort((a, b) => b.price - a.price);
    
    return {
        name: somatology.name,
        color: somatology.color,
        costPerAlma: almaPrice,
        totalAlmas: somatology.totalCost,
        totalCost: totalCost,
        expectedValue: expectedValue,
        profit: expectedValue - totalCost,
        profitPercent: totalCost > 0 ? ((expectedValue / totalCost) - 1) * 100 : 0,
        isWorthIt: expectedValue > totalCost,
        avgRunaPrice: avgRunaPrice,
        runasFound: runaPrices.length,
        drops: dropDetails,
        runasList: runasList
    };
}

// Calcula valor esperado de um tesouro
function calculateExpectedValue(treasureKey) {
    const treasure = TREASURES[treasureKey];
    if (!treasure) return null;
    
    // Custo
    const costItem = priceCache[treasure.costItemId];
    const costPerUnit = costItem?.avgPrice || costItem?.minPrice || 0;
    const totalCost = costPerUnit * treasure.costAmount;
    
    // Valor esperado dos drops
    let expectedValue = 0;
    const dropDetails = [];
    
    for (const drop of treasure.drops) {
        let itemPrice = 0;
        let priceSource = 'desconhecido';
        
        if (drop.fixedPrice) {
            itemPrice = drop.fixedPrice;
            priceSource = 'fixo (Discord)';
        } else if (drop.itemId && priceCache[drop.itemId]) {
            itemPrice = priceCache[drop.itemId].avgPrice || priceCache[drop.itemId].minPrice || 0;
            priceSource = 'market';
        } else if (drop.type === 'compendio' && !drop.itemId) {
            // Compêndio aleatório - usa média dos compêndios
            const compPrices = COMPENDIO_IDS
                .map(id => priceCache[id]?.avgPrice || 0)
                .filter(p => p > 0);
            if (compPrices.length > 0) {
                itemPrice = compPrices.reduce((a, b) => a + b, 0) / compPrices.length;
                priceSource = 'média compêndios';
            }
        }
        
        const dropValue = (drop.chance / 100) * itemPrice * drop.quantity;
        expectedValue += dropValue;
        
        dropDetails.push({
            name: drop.name,
            chance: drop.chance,
            quantity: drop.quantity,
            itemPrice: itemPrice,
            priceSource: priceSource,
            expectedValue: dropValue
        });
    }
    
    return {
        treasureName: treasure.name,
        color: treasure.color,
        costPerUnit: costPerUnit,
        costAmount: treasure.costAmount,
        totalCost: totalCost,
        expectedValue: expectedValue,
        profit: expectedValue - totalCost,
        profitPercent: totalCost > 0 ? ((expectedValue / totalCost) - 1) * 100 : 0,
        isWorthIt: expectedValue > totalCost,
        drops: dropDetails
    };
}

// Rotas da API
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Retorna dados de todos os tesouros
app.get('/api/treasures', (req, res) => {
    const results = {};
    for (const key of Object.keys(TREASURES)) {
        results[key] = calculateExpectedValue(key);
    }
    res.json({
        treasures: results,
        lastUpdate: lastUpdate?.toISOString(),
        priceCount: Object.keys(priceCache).length
    });
});

// Retorna dados das Runas Somatológicas
app.get('/api/somatology', (req, res) => {
    const result = calculateSomatologyValue();
    res.json({
        somatology: result,
        lastUpdate: lastUpdate?.toISOString()
    });
});

// Retorna cache de preços
app.get('/api/prices', (req, res) => {
    res.json({
        prices: priceCache,
        lastUpdate: lastUpdate?.toISOString()
    });
});

// Força atualização de preços
app.post('/api/update-prices', async (req, res) => {
    try {
        await updateAllPrices();
        res.json({ success: true, message: 'Preços atualizados!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Simulação de N aberturas
app.get('/api/simulate/:treasure/:count', (req, res) => {
    const { treasure, count } = req.params;
    const numOpenings = parseInt(count) || 100;
    
    const treasureData = TREASURES[treasure];
    if (!treasureData) {
        return res.status(404).json({ error: 'Tesouro não encontrado' });
    }
    
    // Simula N aberturas
    const results = {
        totalCost: 0,
        totalValue: 0,
        itemsWon: {},
        openings: numOpenings
    };
    
    const costItem = priceCache[treasureData.costItemId];
    const costPerUnit = costItem?.avgPrice || 0;
    results.totalCost = costPerUnit * treasureData.costAmount * numOpenings;
    
    for (let i = 0; i < numOpenings; i++) {
        for (const drop of treasureData.drops) {
            const roll = Math.random() * 100;
            if (roll < drop.chance) {
                // Ganhou este item
                if (!results.itemsWon[drop.name]) {
                    results.itemsWon[drop.name] = { count: 0, totalValue: 0 };
                }
                results.itemsWon[drop.name].count += drop.quantity;
                
                // Calcula valor
                let itemPrice = 0;
                if (drop.fixedPrice) {
                    itemPrice = drop.fixedPrice;
                } else if (drop.itemId && priceCache[drop.itemId]) {
                    itemPrice = priceCache[drop.itemId].avgPrice || 0;
                }
                results.itemsWon[drop.name].totalValue += itemPrice * drop.quantity;
                results.totalValue += itemPrice * drop.quantity;
            }
        }
    }
    
    results.profit = results.totalValue - results.totalCost;
    results.profitPercent = results.totalCost > 0 ? ((results.totalValue / results.totalCost) - 1) * 100 : 0;
    
    res.json(results);
});

// Inicia servidor
app.listen(PORT, async () => {
    console.log(`\n🎰 Tigrinho Calculator rodando em http://localhost:${PORT}\n`);
    loadCache();
    
    // Se cache muito antigo (>1h), atualiza
    if (!lastUpdate || (Date.now() - lastUpdate.getTime()) > 3600000) {
        console.log('📡 Cache antigo, atualizando preços...');
        await updateAllPrices();
    }
});

// Cleanup
process.on('SIGINT', async () => {
    if (browser) await browser.close();
    process.exit(0);
});

