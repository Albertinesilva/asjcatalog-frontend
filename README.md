# DS Catalog

Catálogo de produtos full-stack — front-end em **React 19 + TanStack Start**
consumindo uma API REST Spring Boot (DSCatalog). O projeto inclui área
pública (Home + Catálogo) e área administrativa autenticada via OAuth2 com
CRUD de Produtos, Categorias e Usuários.

> Stack: **TanStack Start v1 (SSR/Vite) · React 19 · TypeScript 5 · TanStack
> Query · React Hook Form · Axios · Bootstrap 5 + Tailwind v4 · shadcn/ui ·
> JWT (jwt-decode) · Zod**

---

## Sumário

1. [Visão geral](#visão-geral)
2. [Stack e dependências](#stack-e-dependências)
3. [Estrutura de pastas](#estrutura-de-pastas)
4. [Como rodar localmente](#como-rodar-localmente)
5. [Variáveis de ambiente](#variáveis-de-ambiente)
6. [Roteamento (TanStack Router)](#roteamento-tanstack-router)
7. [Camada de dados e API](#camada-de-dados-e-api)
8. [Autenticação e autorização](#autenticação-e-autorização)
9. [Proxy de API (`/api/proxy/*`)](#proxy-de-api-apiproxy)
10. [Design system e responsividade](#design-system-e-responsividade)
11. [Convenções de código](#convenções-de-código)
12. [Scripts](#scripts)
13. [Troubleshooting](#troubleshooting)

---

## Visão geral

O DS Catalog é um SPA com SSR que serve dois públicos:

- **Área pública** (`/`, `/catalog`, `/catalog/product/:id`) — qualquer
  visitante pode navegar pelo catálogo, filtrar produtos e ver detalhes.
- **Área administrativa** (`/admin/*`) — protegida por autenticação JWT.
  Operadores fazem CRUD de produtos/categorias; administradores gerenciam
  usuários.

O front consome a API Spring Boot do projeto **DSCatalog** (endpoints
`/oauth2/token`, `/products`, `/categories`, `/users`). Em ambiente de
preview da Lovable, todas as chamadas passam por um proxy serverless para
contornar CORS e mixed-content (HTTPS → HTTP).

---

## Stack e dependências

| Camada            | Tecnologia                                     |
| ----------------- | ---------------------------------------------- |
| Build / SSR       | TanStack Start v1 + Vite 7                     |
| UI Framework      | React 19 + TypeScript 5                        |
| Roteamento        | TanStack Router (file-based)                   |
| Estado de servidor| TanStack Query v5                              |
| Formulários       | React Hook Form + Zod                          |
| HTTP              | Axios + query-string                           |
| Estilo            | Bootstrap 5 + Tailwind v4 + CSS Modules        |
| Componentes       | shadcn/ui (Radix) + ícones lucide-react        |
| Auth              | JWT (Bearer) + `jwt-decode` + localStorage     |
| Runtime servidor  | Cloudflare Workers (nodejs_compat)             |

---

## Estrutura de pastas

```text
src/
├── assets/                     # SVGs e imagens estáticas
├── components/
│   ├── Navbar/                 # Top bar com hambúrguer mobile
│   ├── NavbarLink/             # Link com estado ativo
│   ├── Sidebar/                # Nav lateral do /admin
│   ├── ButtonIcon/             # Botão azul com seta (login/CTA)
│   ├── ProductItem/            # Card de produto (catálogo público)
│   ├── ProductItemAdmin/       # Card de produto (admin)
│   ├── ProductPrice/           # Renderização R$ X.XXX,XX
│   └── ui/                     # shadcn/ui (button, dialog, form…)
├── features/admin/
│   └── ProductForm.tsx         # Formulário compartilhado new/edit
├── lib/
│   ├── api.ts                  # axios instance + loginRequest
│   ├── auth.ts                 # localStorage + JWT helpers
│   ├── use-auth.ts             # hook reativo de sessão
│   ├── types.ts                # tipos de domínio (Product, Category…)
│   └── utils.ts                # cn() (clsx + tailwind-merge)
├── routes/                     # File-based routing
│   ├── __root.tsx              # Shell HTML + providers + Navbar
│   ├── index.tsx               # /
│   ├── catalog.index.tsx       # /catalog
│   ├── catalog.product.$product.tsx
│   ├── admin.auth.tsx          # /admin/auth (login)
│   ├── admin.register.tsx      # /admin/register
│   ├── admin.recover.tsx       # /admin/recover
│   ├── _authenticated.tsx      # layout pathless com gate JWT
│   ├── _authenticated/
│   │   ├── admin.tsx           # layout com Sidebar
│   │   ├── admin.index.tsx
│   │   ├── admin.products.tsx
│   │   ├── admin.products.new.tsx
│   │   ├── admin.products.$id.tsx
│   │   ├── admin.categories.tsx
│   │   └── admin.users.tsx     # restrito a ROLE_ADMIN
│   └── api.proxy.$.ts          # Proxy serverless → backend
├── styles/
│   ├── dscatalog-globals.css   # Reset + tokens + safe-area
│   └── pages/                  # CSS Modules por página
└── styles.css                  # Tailwind v4 + tokens shadcn
```

---

## Como rodar localmente

Pré-requisitos: **Bun ≥ 1.1** (ou npm/pnpm), Node 20+ disponível para o
toolchain do TanStack Start.

```bash
# 1. Instalar dependências
bun install

# 2. Variáveis de ambiente (opcional; ver seção abaixo)
cp .env.example .env.local   # se existir

# 3. Dev server (Vite + SSR)
bun run dev                  # http://localhost:8080

# 4. Build de produção
bun run build
bun run preview              # serve o build localmente
```

> O front espera que a API Spring Boot esteja rodando em
> `http://localhost:8080` por padrão. Suba o backend DSCatalog (ou aponte
> `VITE_API_BASE_URL` para outra URL) antes de testar fluxos autenticados
> ou listagens de produto.

---

## Variáveis de ambiente

Todas são lidas via `import.meta.env.*` (build-time) ou `process.env.*` no
runtime do servidor (proxy).

| Variável                 | Default                  | Descrição                                  |
| ------------------------ | ------------------------ | ------------------------------------------ |
| `VITE_API_BASE_URL`      | `http://localhost:8080`  | URL base da API Spring DSCatalog           |
| `VITE_CLIENT_ID`         | `myclientid`             | client_id usado no Basic Auth do `/oauth2/token` |
| `VITE_CLIENT_SECRET`     | `myclientsecret`         | client_secret correspondente                |

Prefixos:

- `VITE_*` — embutidas no bundle do browser. **Não coloque secrets aqui.**
- Sem prefixo (`process.env.*`) — disponíveis apenas no servidor (server
  functions e rotas `/api/*`).

---

## Roteamento (TanStack Router)

A pasta `src/routes/` segue **file-based routing** com convenção de pontos:

- `index.tsx` → `/`
- `catalog.index.tsx` → `/catalog`
- `catalog.product.$product.tsx` → `/catalog/product/:product`
- `_authenticated.tsx` → layout pathless com gate de autenticação
- `_authenticated/admin.products.$id.tsx` → `/admin/products/:id`

O arquivo `src/routeTree.gen.ts` é **gerado automaticamente** pelo plugin
do Vite — nunca edite à mão.

Rotas públicas com fetch de dados usam `ssr: false` para evitar que o
loader rode durante o prerender (quando não há acesso ao backend
`localhost`). Ex.: `catalog.index.tsx`, `catalog.product.$product.tsx`,
`admin.auth.tsx`.

### Boundary de autenticação

`src/routes/_authenticated.tsx` é um layout pathless: o segmento
`_authenticated` **não aparece na URL**, mas serve como guard. No
`beforeLoad` ele chama `isAuthenticated()` (verifica JWT no
localStorage + `exp`) e, se falso, dispara `redirect({ to: '/admin/auth' })`.

```text
src/routes/_authenticated.tsx          → guard JWT
src/routes/_authenticated/admin.tsx    → layout com <Sidebar /> + <Outlet />
src/routes/_authenticated/admin.*.tsx  → páginas internas
```

---

## Camada de dados e API

Padrão **TanStack Query + Axios**. Cada rota define `queryOptions`
reutilizáveis e consome via `useSuspenseQuery`:

```ts
const productsQueryOptions = queryOptions({
  queryKey: ["catalog", "products", { page: 0, size: 12 }],
  queryFn: async () => {
    const res = await api.get<ProductsPage>("/products", {
      params: { page: 0, size: 12, sort: "name,asc" },
    });
    return res.data;
  },
});

function CatalogPage() {
  const { data } = useSuspenseQuery(productsQueryOptions);
  // ...
}
```

A instância `api` (em `src/lib/api.ts`):

- Usa `baseURL = '/api/proxy'` quando rodando na Lovable (`*.lovable.app`)
  e `VITE_API_BASE_URL` localmente.
- Interceptor de request injeta `Authorization: Bearer <access_token>`
  quando há sessão.
- Interceptor de response chama `logout()` em `401` (sessão expirada).

---

## Autenticação e autorização

Fluxo OAuth2 **password grant** contra o backend Spring:

```text
POST /oauth2/token
Authorization: Basic base64(client_id:client_secret)
Content-Type:  application/x-www-form-urlencoded

username=...&password=...&grant_type=password

→ 200 { access_token, token_type, expires_in, scope, ... }
```

O `access_token` é um JWT. `src/lib/auth.ts` expõe:

| Função                | Responsabilidade                                     |
| --------------------- | ---------------------------------------------------- |
| `saveSessionData()`   | Persiste o token em `localStorage["authData"]`       |
| `getSessionData()`    | Lê a sessão (SSR-safe: retorna `null` no servidor)   |
| `getDecodedToken()`   | Decoda o JWT (`jwt-decode`) → `{ exp, user_name, authorities }` |
| `isTokenValid()`      | Compara `exp` com `Date.now()`                       |
| `isAuthenticated()`   | `getSessionData() && isTokenValid()`                 |
| `hasAnyRole([...])`   | Verifica `authorities` (ex.: `ROLE_ADMIN`)           |
| `logout()`            | Remove sessão + dispara evento `auth-change`         |

O hook `useAuth()` (em `src/lib/use-auth.ts`) escuta `auth-change` e o
evento nativo `storage` para re-renderizar componentes quando a sessão muda
(login, logout, ou logout em outra aba).

### Autorização por papel

Itens da `Sidebar` e rotas como `/admin/users` chamam
`hasAnyRole(["ROLE_ADMIN"])` para esconder/permitir acesso. Note que o
gate é **client-side apenas** — a fonte de verdade é o backend, que rejeita
requests sem o papel adequado com `403`.

---

## Proxy de API (`/api/proxy/*`)

`src/routes/api.proxy.$.ts` é uma server route catch-all que reescreve
qualquer chamada `/api/proxy/<path>` para `${VITE_API_BASE_URL}/<path>` no
servidor. Razões:

1. **CORS** — o backend Spring local raramente expõe os headers corretos.
2. **Mixed content** — preview Lovable é HTTPS; backend dev é HTTP.
3. **Mesmo origin** — cookies e devtools funcionam de forma previsível.

O proxy preserva method, headers (exceto `host`/`origin`/`referer`), body e
status code. Responde `OPTIONS` com CORS permissivo para preflight.

---

## Design system e responsividade

- **Bootstrap 5** fornece grid e utilitários (`d-flex`, `container-fluid`).
- **CSS Modules** (`*.module.css`) escopam estilos por componente/página.
- **Tailwind v4 + shadcn/ui** ficam disponíveis para novos componentes;
  tokens semânticos estão definidos em `src/styles.css` (oklch).
- **Mobile-first**: globais em `dscatalog-globals.css` aplicam
  `overflow-x: hidden`, `safe-area-insets` (iOS notch),
  `input { font-size: 16px }` (impede zoom automático do iOS) e
  `-webkit-tap-highlight-color: transparent`.
- **Navbar** colapsa em hambúrguer abaixo de 992px com overlay e trava de
  scroll do body.
- Páginas de auth, catálogo e detalhe usam breakpoints em 768px e 992px
  para reorganizar grid/colunas.

---

## Convenções de código

- **TypeScript estrito** (`strict: true`). Todo import precisa resolver
  para um arquivo existente; build quebra caso contrário.
- Componentes exportados por `default` em `src/components/<Nome>/index.tsx`
  e reexportados em `src/components/index.ts` para imports curtos.
- Tipos de domínio em `src/lib/types.ts` (compartilhados front-API).
- Não edite `src/routeTree.gen.ts`, `src/components/ui/*` (shadcn) sem
  necessidade — são artefatos gerados/padrão.
- Lint + format: `eslint` + `prettier` (config em `eslint.config.js`).

---

## Scripts

| Script               | O que faz                                              |
| -------------------- | ------------------------------------------------------ |
| `bun run dev`        | Sobe Vite com SSR em `:8080`                           |
| `bun run build`      | Build de produção (worker bundle + SSR)                |
| `bun run build:dev`  | Build em modo `development` (usa prerender mais leve)  |
| `bun run preview`    | Serve o build para verificação local                   |
| `bun run lint`       | Roda ESLint em todo o projeto                          |
| `bun run format`     | Aplica Prettier                                        |

---

## Troubleshooting

**`Failed to fetch` ou `NetworkError` no `/catalog`**
→ Backend Spring não está rodando em `VITE_API_BASE_URL`. Suba o backend
ou ajuste a variável.

**`Unauthorized` ao chamar server function**
→ Token JWT expirou. O interceptor faz logout automático em `401`; refaça
login em `/admin/auth`.

**SSR rendering failed com tela branca em rotas com loader**
→ O loader está tentando bater no backend durante o prerender. Adicione
`ssr: false` ao `createFileRoute(...)` da rota afetada.

**Login funciona local mas falha em produção (CORS)**
→ Confirme que a chamada está indo pelo proxy (`baseURL` deve ser
`/api/proxy` quando hostname termina em `lovable.app`). Veja `isLovablePreview()`
em `src/lib/api.ts`.

**iOS faz zoom ao focar inputs**
→ Garantido por `input, textarea, select { font-size: 16px }` em
`dscatalog-globals.css`. Se criar um input customizado, não reduza para
menos de 16px no estado desfocado em mobile.

---

Construído com **TanStack Start** na Lovable.