# DS Catalog

Catálogo de produtos — front-end em **React 19 + Vite + React Router**
consumindo uma API REST Spring Boot (DSCatalog). O projeto inclui área
pública (Home + Catálogo) e área administrativa autenticada via OAuth2 com
CRUD de Produtos, Categorias e Usuários.

> Stack: **Vite 6 (SPA) · React 19 · TypeScript 5 · React Router v6 ·
> React Hook Form · Axios · Bootstrap 5 · JWT (jwt-decode)**

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
| Build             | Vite 5                                         |
| UI Framework      | React 19 + TypeScript 5                        |
| Roteamento        | React Router v6 (`react-router-dom`)           |
| Estado/Dados      | `useState` + `useEffect` + Axios               |
| Formulários       | React Hook Form                                |
| HTTP              | Axios + query-string                           |
| Estilo            | Bootstrap 5 + CSS Modules                      |
| Auth              | JWT (Bearer) + `jwt-decode` + localStorage     |
| Alertas           | SweetAlert2 (via `utils/alerts.ts`)            |
| Runtime           | Node.js ≥ 20.10.0                              |

---

## Estrutura de pastas

```text
src/
├── api/                        # Camada HTTP (axios + chamadas cruas)
│   ├── axios.ts                # Instância única + interceptors (Bearer / 401)
│   ├── auth-api.ts             # POST /oauth2/token (Basic Auth client_id/secret)
│   ├── account-api.ts          # /api/v1/accounts (register/activate/resend)
│   ├── user-api.ts             # /api/v1/users (CRUD + activate/deactivate)
│   ├── product-api.ts          # /products (CRUD)
│   └── category-api.ts         # /categories (CRUD)
├── assets/                     # SVGs e imagens estáticas
├── components/
│   ├── ButtonIcon/             # Botão azul com seta (CTA)
│   ├── Navbar/                 # Top bar com hambúrguer mobile
│   ├── NavbarLink/             # Link com estado ativo
│   ├── ProductItem/            # Card de produto (catálogo)
│   ├── ProductItemAdmin/       # Card de produto (admin)
│   ├── ProductPrice/           # Renderização R$ X.XXX,XX
│   ├── PasswordInput/          # Input de senha com botão olho (mostrar/ocultar)
│   ├── Sidebar/                # Nav lateral do /admin
│   ├── shared/                 # Componentes genéricos reutilizáveis
│   └── index.ts                # Barrel de exports
├── contexts/
│   └── AuthContext.tsx         # Estado global de sessão + login/logout
├── hooks/
│   ├── useAuth.ts              # Consome AuthContext
│   ├── useRoles.ts             # hasRole / isAdmin / isOperator
│   └── usePagination.ts        # Estado de paginação para Spring Page
├── layouts/
│   ├── AdminLayout.tsx         # Navbar + Sidebar + <Outlet />
│   ├── AuthLayout.tsx          # Hero lateral + <Outlet />
│   └── CatalogLayout.tsx       # Navbar + <Outlet />
├── pages/
│   ├── HomePage.tsx            # /
│   ├── auth/
│   │   ├── LoginPage.tsx       # /auth/login
│   │   ├── RegisterPage.tsx    # /auth/register
│   │   ├── RecoverPage.tsx     # /auth/recover
│   │   ├── ActivationPendingPage.tsx  # /auth/activation-pending
│   │   ├── ActivateAccountPage.tsx    # /activate-account?token=...
│   │   └── ResetPasswordPage.tsx      # /reset-password?token=...
│   ├── admin/
│   │   ├── DashboardPage.tsx   # /admin
│   │   ├── users/
│   │   │   ├── UserListPage.tsx
│   │   │   ├── UserForm.tsx
│   │   │   └── UserDetailsPage.tsx
│   │   ├── products/
│   │   │   ├── ProductListPage.tsx
│   │   │   └── ProductForm.tsx
│   │   └── categories/
│   │       ├── CategoryListPage.tsx
│   │       └── CategoryForm.tsx
│   └── catalog/
│       ├── CatalogPage.tsx
│       └── ProductDetailsPage.tsx
├── routes/
│   ├── AppRoutes.tsx           # Mapa de rotas (BrowserRouter usado no App)
│   ├── PrivateRoute.tsx        # Guard de autenticação
│   ├── AdminRoute.tsx          # Guard ROLE_ADMIN
│   └── OperatorRoute.tsx       # Guard ROLE_OPERATOR (ou superior)
├── services/                   # Regras de negócio / orquestração
│   ├── auth-service.ts         # login / logout / isAuthenticated / getCurrentUser
│   ├── user-service.ts
│   ├── product-service.ts
│   └── category-service.ts
├── types/
│   ├── auth.ts                 # Role, LoginRequest/Response, AccessToken
│   ├── user.ts                 # User, UserCreate/Update/Register
│   ├── product.ts              # Product, ProductRequest, SpringPage<T>
│   ├── category.ts
│   └── index.ts                # Barrel
├── utils/
│   ├── constants.ts            # API_BASE_URL, CLIENT_ID/SECRET, ENDPOINTS
│   ├── storage.ts              # get/save/removeAuthData (localStorage)
│   └── permissions.ts          # decodeToken / isTokenValid / hasAnyRole
├── styles/
│   ├── pages/                  # CSS Modules por página
│   └── globals.css             # Bootstrap + tokens + estilos globais
├── App.tsx                     # Providers (BrowserRouter + AuthProvider) + AppRoutes
└── main.tsx                    # Entry point (createRoot)
```

> **Convenção de paths:** todo import usa o alias `@/*` (mapeado para
> `src/*`). Ex.: `import { http } from "@/api/axios"`,
> `import { useAuth } from "@/hooks/useAuth"`,
> `import type { Product } from "@/types"`.

### Camadas

- **api/** — chamadas HTTP cruas. Sem lógica de UI ou estado. Toda
  requisição autenticada usa `http` (Axios) de `api/axios.ts`, que injeta
  `Authorization: Bearer` e desloga em `401`.
- **services/** — fachada para componentes. Hoje encapsulam as `api/*` e
  podem agregar regras (cache, validação, composição de endpoints).
- **contexts/** — estado global (apenas auth por enquanto).
- **hooks/** — leitura do contexto + utilitários reativos.
- **routes/** — `AppRoutes` declara o mapa; `Private/Admin/OperatorRoute`
  são guards baseados em `useAuth` + `useRoles`.
- **layouts/** — wrappers visuais reutilizados por grupos de rotas.
- **pages/** — componentes de página; consomem `services` + `hooks`.
- **types/** — contratos do backend (`SpringPage<T>`, `User`, `Product`…).
- **utils/** — helpers puros (constants, storage, permissions).

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

Todas as rotas são declaradas explicitamente em `src/pages/_app.tsx` com
`<BrowserRouter>`, `<Routes>` e `<Route>`. Cada arquivo em `src/pages/`
exporta um componente `default` montado em uma rota específica.

| Caminho                       | Componente                                          |
| ----------------------------- | --------------------------------------------------- |
| `/`                           | `pages/HomePage.tsx`                                |
| `/catalog`                    | `pages/catalog/CatalogPage.tsx`                     |
| `/catalog/:productId`         | `pages/catalog/ProductDetailsPage.tsx`              |
| `/auth/login`                 | `pages/auth/LoginPage.tsx`                          |
| `/auth/register`              | `pages/auth/RegisterPage.tsx`                       |
| `/auth/recover`               | `pages/auth/RecoverPage.tsx`                        |
| `/auth/activation-pending`    | `pages/auth/ActivationPendingPage.tsx`              |
| `/activate-account?token=`    | `pages/auth/ActivateAccountPage.tsx`                |
| `/forgot-password`            | `pages/auth/RecoverPage.tsx` (alias de `/auth/recover`) |
| `/reset-password?token=`      | `pages/auth/ResetPasswordPage.tsx`                  |
| `/auth/reset-password?token=` | `pages/auth/ResetPasswordPage.tsx`                  |
| `/admin`                      | `pages/admin/DashboardPage.tsx`                     |
| `/admin/products`             | `pages/admin/products/ProductListPage.tsx`          |
| `/admin/products/new`         | `pages/admin/products/ProductForm.tsx` (`mode=create`) |
| `/admin/products/:id`         | `pages/admin/products/ProductForm.tsx` (`mode=edit`) |
| `/admin/categories`           | `pages/admin/categories/CategoryListPage.tsx`       |
| `/admin/categories/new`       | `pages/admin/categories/CategoryForm.tsx`           |
| `/admin/categories/:id`       | `pages/admin/categories/CategoryForm.tsx`           |
| `/admin/users` (ADMIN)        | `pages/admin/users/UserListPage.tsx`                |
| `/admin/users/new` (ADMIN)    | `pages/admin/users/UserForm.tsx`                    |
| `/admin/users/:id` (ADMIN)    | `pages/admin/users/UserDetailsPage.tsx`             |
| `/admin/users/:id/edit` (ADMIN) | `pages/admin/users/UserForm.tsx`                  |

> As rotas legadas (`/admin/auth`, `/admin/register`, `/admin/recover`)
> permanecem e fazem `Navigate` para os novos paths em `/auth/*`.

### Boundary de autenticação

`routes/AppRoutes.tsx` envolve toda a árvore `/admin/*` com
`<PrivateRoute />`. O guard consulta `useAuth()` (que lê o contexto
`AuthProvider`) e, se não autenticado, redireciona para `/auth/login`
preservando a rota original em `location.state.from`. Dentro do bloco
protegido, `<AdminRoute />` adiciona o gate `ROLE_ADMIN` para
`/admin/users/*`. O layout `AdminLayout` renderiza `<Navbar />` +
`<Sidebar />` + `<Outlet />`.

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

A instância `http` (em `src/api/axios.ts`):

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

O `access_token` é um JWT. As responsabilidades estão distribuídas:

| Módulo                          | Responsabilidade                                                 |
| ------------------------------- | ---------------------------------------------------------------- |
| `utils/storage.ts`              | `get/save/removeAuthData` em `localStorage["authData"]`          |
| `utils/permissions.ts`          | `decodeToken`, `isTokenValid`, `hasAnyRole`, `isAdmin/isOperator`|
| `utils/alerts.ts`               | Wrapper SweetAlert2 (success/error/warning/info/confirm/loading) |
| `api/auth-api.ts`               | `requestToken()` → POST `/oauth2/token` (Basic Auth)             |
| `api/account-api.ts`            | `register / activate / resendActivation` (`/api/v1/accounts/*`)  |
| `services/auth-service.ts`      | `login / logout / isAuthenticated / getCurrentUser`              |
| `services/account-service.ts`   | Re-exporta `accountApi` para uso nas páginas de cadastro/ativação|
| `contexts/AuthContext.tsx`      | Estado global reativo (`auth-change` + `storage`)                |
| `hooks/useAuth.ts`              | Acesso ao contexto                                               |
| `hooks/useRoles.ts`             | `isAdmin / isOperator / hasRole`                                 |

O `AuthProvider` (em `src/contexts/AuthContext.tsx`) escuta `auth-change`
e `storage` para re-renderizar a árvore quando a sessão muda (login,
logout ou logout em outra aba).

### Autorização por papel

A `Sidebar` usa `useRoles()` para esconder o item "Usuários" para quem não
for `ROLE_ADMIN`. A rota `/admin/users/*` é protegida por
`<AdminRoute />`. Note que o gate é **client-side apenas** — a fonte de
verdade é o backend, que rejeita requests sem o papel adequado com `403`.

### Cadastro, ativação por e-mail e login

Fluxo completo do novo usuário (Fases 3 a 6 do plano de integração):

1. **Cadastro** (`/auth/register`) — `RegisterPage` valida o formulário
   com `react-hook-form` e chama `accountService.register()` →
   `POST /api/v1/accounts/register`. Erros de validação retornados pelo
   backend (`{ errors: [{ fieldName, message }] }`) são distribuídos nos
   campos via `setError`. Em caso de sucesso o e-mail é salvo em
   `localStorage["pendingActivationEmail"]` e o usuário é redirecionado.
2. **Aguardando ativação** (`/auth/activation-pending`) —
   `ActivationPendingPage` mostra o e-mail utilizado e oferece o botão
   **Reenviar e-mail** (`POST /api/v1/accounts/resend-activation`).
3. **Ativação** (`/activate-account?token=UUID`) —
   `ActivateAccountPage` lê o `token` da query string, chama
   `GET /api/v1/accounts/activate?token=...`, exibe SweetAlert de
   sucesso e redireciona para o login. Se o token for inválido, exibe
   erro e permite solicitar um novo e-mail.
4. **Login OAuth2** (`/auth/login`) — `LoginPage` chama
   `authService.login()` que envia `POST /oauth2/token` com Basic Auth
   (`CLIENT_ID:CLIENT_SECRET`) e `grant_type=password`. O `access_token`
   (JWT) é decodificado com `jwt-decode` para extrair `username` e
   `authorities`, e gravado em `localStorage["authData"]`. O
   `AuthProvider` propaga o estado para a aplicação inteira.

Todos os feedbacks visuais (sucesso, erro, aviso, loading) passam pelo
wrapper `utils/alerts.ts` — nenhuma página chama `Swal.fire` diretamente.

### Recuperação e redefinição de senha

Fluxo das Fases 6 e 7 do plano de integração:

1. **Esqueci a senha** (`/auth/recover` ou `/forgot-password`) —
   `RecoverPage` chama `accountService.requestPasswordRecovery(email)` →
   `POST /api/v1/accounts/password-recovery`. Em caso de sucesso exibe um
   SweetAlert e redireciona para `/auth/login`.
2. **Redefinir senha** (`/reset-password?token=UUID` ou
   `/auth/reset-password?token=UUID`) — `ResetPasswordPage` lê o token
   da URL, valida `password === confirmPassword` no frontend e chama
   `accountService.resetPassword(token, password)` →
   `POST /api/v1/accounts/reset-password`. Após sucesso o usuário é
   levado para `/auth/login`.

### Endpoints integrados

| Domínio    | Endpoint                                  | Service                                  |
| ---------- | ----------------------------------------- | ---------------------------------------- |
| Auth       | `POST /oauth2/token`                      | `authService.login`                      |
| Contas     | `POST /api/v1/accounts/register`          | `accountService.register`                |
| Contas     | `GET  /api/v1/accounts/activate?token=`   | `accountService.activate`                |
| Contas     | `POST /api/v1/accounts/resend-activation` | `accountService.resendActivation`        |
| Contas     | `POST /api/v1/accounts/password-recovery` | `accountService.requestPasswordRecovery` |
| Contas     | `POST /api/v1/accounts/reset-password`    | `accountService.resetPassword`           |
| Usuários   | `GET /api/v1/users`                       | `userService.findAll`                    |
| Usuários   | `GET /api/v1/users/{id}`                  | `userService.findById`                   |
| Usuários   | `POST /api/v1/users`                      | `userService.create`                     |
| Usuários   | `PUT /api/v1/users/{id}`                  | `userService.update`                     |
| Usuários   | `PATCH /api/v1/users/{id}/activate`       | `userService.activate`                   |
| Usuários   | `PATCH /api/v1/users/{id}/deactivate`     | `userService.deactivate`                 |
| Usuários   | `DELETE /api/v1/users/{id}`               | `userService.delete`                     |
| Produtos   | `GET/POST/PUT/DELETE /products`           | `productService.*`                       |
| Categorias | `GET/POST/PUT/DELETE /categories`         | `categoryService.*`                      |

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
- **Tokens** e overrides de Bootstrap ficam em `src/styles/globals.css`
  (variáveis CSS como `--dscatalog-primary`).
- **Mobile-first**: globais em `globals.css` aplicam
  `overflow-x: hidden`, `safe-area-insets` (iOS notch),
  `input { font-size: 16px }` (impede zoom automático do iOS) e
  `-webkit-tap-highlight-color: transparent`.
- **Navbar** colapsa em hambúrguer abaixo de 992px com overlay e trava de
  scroll do body.
- Páginas de auth, catálogo e detalhe usam breakpoints em 768px e 992px
  para reorganizar grid/colunas.
- **Inputs de senha** (`<PasswordInput />`) renderizam um botão de olho
  fixo à direita que alterna entre `type="password"` e `type="text"` para
  permitir ao usuário visualizar a senha digitada. Compatível com
  `react-hook-form` (`forwardRef` + spread de `register`). Usado em
  `LoginPage`, `RegisterPage`, `ResetPasswordPage` e `admin/users/UserForm`.
- **Mobile (Android/iOS)**: `index.html` define
  `viewport-fit=cover`, `theme-color`, `apple-mobile-web-app-capable` e
  `mobile-web-app-capable`, permitindo instalação na tela inicial com
  status bar consistente. `globals.css` aplica `safe-area-insets` no body,
  `input { font-size: 16px }` para evitar o zoom automático do iOS e
  `-webkit-tap-highlight-color: transparent` para um feedback de toque
  mais nativo.

---

## Convenções de código

- **TypeScript estrito** (`strict: true`). Todo import precisa resolver
  para um arquivo existente; build quebra caso contrário.
- Componentes exportados por `default` em `src/components/<Nome>/index.tsx`
  e reexportados em `src/components/index.ts` para imports curtos.
- Tipos de domínio em `src/types/*.ts` (re-exportados por `src/types/index.ts`).
- Camadas com responsabilidade única: `api → services → pages`,
  `contexts → hooks → componentes`.
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
→ Token JWT expirou. O interceptor em `src/api/axios.ts` faz logout
automático em `401` e redireciona para `/auth/login`.

**Login funciona local mas falha em produção (CORS)**
→ Confirme que a chamada está indo pelo proxy (`baseURL` deve ser
`/api/proxy` quando hostname termina em `lovable.app`). Veja
`isLovablePreview()` em `src/api/axios.ts`.

**iOS faz zoom ao focar inputs**
→ Garantido por `input, textarea, select { font-size: 16px }` em
`src/styles/globals.css`. Se criar um input customizado, não reduza para menos de
16px no estado desfocado em mobile.

---

Construído na Lovable com **React + Vite**.