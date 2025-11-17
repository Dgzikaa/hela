# 🎮 Rodízio Ragnatales

Sistema de gerenciamento de rodízio para missões em Ragnatales. Controle quem deve ficar de fora, gerencie suplentes e organize missões com estilo!

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?style=for-the-badge&logo=prisma)

---

## ✨ Funcionalidades

- ✅ **Gerenciamento de Jogadores** - Cadastre o time principal
- ✅ **Sistema de Suplentes** - Controle suplentes e suas participações
- ✅ **Rodízio Inteligente** - Sugere automaticamente quem deve ficar de fora
- ✅ **3 Tipos de Missões**:
  - 🎯 **Normal** - Missão regular com rodízio
  - 🛡️ **Suplente** - Missão com substituição
  - ⚔️ **Carry** - Missão com jogador externo (pago)
- ✅ **Dashboard com Estatísticas** - Visualize números em tempo real
- ✅ **Interface Moderna** - Design glassmorphism com animações suaves
- ✅ **Responsive** - Funciona perfeitamente em mobile e desktop

---

## 🚀 Deploy Rápido

### Opção 1: Deploy em Produção (Recomendado)

Siga o guia completo em **[DEPLOY.md](./DEPLOY.md)** para:
- Configurar Supabase (banco de dados grátis)
- Deploy na Vercel (hospedagem grátis)
- Configurar variáveis de ambiente
- 100% gratuito! ✅

### Opção 2: Desenvolvimento Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados local (SQLite)
# Crie um arquivo .env na raiz:
echo 'DATABASE_URL="file:./dev.db"' > .env

# 3. Gerar Prisma Client e criar banco
npx prisma generate
npx prisma db push

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript 5](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/) (Supabase) / SQLite (dev)
- **ORM**: [Prisma 6](https://www.prisma.io/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Hospedagem**: [Vercel](https://vercel.com/)

---

## 📁 Estrutura do Projeto

```
rodizio-ragnatales/
├── app/
│   ├── api/              # API Routes
│   │   ├── jogadores/    # CRUD de jogadores
│   │   ├── suplentes/    # CRUD de suplentes
│   │   └── missoes/      # CRUD de missões
│   ├── components/       # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Página inicial
│   └── globals.css       # Estilos globais + animações
├── lib/
│   ├── prisma.ts         # Cliente Prisma
│   └── utils.ts          # Funções utilitárias
├── prisma/
│   └── schema.prisma     # Schema do banco de dados
├── DEPLOY.md             # Guia completo de deploy
└── README.md             # Este arquivo
```

---

## 📊 Schema do Banco de Dados

```prisma
model Jogador {
  id           Int      @id @default(autoincrement())
  nick         String   @unique
  ativo        Boolean  @default(true)
  missoesFora  Missao[]
}

model Suplente {
  id      Int      @id @default(autoincrement())
  nick    String   @unique
  ativo   Boolean  @default(true)
  missoes Missao[]
}

model Missao {
  id            Int       @id @default(autoincrement())
  data          DateTime
  tipo          String    // "Normal", "Suplente", "Carry"
  jogadorFora   Jogador   @relation(...)
  suplente      Suplente? @relation(...)
  carryNome     String?
  carryValor    Float?
  status        String    // "Agendado", "Concluído", "Cancelado"
  observacoes   String?
}
```

---

## 🎯 Como Funciona o Rodízio?

O sistema utiliza um algoritmo inteligente para sugerir quem deve ficar de fora:

1. **Prioridade por menos vezes fora**: Quem ficou menos vezes tem prioridade
2. **Critério de desempate**: Se houver empate, quem ficou de fora há mais tempo
3. **Estatísticas em tempo real**: Dashboard mostra a situação de cada jogador

---

## 🎨 Screenshots

### Dashboard Principal
Interface moderna com estatísticas em tempo real e cards animados.

### Gestão de Jogadores
Adicione e visualize jogadores com suas estatísticas de participação.

### Criação de Missões
Formulário intuitivo com suporte a 3 tipos diferentes de missões.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

---

## 📝 Licença

Este projeto é de código aberto e está disponível sob a [Licença MIT](LICENSE).

---

## 📞 Suporte

Problemas ou dúvidas? 
- 📖 Leia o [DEPLOY.md](./DEPLOY.md) para instruções detalhadas
- 🐛 Abra uma [Issue](../../issues) no GitHub
- 💬 Entre em contato com a equipe

---

## 🎉 Agradecimentos

Desenvolvido com ❤️ para a comunidade Ragnatales.

**Boas missões!** ⚔️🛡️🎮
