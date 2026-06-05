# DS Catalog

Catálogo de produtos — front-end em **React 19 + Vite + React Router**
consumindo uma API REST Spring Boot (DSCatalog). O projeto inclui área
pública (Home + Catálogo) e área administrativa autenticada via OAuth2 com
CRUD de Produtos, Categorias e Usuários.

> Stack: **Vite 6 (SPA) · React 19 · TypeScript 5 · React Router v6 ·
> React Hook Form · Axios · Bootstrap 5 + Tailwind v4 · shadcn/ui ·
> JWT (jwt-decode) · Zod**

---

## Sumário

1. [Visão geral](#visão-geral)
2. [Stack e dependências](#stack-e-dependências)
3. [Estrutura de pastas](#estrutura-de-pastas)
4. [Como rodar localmente](#como-rodar-localmente)
5. [Variáveis de ambiente](#variáveis-de-ambiente)
6. [Roteamento (React Router)](#roteamento-react-router)
7. [Camada de dados e API](#camada-de-dados-e-api)
8. [Autenticação e autorização](#autenticação-e-autorização)
9. [Proxy de API (dev)](#proxy-de-api-dev)
10. [Design system e responsividade](#design-system-e-responsividade)
11. [Convenções de código](#convenções-de-código)
12. [Scripts](#scripts)
13. [Troubleshooting](#troubleshooting)

---

## Visão geral

O DS Catalog é um SPA que serve dois públicos:

- **Área pública** (`/`, `/catalog`, `/catalog/product/:id`) — qualquer
  visitante pode navegar pelo catálogo, filtrar produtos e ver detalhes.
- **Área administrativa** (`/admin/*`) — protegida por autenticação JWT.
  Operadores fazem CRUD de produtos/categorias; administradores gerenciam
  usuários.

O front consome a API Spring Boot do projeto **DSCatalog** (endpoints
`/oauth2/token`, `/products`, `/categories`, `/users`). Em desenvolvimento,
o Vite faz proxy de `/api/proxy/*` para o backend local, contornando CORS.

---

## Stack e dependências

| Camada            | Tecnologia                                     |
| ----------------- | ---------------------------------------------- |
| Build             | Vite 6                                         |
| UI Framework      | React 19 + TypeScript 5                        |
| Roteamento        | React Router v6 (`react-router-dom`)           |
| Estado/Dados      | `useState` + `useEffect` + Axios               |
| Formulários       | React Hook Form + Zod                          |
| HTTP              | Axios + query-string                           |
| Estilo            | Bootstrap 5 + Tailwind v4 + CSS Modules        |
| Componentes       | shadcn/ui (Radix) + ícones lucide-react        |
| Auth              | JWT (Bearer) + `jwt-decode` + localStorage     |
| Runtime           | Node.js ≥ 20.10.0                              |

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
├── routes/                     # Componentes de página (registrados em App.tsx)
│   ├── index.tsx               # /
│   ├── catalog.index.tsx       # /catalog
│   ├── catalog.product.$product.tsx   # /catalog/product/:product
│   ├── admin.auth.tsx          # /admin/auth (login)
│   ├── admin.register.tsx      # /admin/register
│   ├── admin.recover.tsx       # /admin/recover
│   └── _authenticated/
│       ├── admin.products.tsx       # /admin/products
│       ├── admin.products.new.tsx   # /admin/products/new
│       ├── admin.products.$id.tsx   # /admin/products/:id
│       ├── admin.categories.tsx     # /admin/categories
│       └── admin.users.tsx          # /admin/users (ROLE_ADMIN)
├── styles/
│   └── pages/                  # CSS Modules por página
├── App.tsx                     # BrowserRouter + Routes + ProtectedRoute
├── main.tsx                    # Entry point (createRoot)
└── styles.css                  # Tailwind v4 + Bootstrap + tokens globais
```

---

## Como rodar localmente

Pré-requisitos: **Node.js ≥ 20.10.0** e **npm** (o `engine-strict=true` em
`.npmrc` bloqueia versões inferiores). Use `nvm use` para alinhar com o
`.nvmrc`.

```bash
# 1. Instalar dependências
npm install

# 2. Variáveis de ambiente (opcional; ver seção abaixo)
cp .env.example .env.local   # se existir

# 3. Dev server (Vite)
npm run dev                  # http://localhost:5173

# 4. Build de produção
npm run build
npm run preview              # serve o build localmente
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

> Todas as variáveis usam o prefixo `VITE_*` e são embutidas no bundle
> client-side. **Não coloque secrets reais** — para isso, use um backend.

---

## Roteamento (React Router)

Todas as rotas são declaradas explicitamente em `src/App.tsx` com
`<BrowserRouter>`, `<Routes>` e `<Route>`. Cada arquivo em `src/routes/`
exporta um componente `default` que é montado em uma rota específica.

| Caminho                       | Componente                                          |
| ----------------------------- | --------------------------------------------------- |
| `/`                           | `routes/index.tsx`                                  |
| `/catalog`                    | `routes/catalog.index.tsx`                          |
| `/catalog/product/:product`   | `routes/catalog.product.$product.tsx`               |
| `/admin/auth`                 | `routes/admin.auth.tsx`                             |
| `/admin/register`             | `routes/admin.register.tsx`                         |
| `/admin/recover`              | `routes/admin.recover.tsx`                          |
| `/admin/products`             | `routes/_authenticated/admin.products.tsx`          |
| `/admin/products/new`         | `routes/_authenticated/admin.products.new.tsx`      |
| `/admin/products/:id`         | `routes/_authenticated/admin.products.$id.tsx`      |
| `/admin/categories`           | `routes/_authenticated/admin.categories.tsx`        |
| `/admin/users`                | `routes/_authenticated/admin.users.tsx`             |

### Boundary de autenticação

`App.tsx` define um componente `ProtectedRoute` que envolve toda a árvore
`/admin/*` (exceto auth/register/recover). Ele chama `isAuthenticated()`
(verifica JWT no localStorage + `exp`) e, se falso, redireciona para
`/admin/auth` via `<Navigate to="/admin/auth" replace />`. O layout
`AdminLayout` então renderiza `<Sidebar />` + `<Outlet />`.

---

## Camada de dados e API

Padrão simples com **Axios + hooks nativos do React**. Cada página gerencia
o ciclo `loading / data / error` via `useState` + `useEffect`:

```ts
const [data, setData] = useState<ProductsPage | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  api
    .get<ProductsPage>("/products", { params: { page: 0, size: 12 } })
    .then((res) => setData(res.data))
    .catch((err: Error) => setError(err.message))
    .finally(() => setLoading(false));
}, []);
```

A instância `api` (em `src/lib/api.ts`):

- Usa `baseURL = '/api/proxy'` em preview Lovable (`*.lovable.app`) e em
  dev local (o Vite faz proxy para `VITE_API_BASE_URL`).
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

## Proxy de API (dev)

`vite.config.ts` declara um proxy de desenvolvimento:

```ts
server: {
  proxy: {
    "/api/proxy": {
      target: "http://localhost:8080",
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/api\/proxy/, ""),
    },
  },
}
```

Isso evita problemas de **CORS** e **mixed-content** (HTTPS → HTTP local).
Em produção/SPA estático, a chamada vai direto para `VITE_API_BASE_URL`.

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
- Não edite `src/components/ui/*` (shadcn) sem necessidade — são artefatos
  padrão.
- Alias `@/*` aponta para `src/*` (configurado em `vite.config.ts` e
  `tsconfig.json`).
- Lint + format: `eslint` + `prettier` (config em `eslint.config.js`).

---

## Scripts

| Script              | O que faz                                                  |
| ------------------- | ---------------------------------------------------------- |
| `npm run check-node`| Valida que o Node em uso é ≥ 20.10.0                       |
| `npm run dev`       | Roda `check-node` e sobe o Vite dev server                 |
| `npm run build`     | Build de produção (SPA estático em `dist/`)                |
| `npm run build:dev` | Build em modo `development`                                |
| `npm run preview`   | Serve o build localmente                                   |
| `npm run lint`      | Roda ESLint em todo o projeto                              |
| `npm run format`    | Aplica Prettier                                            |

---

## Troubleshooting

**`EBADENGINE` no `npm install`**
→ Sua versão do Node é menor que 20.10.0. Rode `nvm use` (lê `.nvmrc`) ou
instale Node 20.10+ e tente novamente.

**`Failed to fetch` ou `NetworkError` no `/catalog`**
→ Backend Spring não está rodando em `VITE_API_BASE_URL`. Suba o backend
ou ajuste a variável.

**`Unauthorized` (401) em chamadas autenticadas**
→ Token JWT expirou. O interceptor faz logout automático em `401`; refaça
login em `/admin/auth`.

**Login funciona local mas falha em produção (CORS)**
→ Confirme que a chamada está indo pelo proxy (`baseURL` deve ser
`/api/proxy` quando hostname termina em `lovable.app`). Veja
`isLovablePreview()` em `src/lib/api.ts`.

**iOS faz zoom ao focar inputs**
→ Garantido por `input, textarea, select { font-size: 16px }` em
`src/styles.css`. Se criar um input customizado, não reduza para menos de
16px no estado desfocado em mobile.

---

Construído na Lovable com **React + Vite**.