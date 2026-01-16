# 🎰 Bot de Rifa - RagnaTales

Bot automatizado para o evento **Rafa da Rifa** do RagnaTales. Usa OCR para ler qual rifa está ativa e decide se vale a pena jogar baseado nos preços de mercado.

## ✨ Funcionalidades

- 📸 **OCR automático** - Lê o texto do NPC para identificar a rifa ativa
- 💰 **Cálculo de lucro** - Consulta preços de mercado e calcula se vale a pena
- 🤖 **Auto-play** - Joga automaticamente quando a rifa vale a pena
- 🔔 **Notificações** - Alerta quando uma rifa lucrativa aparece
- ⚙️ **Configurável** - Fácil de ajustar para sua resolução

## 📋 Requisitos

- Python 3.8+
- Windows 10/11
- RagnaTales rodando em janela

## 🚀 Instalação

```bash
# 1. Instale as dependências
pip install -r requirements.txt

# 2. Configure as posições da tela
python rifa_bot.py calibrate

# 3. Teste o OCR
python rifa_bot.py test

# 4. Execute o bot
python rifa_bot.py
```

## ⌨️ Controles

| Tecla | Ação |
|-------|------|
| **F10** | Ativar/Desativar auto-play |
| **ESC** | Encerrar o bot |

## ⚙️ Configuração

Edite o arquivo `config.json`:

```json
{
  "api_url": "http://localhost:3000",    // URL da calculadora
  "check_interval_seconds": 3,            // Intervalo de verificação
  "auto_play": false,                     // Iniciar com auto-play ativo?
  "max_plays_per_rifa": 50,               // Máximo de jogadas por rifa
  "min_profit_to_play": 0,                // Lucro mínimo para jogar
  "debug_mode": true,                     // Mostrar logs detalhados
  "screen_regions": {
    "rifa_text": {
      "x": 160,
      "y": 90,
      "width": 300,
      "height": 80
    }
  }
}
```

## 🎯 Calibração

Execute `python rifa_bot.py calibrate` e siga as instruções:

1. Posicione o mouse no **canto superior esquerdo** do texto da rifa → ENTER
2. Posicione no **canto inferior direito** do texto → ENTER  
3. Posicione no **NPC** para clicar → ENTER
4. Posicione no botão **"Sim, quero comprar"** → ENTER
5. Posicione no botão **"Fechar"** → ENTER

Copie a configuração gerada para `config.json`.

## 📊 Como funciona

1. **Captura** - O bot captura a região da tela onde aparece o texto do NPC
2. **OCR** - Usa EasyOCR para extrair o texto da imagem
3. **Identificação** - Identifica qual rifa está ativa por palavras-chave
4. **Cálculo** - Consulta a API para verificar se vale a pena
5. **Decisão** - Se auto-play estiver ativo e valer a pena, joga

## 🔧 Troubleshooting

### OCR não reconhece o texto
- Ajuste a região de captura com `python rifa_bot.py calibrate`
- Salve `debug_capture.png` e verifique se a imagem está legível
- Aumente a resolução do jogo

### Bot não clica corretamente
- Recalibre as posições
- Certifique-se que o jogo está na mesma resolução

### "Sem preços cadastrados"
- Execute a sincronização de preços: `http://localhost:3000/api/sync-rifa-prices` (POST)

## ⚠️ Avisos

- Use por sua conta e risco
- O bot precisa que o jogo esteja visível na tela
- Não funciona em fullscreen, use modo janela
- Mova o mouse para o canto superior esquerdo para parar imediatamente (failsafe)

## 📁 Arquivos

```
rifa-bot/
├── rifa_bot.py         # Script principal
├── config.json         # Configurações
├── requirements.txt    # Dependências Python
├── README.md          # Este arquivo
└── debug_capture.png  # Última captura (gerado no teste)
```
