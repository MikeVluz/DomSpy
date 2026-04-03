# DomSpy - Guia de Instalacao do Zero

Este guia permite que qualquer pessoa recrie o DomSpy completo a partir do codigo fonte.

---

## Pre-requisitos

Instale antes de comecar:

1. **Node.js 20+** - https://nodejs.org (baixe a versao LTS)
2. **Git** - https://git-scm.com
3. **Conta no Supabase** - https://supabase.com (gratis)
4. **Conta na Vercel** - https://vercel.com (gratis)

Para verificar se esta instalado:
```bash
node --version   # deve mostrar v20.x ou superior
npm --version    # deve mostrar 10.x ou superior  
git --version    # deve mostrar qualquer versao
```

---

## Passo 1: Obter o Codigo

### Opcao A: Clonar do GitHub
```bash
git clone https://github.com/Grupo-xequemat/DomSpy.git
cd DomSpy
```

### Opcao B: Descompactar ZIP
Se voce tem o arquivo ZIP:
```bash
unzip DomSpy.zip
cd DomSpy
```

---

## Passo 2: Instalar Dependencias

```bash
npm install
```

Isso vai baixar todos os pacotes necessarios. Pode demorar 1-2 minutos.

---

## Passo 3: Criar o Banco de Dados (Supabase)

### 3.1 Criar Projeto
1. Acesse https://supabase.com e faca login
2. Clique em **New Project**
3. Escolha um nome (ex: `domspy`)
4. Defina uma senha forte para o banco
5. Escolha a regiao mais proxima (ex: South America)
6. Clique **Create new project** e aguarde

### 3.2 Copiar a Connection String
1. No painel do projeto, va em **Settings** > **Database**
2. Em **Connection string**, copie a **URI** (comeca com `postgresql://`)
3. Substitua `[YOUR-PASSWORD]` pela senha que voce definiu

### 3.3 Criar as Tabelas

**Opcao A: Via Prisma (recomendado)**

Configure primeiro o arquivo `.env` (Passo 4), depois rode:
```bash
npx prisma db push
```

**Opcao B: Via SQL Editor do Supabase**

1. No painel do Supabase, va em **SQL Editor**
2. Clique em **New Query**
3. Cole todo o SQL abaixo e clique **Run**

```sql
-- Enums
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'admin', 'viewer');
CREATE TYPE "UserStatus" AS ENUM ('active', 'pending', 'disabled');

-- User
CREATE TABLE "User" (
    "id" TEXT NOT NULL, "email" TEXT NOT NULL, "password" TEXT NOT NULL,
    "name" TEXT NOT NULL, "role" "UserRole" NOT NULL DEFAULT 'viewer',
    "status" "UserStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Domain
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL, "url" TEXT NOT NULL, "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCrawlAt" TIMESTAMP(3),
    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- Page
CREATE TABLE "Page" (
    "id" TEXT NOT NULL, "url" TEXT NOT NULL, "domainId" TEXT NOT NULL,
    "statusCode" INTEGER, "responseTime" INTEGER,
    "title" TEXT, "description" TEXT, "h1" TEXT, "headings" TEXT,
    "bodyText" TEXT, "images" TEXT, "contentHash" TEXT,
    "parentPageId" TEXT, "crawlId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Page_url_domainId_key" ON "Page"("url", "domainId");

-- Link
CREATE TABLE "Link" (
    "id" TEXT NOT NULL, "fromPageId" TEXT NOT NULL, "toPageId" TEXT,
    "href" TEXT NOT NULL, "statusCode" INTEGER,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "isRedirect" BOOLEAN NOT NULL DEFAULT false, "anchor" TEXT,
    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CrawlSession
CREATE TABLE "CrawlSession" (
    "id" TEXT NOT NULL, "domainId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3), "totalPages" INTEGER NOT NULL DEFAULT 0,
    "brokenLinks" INTEGER NOT NULL DEFAULT 0, "slowPages" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'running',
    CONSTRAINT "CrawlSession_pkey" PRIMARY KEY ("id")
);

-- DismissedAlert
CREATE TABLE "DismissedAlert" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "pageId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL, "alertType" TEXT NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DismissedAlert_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DismissedAlert_userId_pageId_alertType_key" ON "DismissedAlert"("userId", "pageId", "alertType");

-- PageGroup
CREATE TABLE "PageGroup" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6', "domainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageGroup_pkey" PRIMARY KEY ("id")
);

-- PageGroupMember
CREATE TABLE "PageGroupMember" (
    "id" TEXT NOT NULL, "pageId" TEXT NOT NULL, "groupId" TEXT NOT NULL,
    CONSTRAINT "PageGroupMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PageGroupMember_pageId_groupId_key" ON "PageGroupMember"("pageId", "groupId");

-- Funnel
CREATE TABLE "Funnel" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Funnel_pkey" PRIMARY KEY ("id")
);

-- FunnelPage
CREATE TABLE "FunnelPage" (
    "id" TEXT NOT NULL, "funnelId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL, "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "FunnelPage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FunnelPage_funnelId_pageId_key" ON "FunnelPage"("funnelId", "pageId");

-- FunnelLink
CREATE TABLE "FunnelLink" (
    "id" TEXT NOT NULL, "fromFunnelId" TEXT NOT NULL, "toFunnelId" TEXT NOT NULL,
    CONSTRAINT "FunnelLink_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FunnelLink_fromFunnelId_toFunnelId_key" ON "FunnelLink"("fromFunnelId", "toFunnelId");

-- Foreign Keys
ALTER TABLE "Page" ADD CONSTRAINT "Page_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE;
ALTER TABLE "Page" ADD CONSTRAINT "Page_parentPageId_fkey" FOREIGN KEY ("parentPageId") REFERENCES "Page"("id") ON DELETE SET NULL;
ALTER TABLE "Page" ADD CONSTRAINT "Page_crawlId_fkey" FOREIGN KEY ("crawlId") REFERENCES "CrawlSession"("id") ON DELETE SET NULL;
ALTER TABLE "Link" ADD CONSTRAINT "Link_fromPageId_fkey" FOREIGN KEY ("fromPageId") REFERENCES "Page"("id") ON DELETE CASCADE;
ALTER TABLE "Link" ADD CONSTRAINT "Link_toPageId_fkey" FOREIGN KEY ("toPageId") REFERENCES "Page"("id") ON DELETE SET NULL;
ALTER TABLE "CrawlSession" ADD CONSTRAINT "CrawlSession_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE;
ALTER TABLE "DismissedAlert" ADD CONSTRAINT "DismissedAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "DismissedAlert" ADD CONSTRAINT "DismissedAlert_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE;
ALTER TABLE "DismissedAlert" ADD CONSTRAINT "DismissedAlert_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE;
ALTER TABLE "PageGroup" ADD CONSTRAINT "PageGroup_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE;
ALTER TABLE "PageGroupMember" ADD CONSTRAINT "PageGroupMember_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE;
ALTER TABLE "PageGroupMember" ADD CONSTRAINT "PageGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PageGroup"("id") ON DELETE CASCADE;
ALTER TABLE "FunnelPage" ADD CONSTRAINT "FunnelPage_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "Funnel"("id") ON DELETE CASCADE;
ALTER TABLE "FunnelPage" ADD CONSTRAINT "FunnelPage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE;
ALTER TABLE "FunnelLink" ADD CONSTRAINT "FunnelLink_fromFunnelId_fkey" FOREIGN KEY ("fromFunnelId") REFERENCES "Funnel"("id") ON DELETE CASCADE;
ALTER TABLE "FunnelLink" ADD CONSTRAINT "FunnelLink_toFunnelId_fkey" FOREIGN KEY ("toFunnelId") REFERENCES "Funnel"("id") ON DELETE CASCADE;
```

---

## Passo 4: Configurar Variaveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o `.env` com seus dados:

```env
# Banco de Dados - cole a URI do Supabase (Passo 3.2)
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJETO.supabase.co:5432/postgres"

# Segredo do NextAuth - gere uma string aleatoria
# Linux/Mac: openssl rand -base64 32
# Windows: use um gerador online de senhas (32+ caracteres)
NEXTAUTH_SECRET="COLE_AQUI_UMA_STRING_ALEATORIA_LONGA"

# URL da aplicacao (mude para seu dominio em producao)
NEXTAUTH_URL="http://localhost:3000"

# Senha do primeiro admin (usado apenas no seed)
SUPER_ADMIN_PASSWORD="SuaSenhaForte123!"
```

---

## Passo 5: Criar as Tabelas no Banco

Se voce nao criou as tabelas manualmente (Passo 3.3 Opcao B):

```bash
npx prisma db push
```

---

## Passo 6: Criar o Primeiro Usuario (Admin)

```bash
npx prisma db seed
```

Isso cria um usuario Super Admin com:
- Email: `admin@domspy.com`
- Senha: o valor de `SUPER_ADMIN_PASSWORD` no `.env`

---

## Passo 7: Rodar Localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

Faca login com o email e senha do admin criado no Passo 6.

---

## Passo 8: Deploy na Vercel

### 8.1 Conectar Repositorio
1. Acesse https://vercel.com
2. Clique **Add New Project**
3. Importe o repositorio do GitHub
4. Framework: Next.js (detectado automaticamente)

### 8.2 Configurar Variaveis
Em **Environment Variables**, adicione:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | URI do Supabase |
| `NEXTAUTH_SECRET` | String aleatoria longa |
| `NEXTAUTH_URL` | URL da Vercel (ex: https://domspy.vercel.app) |

### 8.3 Deploy
Clique **Deploy**. O build roda automaticamente.

Apos o deploy, cada push no `main` atualiza automaticamente.

---

## Passo 9: Configurar Dominio Proprio (Opcional)

1. Na Vercel, va em **Settings** > **Domains**
2. Adicione seu dominio (ex: `domspy.seusite.com.br`)
3. Configure o DNS apontando para a Vercel (CNAME ou A record)
4. Atualize `NEXTAUTH_URL` nas variaveis de ambiente

---

## Solucao de Problemas

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Cannot connect to database"
Verifique a `DATABASE_URL` no `.env`. A senha nao pode ter caracteres especiais sem encoding.

### "NEXTAUTH_SECRET is not set"
Gere com: `openssl rand -base64 32` e cole no `.env`

### Build falha na Vercel
Verifique se TODAS as variaveis de ambiente estao configuradas no painel da Vercel.

### Crawl bloqueado por Cloudflare
Alguns sites usam protecao que bloqueia crawlers automaticos. Isso e normal e aparece como status "Bloqueado".

---

## Rodar em Docker (Alternativa)

Crie um `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t domspy .
docker run -p 3000:3000 --env-file .env domspy
```

---

## Rodar em VPS (Alternativa)

```bash
# Na VPS (Ubuntu/Debian)
sudo apt update
sudo apt install nodejs npm
git clone [url-do-repo]
cd DomSpy
npm install
cp .env.example .env
# edite .env com nano/vim
npx prisma db push
npx prisma db seed
npm run build
npm start
```

Para rodar como servico permanente:
```bash
sudo npm install -g pm2
pm2 start npm --name domspy -- start
pm2 save
pm2 startup
```

---

DomSpy v2.0 - Guia de Instalacao
