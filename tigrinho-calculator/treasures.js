// Dados dos Tesouros do RagnaTales
// Cada tesouro custa 100 Pó de Meteorita (do tipo correspondente)

const TREASURES = {
    escarlate: {
        name: "Tesouro Escarlate",
        color: "#DC143C",
        costItemId: 1000398, // Pó de Meteorita Escarlate
        costAmount: 100,
        drops: [
            { name: "Compêndio Aleatório", chance: 100, quantity: 3, itemId: null, type: "compendio" },
            { name: "Compêndio do Espelho Quebrado", chance: 100, quantity: 1, itemId: 1500003, type: "compendio" },
            { name: "Desmembrador Químico", chance: 70, quantity: 1, itemId: 1600008 },
            { name: "Bênção do Ferreiro", chance: 10, quantity: 1, itemId: 6635 },
            { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, itemId: 1006442 },
            { name: "Espírito Poderoso [1]", chance: 2, quantity: 1, fixedPrice: 2200000000 }, // 2.2B
            { name: "Caixa da Força Expedicionária", chance: 1, quantity: 1, fixedPrice: 3500000000 } // 3.5B
        ]
    },
    solar: {
        name: "Tesouro Solar",
        color: "#FFD700",
        costItemId: 1000399, // Pó de Meteorita Solar
        costAmount: 100,
        drops: [
            { name: "Compêndio Aleatório", chance: 100, quantity: 3, itemId: null, type: "compendio" },
            { name: "Compêndio do Espelho Fragmentado", chance: 100, quantity: 1, itemId: 1500002, type: "compendio" },
            { name: "Desmembrador Químico", chance: 70, quantity: 1, itemId: 1600008 },
            { name: "Bênção do Ferreiro", chance: 10, quantity: 1, itemId: 6635 },
            { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, itemId: 1006442 },
            { name: "Talismã Yin Yang", chance: 2, quantity: 1, fixedPrice: 1000000000 }, // 1B
            { name: "Caixa da Força Expedicionária", chance: 1, quantity: 1, fixedPrice: 3500000000 }
        ]
    },
    verdejante: {
        name: "Tesouro Verdejante",
        color: "#228B22",
        costItemId: 1000400, // Pó de Meteorita Verdejante
        costAmount: 100,
        drops: [
            { name: "Compêndio Aleatório", chance: 100, quantity: 3, itemId: null, type: "compendio" },
            { name: "Compêndio do Espelho Despedaçado", chance: 100, quantity: 1, itemId: 1500001, type: "compendio" },
            { name: "Desmembrador Químico", chance: 70, quantity: 1, itemId: 1600008 },
            { name: "Bênção do Ferreiro", chance: 10, quantity: 1, itemId: 6635 },
            { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, itemId: 1006442 },
            { name: "Orbe de Yokai", chance: 2, quantity: 1, fixedPrice: 2000000000 }, // 2B
            { name: "Caixa da Força Expedicionária", chance: 1, quantity: 1, fixedPrice: 3500000000 }
        ]
    },
    celeste: {
        name: "Tesouro Celeste",
        color: "#87CEEB",
        costItemId: 1000401, // Pó de Meteorita Celeste
        costAmount: 100,
        drops: [
            { name: "Compêndio Aleatório", chance: 100, quantity: 3, itemId: null, type: "compendio" },
            { name: "Compêndio da Resistência Elemental", chance: 100, quantity: 1, itemId: 1500007, type: "compendio" },
            { name: "Desmembrador Químico", chance: 70, quantity: 1, itemId: 1600008 },
            { name: "Bênção do Ferreiro", chance: 10, quantity: 1, itemId: 6635 },
            { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, itemId: 1006442 },
            { name: "Garra de Prata", chance: 2, quantity: 1, fixedPrice: 2000000000 }, // 2B
            { name: "Caixa da Força Expedicionária", chance: 1, quantity: 1, fixedPrice: 3500000000 }
        ]
    },
    oceanico: {
        name: "Tesouro Oceânico",
        color: "#0077BE",
        costItemId: 1000402, // Pó de Meteorita Oceânica
        costAmount: 100,
        drops: [
            { name: "Compêndio Aleatório", chance: 100, quantity: 3, itemId: null, type: "compendio" },
            { name: "Compêndio da Magia Absoluta", chance: 100, quantity: 1, itemId: 1500004, type: "compendio" },
            { name: "Desmembrador Químico", chance: 70, quantity: 1, itemId: 1600008 },
            { name: "Bênção do Ferreiro", chance: 10, quantity: 1, itemId: 6635 },
            { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, itemId: 1006442 },
            { name: "Espírito Astuto [1]", chance: 2, quantity: 1, fixedPrice: 2800000000 } // 2.8B
            // Não tem Caixa da Força no Oceânico
        ]
    },
    crepuscular: {
        name: "Tesouro Crepuscular",
        color: "#9370DB",
        costItemId: 1000403, // Pó de Meteorita Crepuscular
        costAmount: 100,
        drops: [
            { name: "Compêndio Aleatório", chance: 100, quantity: 3, itemId: null, type: "compendio" },
            { name: "Compêndio da Astúcia do Atirador", chance: 100, quantity: 1, itemId: 1500010, type: "compendio" },
            { name: "Desmembrador Químico", chance: 70, quantity: 1, itemId: 1600008 },
            { name: "Bênção do Ferreiro", chance: 10, quantity: 1, itemId: 6635 },
            { name: "Bênção do Mestre-Ferreiro", chance: 5, quantity: 1, itemId: 1006442 },
            { name: "Espírito Ligeiro [1]", chance: 2, quantity: 1, fixedPrice: 2200000000 }, // 2.2B
            { name: "Caixa da Força Expedicionária", chance: 1, quantity: 1, fixedPrice: 3500000000 }
        ]
    }
};

// IDs dos compêndios para buscar preços
const COMPENDIO_IDS = [
    1500001, 1500002, 1500003, 1500004, 1500005, 1500006,
    1500007, 1500008, 1500009, 1500010, 1500011, 1500012
];

// IDs de outros itens para buscar preços
const OTHER_ITEM_IDS = [
    1600008, // Desmembrador Químico
    6635,    // Bênção do Ferreiro
    1006442  // Bênção do Mestre-Ferreiro
];

// IDs dos Pós de Meteorita
const METEORITE_IDS = [
    1000398, // Escarlate
    1000399, // Solar
    1000400, // Verdejante
    1000401, // Celeste
    1000402, // Oceânica
    1000403  // Crepuscular
];

// ============================================
// RUNAS SOMATOLÓGICAS
// ============================================

// Custo: 999 Alma Sombria → 1 Condensada
//        10 Condensadas → 1 Runa
// Total: 9.990 Almas Sombrias por abertura

const SOMATOLOGY = {
    name: "Runa Somatológica",
    color: "#8B008B",
    costItemId: 25986, // Alma Sombria
    costPerCondensed: 999, // 999 almas = 1 condensada
    condensedPerRune: 10, // 10 condensadas = 1 runa
    totalCost: 9990, // 999 × 10 = 9990 almas por runa
    drops: [
        { name: "Runa Somatológica Aleatória", chance: 100, quantity: 1, type: "runa" },
        { name: "Caixa de Somatologia", chance: 10, quantity: 1, fixedPrice: 1000000000 }, // Média 1B
        { name: "Aura da Mente Corrompida", chance: 1, quantity: 1, fixedPrice: 5000000000 } // Estimado 5B
    ]
};

// IDs das Runas Somatológicas (para buscar preços)
const RUNA_IDS = [
    17917, 17918, 17919, 17920, 17921, 17922, 17923, 17924,
    17925, 17926, 17927, 17928, 17929, 17930, 17931, 17932,
    17933, 17934, 17935, 17936, 17937, 17938, 17939, 17940,
    17941, 17942, 17943, 17944, 17945, 17946
];

// Itens da Caixa de Somatologia (para referência)
const CAIXA_SOMATOLOGIA_ITEMS = [
    { name: "Chapéu de Maestro", fixedPrice: 3000000000 }, // 3B
    { name: "Quepe do General", fixedPrice: 1000000000 },
    { name: "Livro Amaldiçoado", fixedPrice: 1000000000 },
    { name: "Máscara da Nobreza", fixedPrice: 1000000000 },
    { name: "Jack Estripadora", fixedPrice: 1000000000 },
    { name: "Garra de Ferro", fixedPrice: 1000000000 },
    { name: "Livro Perverso", fixedPrice: 1000000000 },
    { name: "Couraça de Senshi", fixedPrice: 1000000000 },
    { name: "Manto Abstrato", fixedPrice: 1000000000 },
    { name: "Botas de Teste", itemId: 470060 },
    { name: "Botas de Capricórnio", itemId: 470010 },
    { name: "Palheta de Elunium", itemId: 490141 },
    { name: "Anel de Júpiter", fixedPrice: 1400000000 }, // 1.4B
    { name: "Luvas de Corrida", itemId: 2935 }
];

// IDs extras para buscar (Caixa de Somatologia)
const CAIXA_ITEM_IDS = [470060, 470010, 490141, 2935];

module.exports = { 
    TREASURES, 
    COMPENDIO_IDS, 
    OTHER_ITEM_IDS, 
    METEORITE_IDS,
    SOMATOLOGY,
    RUNA_IDS,
    CAIXA_SOMATOLOGIA_ITEMS,
    CAIXA_ITEM_IDS
};

