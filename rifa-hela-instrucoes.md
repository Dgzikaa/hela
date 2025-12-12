# 🎲 Rifa Carry Hela - 18/12

## 📋 Como usar:

### 1. Importar no Google Sheets:
1. Acesse: https://sheets.google.com
2. Crie uma nova planilha
3. Arquivo > Importar > Upload
4. Selecione o arquivo `rifa-hela-participantes.csv`
5. Escolha "Substituir planilha atual"

### 2. Configurar a planilha:

#### Aba "Participantes" (será criada automaticamente):
- Já vem com 60 linhas numeradas (1-60)
- Preencha o nome dos jogadores conforme eles comprarem
- Na coluna "Status Pagamento" coloque: Pago ou Pendente
- Na coluna "Data Pagamento" coloque a data (formato: 30/11/2025)

#### Criar Aba "Resumo":
1. Crie uma nova aba chamada "Resumo"
2. Cole o seguinte conteúdo:

```
RIFA CARRY HELA - 18/12/2025

Informações da Rifa:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total de Vagas: 60
Valor por Bilhete: 100kk (100 milhões)
Meta Total: 6.000kk (6 bilhões)
Data do Sorteio: 18/12/2025

Status Atual:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vagas Vendidas: [FÓRMULA1]
Vagas Disponíveis: [FÓRMULA2]
Valor Arrecadado: [FÓRMULA3] kk
Falta Arrecadar: [FÓRMULA4] kk
Percentual Atingido: [FÓRMULA5]%
```

3. Substitua as fórmulas:
   - [FÓRMULA1]: `=CONT.SE(Participantes!C:C;"Pago")`
   - [FÓRMULA2]: `=60-CONT.SE(Participantes!C:C;"Pago")`
   - [FÓRMULA3]: `=CONT.SE(Participantes!C:C;"Pago")*100`
   - [FÓRMULA4]: `=6000-CONT.SE(Participantes!C:C;"Pago")*100`
   - [FÓRMULA5]: `=ARRED((CONT.SE(Participantes!C:C;"Pago")/60)*100;1)`

### 3. Formatação (Opcional mas bonito):
- Selecione a linha 1 (cabeçalho) > Negrito + Cor de fundo
- Congele a linha 1: Visualizar > Congelar > 1 linha
- Crie uma regra de formatação condicional:
  - Selecione coluna C (Status)
  - Formatar > Formatação condicional
  - Se "Pago" → fundo verde
  - Se "Pendente" → fundo amarelo

### 4. No dia do sorteio (18/12):
1. Acesse: https://www.random.org/integers/
2. Configure:
   - Min: 1
   - Max: [número de participantes que pagaram]
   - Quantity: 1
3. Clique em "Generate"
4. O número sorteado corresponde ao bilhete vencedor!

## 💡 Dicas:

- Compartilhe a planilha no modo "Visualização" com os participantes
- Mantenha sempre atualizado quem pagou
- Pode criar uma regra: só participa quem pagar até 17/12
- Considere fazer backup da planilha antes do sorteio

## 📱 Divulgação sugerida para o Discord:

```
🎲 **RIFA CARRY HELA** 🎲

📅 **Sorteio:** 18/12/2025
💰 **Valor:** 100kk por bilhete
🎯 **Prêmio:** 1 Carry completo de Hela (6b)
📊 **Vagas:** 60 (limitadas!)

**Como participar:**
1️⃣ Reserve seu número na planilha
2️⃣ Efetue o pagamento de 100kk
3️⃣ Aguarde o sorteio!

📋 **Planilha de participantes:** [SEU LINK DO GOOGLE SHEETS AQUI]

📞 **Contato para reservar/pagar:** <@614167750457163796> ou clique aqui: https://discord.com/users/614167750457163796

⏰ **Pagamentos até:** 17/12/2025
🍀 **Boa sorte a todos!**
```

**Copie e cole direto no Discord!** O `<@614167750457163796>` vai virar uma menção ao supaturk automaticamente.

Boa sorte com a rifa! 🍀

