# Quita — Plataforma de Saúde Financeira

MicroSaaS de saúde financeira para pessoas físicas endividadas e donos de pequenos negócios que querem recuperar o controle financeiro e construir riqueza.

## Funcionalidades

- **Diagnóstico financeiro** — Índice de saúde 0-100, comprometimento de renda, checklist
- **Gestão de dívidas** — Cadastro, priorização automática por taxa de juros (método avalanche)
- **Custo de oportunidade** — Quanto as dívidas custam além dos juros
- **Plano de ação em 6 etapas** — Do estancamento ao fundo de emergência
- **IA conselheira** — Chat com Claude Sonnet, contextualizado com seus dados financeiros
- **Aumento de receita** — Mapeamento de habilidades + sugestões personalizadas por IA (Plano Pro)
- **Liderança** — Módulo para donos de negócio (Plano Pro)
- **Propósito** — Diário de reflexão financeira e emocional (Plano Elite)
- **Integração Cakto** — Webhook para liberação automática de planos após pagamento

## Stack

- **Frontend/Backend**: Next.js 16 (App Router) + TypeScript
- **Estilo**: Tailwind CSS v4
- **ORM**: Prisma 7 com driver adapter pg
- **Banco de dados**: PostgreSQL via Supabase
- **Autenticação**: Supabase Auth (email + Google OAuth)
- **IA**: Anthropic API (`claude-sonnet-4-20250514`)
- **Pagamentos**: Cakto (webhook only)
- **Deploy**: Vercel

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Chave de API da [Anthropic](https://console.anthropic.com)
- Conta na [Cakto](https://cakto.com.br) (para pagamentos)

### Passo a passo

1. Clone o repositório e instale as dependências:

```bash
git clone <seu-repositorio>
cd quita
npm install
```

2. Configure as variáveis de ambiente:

```bash
cp .env.local .env.local
# Edite .env.local com suas credenciais
```

3. Gere o Prisma Client:

```bash
npx prisma generate
```

4. Rode as migrations no banco:

```bash
npx prisma db push
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

| Variável | Descrição | Onde encontrar |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública do Supabase | Supabase Dashboard → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço do Supabase (admin) | Supabase Dashboard → Settings → API → service_role |
| `DATABASE_URL` | String de conexão PostgreSQL | Supabase Dashboard → Settings → Database → Connection string → URI |
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic | console.anthropic.com → API Keys |
| `CAKTO_WEBHOOK_SECRET` | Secret para validar webhooks da Cakto | Cakto Dashboard → Webhooks |
| `CAKTO_PRODUCT_ID_ESSENCIAL` | ID do produto Essencial na Cakto | Cakto Dashboard → Produtos |
| `CAKTO_PRODUCT_ID_PRO` | ID do produto Pro na Cakto | Cakto Dashboard → Produtos |
| `CAKTO_PRODUCT_ID_ELITE` | ID do produto Elite na Cakto | Cakto Dashboard → Produtos |
| `NEXT_PUBLIC_CAKTO_CHECKOUT_ESSENCIAL` | URL de checkout do plano Essencial | Cakto Dashboard → Produtos → Link de checkout |
| `NEXT_PUBLIC_CAKTO_CHECKOUT_PRO` | URL de checkout do plano Pro | Cakto Dashboard → Produtos → Link de checkout |
| `NEXT_PUBLIC_CAKTO_CHECKOUT_ELITE` | URL de checkout do plano Elite | Cakto Dashboard → Produtos → Link de checkout |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação | `http://localhost:3000` em dev, URL da Vercel em prod |

## Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **Authentication → Providers** e habilite:
   - **Email** (habilitado por padrão)
   - **Google** — crie credenciais OAuth no Google Cloud Console e cole o Client ID e Secret
3. Vá em **Settings → API** e copie:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
4. Vá em **Settings → Database → Connection string (URI)** → copie → `DATABASE_URL`
5. Rode `npx prisma db push` para criar as tabelas

## Configurando os produtos na Cakto

### Criar os produtos

1. Acesse o painel da [Cakto](https://cakto.com.br)
2. Vá em **Produtos → Novo produto** e crie três produtos:

| Produto | Preço | Tipo |
|---|---|---|
| Quita Essencial | R$ 19,90 | Assinatura mensal |
| Quita Pro | R$ 47,00 | Assinatura mensal |
| Quita Elite | R$ 97,00 | Assinatura mensal |

3. Para cada produto, copie:
   - **ID do produto** → variáveis `CAKTO_PRODUCT_ID_*`
   - **Link de checkout** → variáveis `NEXT_PUBLIC_CAKTO_CHECKOUT_*`

### Configurar o webhook

1. No painel da Cakto, vá em **Configurações → Webhooks**
2. Adicione um novo webhook:
   - **URL**: `https://seu-dominio.vercel.app/api/cakto/webhook`
   - **Secret**: crie uma string aleatória segura → `CAKTO_WEBHOOK_SECRET`
3. Habilite os eventos:
   - `purchase_approved`
   - `subscription_renewed`
   - `subscription_canceled`
   - `refund`
   - `chargeback`

O webhook cria/atualiza o usuário no banco automaticamente após cada compra ou cancelamento.

## Deploy na Vercel

1. Faça push do código para o GitHub

2. Acesse [vercel.com](https://vercel.com) e importe o repositório

3. Configure as variáveis de ambiente no painel da Vercel:
   - Vá em **Settings → Environment Variables**
   - Adicione todas as variáveis do `.env.local`
   - Em `NEXT_PUBLIC_APP_URL`, coloque a URL da Vercel (ex: `https://quita.vercel.app`)

4. Em **Settings → Functions → Region**, selecione `São Paulo (GRU1)` para melhor latência no Brasil

5. Clique em **Deploy**

6. Após o deploy, atualize o webhook da Cakto com a URL real da Vercel

7. No Supabase, adicione a URL da Vercel em **Authentication → URL Configuration → Site URL**

## Arquitetura dos planos

| Módulo | Essencial | Pro | Elite |
|---|---|---|---|
| Painel + diagnóstico + dívidas | ✅ | ✅ | ✅ |
| Plano de ação | ✅ | ✅ | ✅ |
| Chat com IA | ✅ | ✅ | ✅ |
| Aumento de receita | ❌ | ✅ | ✅ |
| Liderança | ❌ | ✅ | ✅ |
| Propósito | ❌ | ❌ | ✅ |

A liberação de módulos é controlada pelo campo `plano` no model `User` do banco de dados, atualizado automaticamente pelo webhook da Cakto.

## Estrutura de arquivos

```
quita/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                # dynamic = force-dynamic
│   │   ├── login/page.tsx
│   │   └── cadastro/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                # dynamic = force-dynamic
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Painel geral
│   │   │   ├── diagnostico/page.tsx
│   │   │   ├── dividas/page.tsx
│   │   │   ├── plano/page.tsx
│   │   │   ├── receita/page.tsx
│   │   │   ├── lideranca/page.tsx
│   │   │   └── proposito/page.tsx
│   │   └── planos/page.tsx
│   └── api/
│       ├── cakto/webhook/route.ts
│       ├── dividas/route.ts
│       ├── ia/conselho/route.ts
│       ├── proposito/route.ts
│       ├── receitas/route.ts
│       └── usuario/route.ts
├── components/
│   ├── dashboard/
│   │   ├── ChatIA.tsx
│   │   └── DashboardLayout.tsx       # Sidebar + topbar
│   └── ui/
│       └── LockedOverlay.tsx
├── lib/
│   ├── calculos/
│   │   ├── custoOportunidade.ts
│   │   ├── indiceSaude.ts
│   │   └── prioridadeDivida.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── anthropic.ts
│   ├── cakto.ts
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
├── prisma.config.ts
└── proxy.ts                          # Auth proxy (Next.js 16)
```
