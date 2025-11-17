# 🚀 Guia de Deploy - Rodízio Ragnatales

Este guia vai te ajudar a colocar o sistema no ar usando **Supabase** (banco de dados) e **Vercel** (hospedagem) - **100% GRÁTIS!**

---

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta no [Vercel](https://vercel.com) (gratuita)
- Conta no [GitHub](https://github.com) (gratuita)

---

## 1️⃣ Configurar o Supabase (Banco de Dados)

### Passo 1: Criar novo projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `rodizio-ragnatales`
   - **Database Password**: Crie uma senha forte (anote ela!)
   - **Region**: Escolha `South America (São Paulo)` (mais próximo)
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos enquanto o projeto é criado

### Passo 2: Aplicar o Schema (Criar tabelas)

1. No menu lateral do Supabase, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Cole o seguinte código SQL:

```sql
-- Jogadores principais (time fixo)
CREATE TABLE jogadores (
  id SERIAL PRIMARY KEY,
  nick VARCHAR(255) UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Suplentes
CREATE TABLE suplentes (
  id SERIAL PRIMARY KEY,
  nick VARCHAR(255) UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Missões/Rodízio
CREATE TABLE missoes (
  id SERIAL PRIMARY KEY,
  data TIMESTAMP NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  "jogadorForaId" INTEGER NOT NULL REFERENCES jogadores(id),
  "suplenteId" INTEGER REFERENCES suplentes(id),
  "carryNome" VARCHAR(255),
  "carryValor" DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) NOT NULL,
  observacoes TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_missoes_jogador ON missoes("jogadorForaId");
CREATE INDEX idx_missoes_suplente ON missoes("suplenteId");
CREATE INDEX idx_missoes_status ON missoes(status);
CREATE INDEX idx_missoes_data ON missoes(data);
```

4. Clique em **"Run"** (ou pressione F5)
5. Verifique se apareceu "Success. No rows returned" ✅

### Passo 3: Pegar as credenciais do banco

1. No menu lateral, clique em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"Database"**
3. Role até **"Connection string"**
4. Copie a **"Connection Pooling"** em modo **"Session"**
   - Clique em **"URI"**
   - Copie a URL (exemplo: `postgresql://postgres.xxxxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`)
   - **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha que você criou no Passo 1

**Exemplo:**
```
postgresql://postgres.abcdef:MinhaS3nh4F0rt3@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

5. Salve essa URL em um arquivo temporário (vamos usar daqui a pouco)

---

## 2️⃣ Subir o código no GitHub

### Se já tem repositório:
```bash
git add .
git commit -m "Preparar para deploy"
git push
```

### Se NÃO tem repositório ainda:
1. Crie um novo repositório no GitHub
2. No terminal do projeto, execute:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/rodizio-ragnatales.git
git push -u origin main
```

---

## 3️⃣ Deploy na Vercel

### Passo 1: Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New"** → **"Project"**
3. **Import Git Repository**
   - Conecte sua conta do GitHub (se ainda não conectou)
   - Selecione o repositório `rodizio-ragnatales`
4. Clique em **"Import"**

### Passo 2: Configurar variáveis de ambiente

1. Antes de clicar em "Deploy", expanda **"Environment Variables"**
2. Adicione as seguintes variáveis:

**Variável 1:**
- **Name**: `DATABASE_URL`
- **Value**: Cole a URL do Supabase que você copiou (a completa com a senha)
- Marque: **Production, Preview, Development**

**Variável 2:**
- **Name**: `DIRECT_URL`
- **Value**: Cole a mesma URL do Supabase
- Marque: **Production, Preview, Development**

**Exemplo:**
```
DATABASE_URL=postgresql://postgres.abcdef:MinhaS3nh4F0rt3@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.abcdef:MinhaS3nh4F0rt3@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

### Passo 3: Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos enquanto o Vercel faz o build
3. 🎉 Quando aparecer **"Congratulations!"**, está pronto!

### Passo 4: Acessar o site

1. Clique em **"Visit"** ou copie a URL
2. Sua URL será algo como: `https://rodizio-ragnatales.vercel.app`
3. Compartilhe essa URL com os outros jogadores!

---

## 4️⃣ Aplicar Migrations do Prisma (Importante!)

Após o primeiro deploy, você precisa rodar as migrations:

1. No terminal do seu projeto local, execute:

```bash
npx prisma generate
npx prisma db push
```

2. Isso sincroniza o schema do Prisma com o banco Supabase

---

## ✅ Checklist Final

- [ ] Projeto criado no Supabase
- [ ] Schema SQL aplicado no Supabase
- [ ] Código no GitHub
- [ ] Deploy feito na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Site acessível pela URL da Vercel
- [ ] Testado: criar jogador, suplente e missão

---

## 🎯 Domínio Personalizado (Opcional)

Se quiser um domínio tipo `ragnatales.com` ao invés de `rodizio-ragnatales.vercel.app`:

1. Compre um domínio em: Registro.br, Namecheap, etc.
2. Na Vercel:
   - Vá em **"Settings"** → **"Domains"**
   - Adicione seu domínio
   - Configure o DNS seguindo as instruções

---

## 🆘 Problemas Comuns

### ❌ "Error connecting to database"
- Verifique se as variáveis `DATABASE_URL` e `DIRECT_URL` estão corretas
- Confirme que substituiu `[YOUR-PASSWORD]` pela senha real

### ❌ "Prisma schema not found"
- Execute `npx prisma generate` localmente
- Faça commit e push das mudanças

### ❌ "Table does not exist"
- Execute o SQL do Passo 2 novamente no Supabase
- Ou execute `npx prisma db push` localmente

---

## 📱 Próximos Passos

1. **Teste tudo**: Crie alguns jogadores, suplentes e missões de teste
2. **Compartilhe a URL**: Envie para os outros jogadores acessarem
3. **Atualizações**: Qualquer mudança que você fizer:
   ```bash
   git add .
   git commit -m "Descrição da mudança"
   git push
   ```
   A Vercel fará deploy automático!

---

## 💰 Custos

**TUDO É GRÁTIS!** 🎉

- ✅ **Supabase Free**: 500MB de dados, 2GB de armazenamento
- ✅ **Vercel Free**: Deploy ilimitado, domínio gratuito
- ✅ **GitHub Free**: Repositórios ilimitados

Só paga se quiser recursos extras (que você não precisa para este projeto).

---

## 📞 Suporte

Se tiver dúvidas, problemas ou precisar de ajuda:
- Verifique os logs no Vercel (tab "Deployments" → clique no deploy → "View Function Logs")
- Verifique o console do navegador (F12)
- Revise este guia passo a passo

Boa sorte e boas missões! 🎮⚔️

