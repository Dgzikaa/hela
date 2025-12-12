const webhook = 'https://discord.com/api/webhooks/1448868435261128714/qJL-u7g8MY129EOKsdz85lhA7I1QLHlTFRaiUXTCYrvdoyzNfL3Ilg8Ncptbfg12hPt7';

async function test() {
    const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'RagnaTales Watcher',
            embeds: [{
                title: 'Watcher Configurado!',
                description: 'O monitor de precos do RagnaTales esta funcionando.\n\nVoce recebera alertas aqui quando encontrar itens 15% abaixo da media de 45 dias.',
                color: 0x00FF00,
                fields: [
                    { name: 'Itens monitorados', value: '10', inline: true },
                    { name: 'Intervalo', value: '3 min', inline: true },
                    { name: 'Threshold', value: '15%', inline: true }
                ],
                footer: { text: 'Teste de conexao' },
                timestamp: new Date().toISOString()
            }]
        })
    });
    
    console.log('Status:', response.status);
    if (response.ok) {
        console.log('Mensagem enviada ao Discord!');
    } else {
        console.log('Erro:', await response.text());
    }
}

test();

