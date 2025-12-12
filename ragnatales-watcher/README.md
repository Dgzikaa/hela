# 🎮 RagnaTales Market Watcher

Monitor de preços do Market do RagnaTales. Alerta quando encontrar itens 15% abaixo da média de 45 dias.

## 🚀 Como Usar

### Iniciar manualmente:
```bash
cd F:\Hela\ragnatales-watcher
npm start
```

Ou dê duplo-clique em `iniciar-com-windows.bat`

### Buscar novos itens:
```bash
npm run search -- "nome do item"
```

### Atualizar médias de 45 dias:
```bash
node fetch-items.js
```

---

## ⚙️ Iniciar automaticamente com Windows

### Opção 1: Pasta Inicializar (mais fácil)

1. Pressione `Win + R`
2. Digite: `shell:startup`
3. Copie o arquivo `iniciar-com-windows.bat` para essa pasta
4. Pronto! O watcher vai iniciar quando você ligar o PC

### Opção 2: Agendador de Tarefas

1. Pressione `Win + R`
2. Digite: `taskschd.msc`
3. Clique em "Criar Tarefa Básica"
4. Nome: "RagnaTales Watcher"
5. Disparador: "Ao fazer logon"
6. Ação: "Iniciar um programa"
7. Programa: `F:\Hela\ragnatales-watcher\iniciar-com-windows.bat`
8. Concluir!

---

## 📋 Configuração (config.json)

```json
{
  "checkIntervalMinutes": 3,      // Intervalo entre verificações
  "alertThresholdPercent": 15,    // Alertar se 15% abaixo da média
  "items": [...]                   // Lista de itens monitorados
}
```

### Adicionar item manualmente:
```json
{
  "nameid": 25986,
  "name": "Alma Sombria",
  "referencePrice": 9495,
  "enabled": true
}
```

---

## 🔔 Notificações

- **Windows Toast**: Notificação pop-up quando encontrar item barato
- **Som**: Toca som do Windows ao alertar
- **Clique**: Clique na notificação para abrir o item no navegador

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `watcher.js` | Script principal (loop de monitoramento) |
| `config.json` | Configuração de itens e alertas |
| `fetch-items.js` | Busca médias de 45 dias |
| `search-item.js` | Busca itens pelo nome |
| `price-history.json` | Histórico de preços (gerado automaticamente) |
| `alerts.log` | Log de alertas disparados |

---

## 🎯 Itens Monitorados

| Item | Média 45d | Alerta se < |
|------|-----------|-------------|
| Âmago Sombrio | 61.623z | 52.380z |
| Alma Sombria | 9.495z | 8.071z |
| Pó de Meteorita Celeste | 198.990z | 169.142z |
| Pó de Meteorita Crepuscular | 178.299z | 151.554z |
| Pó de Meteorita Escarlate | 189.644z | 161.197z |
| Pó de Meteorita Oceânica | 206.011z | 175.109z |
| Pó de Meteorita Solar | 182.726z | 155.317z |
| Pó de Meteorita Verdejante | 191.728z | 162.969z |
| Essência de Batalha Concentrada | 2.304.072z | 1.958.461z |
| Sacola de Cash | 2.473.122z | 2.102.154z |

