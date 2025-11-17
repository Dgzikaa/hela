# 🎮 Hela Carrys - Sistema de Venda de Carrys Ragnatales

Sistema profissional completo para gestão e venda de carrys dos bosses de Ragnatales.

## 🚀 Features

### 📱 Página Pública (`/comprar`)
- ✅ Seleção visual de bosses com imagens da API oficial
- ✅ Cálculo automático de preços e descontos
- ✅ Pacote completo 1-6 com brinde (Conquista Sem Morrer grátis!)
- ✅ Formulário de pedido simples e intuitivo
- ✅ Confirmação de pedido

### 🔐 Painel Admin (`/admin`)
- ✅ Autenticação com NextAuth
- ✅ Dashboard com estatísticas
- ✅ Listagem de pedidos em tempo real
- ✅ Aprovação de pedidos
- ✅ Gestão de status
- ✅ Visualização de bosses por pedido

### 💾 Banco de Dados
- ✅ PostgreSQL (Supabase)
- ✅ Prisma ORM
- ✅ Schema completo com:
  - Usuários (admin)
  - Jogadores (com categorias: HELA, CARRYS, SUPLENTE)
  - Bosses (com preços e imagens)
  - Pedidos (com status e valores)
  - Itens do Pedido
  - Participações (divisão de valores)

## 🏗️ Tecnologias

- **Next.js 16** (App Router)
- **TypeScript 5**
- **Tailwind CSS 4**
- **Prisma 6**
- **NextAuth.js** (autenticação)
- **PostgreSQL** (Supabase)
- **Bcryptjs** (hash de senhas)

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/Dgzikaa/hela.git
cd hela

# Instale as dependências
npm install

# Configure o .env
cp .env.example .env
# Edite o .env com suas credenciais

# Execute as migrations
npm run db:migrate

# Popule o banco com bosses e usuário admin
npm run db:seed

# Inicie o servidor
npm run dev
```

## 🔑 Credenciais Padrão

Após executar o seed:
- **Email:** `admin@hela.com`
- **Senha:** `admin123`

**⚠️ IMPORTANTE:** Altere essas credenciais em produção!

## 📊 Bosses e Preços

| Boss | Preço |
|------|-------|
| Freylith (1) | 70KK |
| Tyrgrim (2) | 100KK |
| Skollgrim (3) | 130KK |
| Baldira (4) | 150KK |
| Thorvald (5) | 230KK |
| Glacius (6) | 300KK |
| **Pacote 1-6** | **500KK** |
| Conquista Sem Morrer | 150KK (grátis no pacote) |

## 🗂️ Estrutura do Projeto

```
hela/
├── app/
│   ├── admin/              # Área administrativa
│   │   ├── login/          # Login do admin
│   │   └── page.tsx        # Dashboard
│   ├── comprar/            # Página pública de compra
│   ├── api/
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── bosses/         # API de bosses
│   │   └── pedidos/        # API de pedidos
│   └── components/         # Componentes reutilizáveis
├── prisma/
│   ├── schema.prisma       # Schema do banco
│   └── seed.ts             # Seeds iniciais
└── lib/
    ├── prisma.ts           # Cliente Prisma
    └── utils.ts            # Utilitários
```

## 🚀 Deploy

### Vercel + Supabase

1. **Crie um projeto no Supabase**
2. **Configure as variáveis de ambiente no Vercel:**
   - `DATABASE_URL` (Session Pooler)
   - `DIRECT_URL` (Direct Connection)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

3. **Faça o deploy:**
```bash
git push origin main
```

O Vercel fará o deploy automático!

## 🔐 Segurança

- Senhas com hash bcrypt
- Autenticação JWT via NextAuth
- Rotas admin protegidas
- Validações no backend
- SSL obrigatório no banco

## 🎯 Próximos Passos

- [ ] Sistema de notificações (Discord webhook)
- [ ] Gestão de times (montar equipe para cada carry)
- [ ] Divisão automática de valores
- [ ] Calendário de agendamentos
- [ ] Relatórios financeiros
- [ ] Dashboard de jogadores

## 📝 Licença

Projeto privado - Todos os direitos reservados

## 👥 Autores

- **Dgzikaa** - Desenvolvimento

---

**Ragnatales © 2024**
