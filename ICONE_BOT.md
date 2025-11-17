# 🤖 Ícone do Bot - Seu Raimundo

## 📁 Localização da Imagem

A imagem do Seu Raimundo está salva em:
```
f:\Hela\public\seu-raimundo-original.jpg
```

## 📐 Como Adicionar no Discord:

### Passo 1: Acessar o Developer Portal
1. Acesse: https://discord.com/developers/applications
2. Faça login com sua conta do Discord
3. Selecione sua aplicação: **Hela Carrys Bot** (ou o nome que você deu)

### Passo 2: Fazer Upload do Ícone
1. No menu lateral, clique em **"General Information"**
2. Role até encontrar **"APP ICON"**
3. Clique em **"Upload Image"**
4. Selecione o arquivo: `f:\Hela\public\seu-raimundo-original.jpg`
5. Ajuste o crop se necessário (o Discord aceita imagens quadradas)
6. Clique em **"Save Changes"** no final da página

### Passo 3: Aguardar Atualização
- O ícone pode levar alguns minutos para atualizar em todos os servidores
- Recarregue o Discord (Ctrl + R) se necessário

---

## 🎨 Dicas para Melhor Qualidade:

### Se quiser editar a imagem antes:
Você pode usar ferramentas gratuitas para:
- **Remover o fundo** (deixar só o Seu Raimundo)
- **Criar uma versão circular** (padrão do Discord)
- **Adicionar bordas coloridas**

**Ferramentas recomendadas:**
- **Remove.bg**: https://remove.bg (remover fundo automaticamente)
- **Canva**: https://canva.com (editar e recortar)
- **Photopea**: https://photopea.com (Photoshop online grátis)

### Especificações Ideais:
- **Tamanho**: 512x512px (recomendado)
- **Formato**: PNG (com fundo transparente) ou JPG
- **Peso**: Máximo 8MB
- **Aspecto**: Quadrado (1:1)

---

## 🎭 Personalizando o Nome do Bot:

Já que o vendedor vai se chamar "Seu Raimundo", você pode:

1. Mudar o nome do bot:
   - No Discord Developer Portal
   - **General Information** → **NAME**
   - Altere para: **Seu Raimundo** ou **Seu Raimundo - Carrys**

2. Mudar a descrição:
   - **DESCRIPTION**
   - Exemplo: *"Olá! Sou o Seu Raimundo, seu vendedor de carrys de confiança! Use !carry para começar."*

---

## 🤖 Status do Bot (Atividade):

No código do bot (`bot/index.js`), a linha 31 define o status:

```javascript
client.user.setActivity('!carry para comprar', { type: 'PLAYING' });
```

Você pode mudar para algo como:
- `'Carrys de Ragnarok'`
- `'Seu Raimundo à disposição!'`
- `'!carry - Vendendo carrys'`

---

## ✅ Checklist:

- [ ] Imagem baixada em `public/seu-raimundo-original.jpg`
- [ ] Acessar Discord Developer Portal
- [ ] Fazer upload do ícone em "APP ICON"
- [ ] Salvar alterações
- [ ] (Opcional) Mudar nome do bot para "Seu Raimundo"
- [ ] (Opcional) Adicionar descrição personalizada
- [ ] (Opcional) Editar status/atividade no código

---

## 🎉 Pronto!

Seu bot agora vai aparecer com a carinha do Seu Raimundo clássico da Escolinha! 😄

Ficou com alguma dúvida ou quer editar a imagem antes de usar?

