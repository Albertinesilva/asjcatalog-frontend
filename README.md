# ASJ Catalog

**ASJ Catalog** é uma plataforma profissional para gestão e organização
de catálogos de produtos, com controle centralizado e administração
simplificada. O front-end é um SPA em **React 19 + Vite + React Router**
que consome uma API REST OAuth2, oferecendo uma área pública (Home e
Catálogo) e uma área autenticada (Dashboard) com CRUD de Produtos,
Categorias e Usuários.

> Stack: **Vite · React 19 · TypeScript 5 · React Router v6 ·
> React Hook Form · Axios · Tailwind CSS 3 · i18next · JWT (jwt-decode) ·
> SweetAlert2**

---

## Sumário

1. [Visão geral](#visão-geral)
2. [Stack e dependências](#stack-e-dependências)
3. [Estrutura de pastas](#estrutura-de-pastas)
4. [Como rodar localmente](#como-rodar-localmente)
5. [Variáveis de ambiente](#variáveis-de-ambiente)
6. [Roteamento](#roteamento)
7. [Camada de dados e API](#camada-de-dados-e-api)
8. [Autenticação e autorização](#autenticação-e-autorização)
9. [Internacionalização (i18n)](#internacionalização-i18n)
10. [Validação de senha](#validação-de-senha)
11. [Tratamento de erros](#tratamento-de-erros)
12. [Proxy de API (dev)](#proxy-de-api-dev)
13. [Design System e responsividade](#design-system-e-responsividade)
14. [Convenções de código](#convenções-de-código)
15. [Scripts](#scripts)
16. [Roadmap](#roadmap)

---

## Visão geral

O ASJ Catalog atende dois públicos:

- **Área pública** (`/`, `/catalog`, `/catalog/:productId`) — qualquer
  visitante pode navegar pelo catálogo, filtrar produtos e visualizar
  os detalhes de cada item.
- **Área autenticada — Dashboard** (`/dashboard/*`) — protegida por
  autenticação JWT. Operadores gerenciam Produtos e Categorias;
  administradores também gerenciam Usuários.
- **Área autenticada — Perfil** (`/account/profile/*`) — o usuário
  autenticado gerencia seus próprios dados pessoais e segurança
  (e-mail, nome, senha) em páginas dedicadas.

O objetivo do produto é oferecer uma superfície simples e consistente
para catalogação e administração, sem incorporar comportamentos de
marketplace ou e-commerce.

---

## Stack e dependências

| Camada      | Tecnologia                                                |
| ----------- | --------------------------------------------------------- |
| Build       | Vite 5                                                    |
| UI          | React 19 + TypeScript 5                                   |
| Roteamento  | React Router v6                                           |
| Formulários | React Hook Form                                           |
| HTTP        | Axios + query-string                                      |
| Estilo      | Tailwind CSS 3 + tokens semânticos em HSL                 |
| i18n        | i18next + react-i18next + i18next-browser-languagedetector |
| Auth        | OAuth2 (Bearer) + `jwt-decode` + refresh token + localStorage |
| Alertas     | SweetAlert2 (via `utils/alerts.ts`)                       |
| Runtime     | Node.js ≥ 20.10.0                                         |

---

## Estrutura de pastas

```text
src/
├── api/                # Camada HTTP (Axios + chamadas cruas)
│   ├── axios.ts        # Instância `http` + interceptors (401 → refresh)
│   ├── auth-api.ts     # OAuth2 token + refresh (single-flight)
│   ├── account-api.ts  # Contas: register, activate, me, me/password
│   ├── base-url.ts     # Construção neutra de URL (proxy vs API real)
│   ├── product-api.ts
│   ├── category-api.ts
│   └── user-api.ts
├── assets/             # Imagens e ícones
├── components/
│   ├── forms/password/ # PasswordField, Requirements, Strength, Match
│   ├── shared/         # Skeletons, EmptyState, ErrorState, Pagination…
│   └── ui/             # Select (componente base do Design System)
├── contexts/           # AuthContext (estado global reativo)
├── hooks/              # useAuth, useRoles, usePagedQuery, useDebouncedValue…
├── i18n/               # Configuração + locales (pt-BR, en, es)
│   ├── config.ts       # i18next init + namespaces
│   ├── hooks/          # useLanguage
│   ├── http.ts         # Ponte i18n ↔ Axios (Accept-Language)
│   └── providers/      # I18nProvider + <html lang> sync
├── layouts/            # AuthLayout, CatalogLayout, DashboardLayout
├── pages/
│   ├── HomePage.tsx
│   ├── auth/           # login, register, recover, reset, activation
│   ├── account/        # ProfilePage (hub), PersonalProfilePage, SecurityProfilePage
│   ├── catalog/        # Catálogo público
│   └── dashboard/      # Produtos, Categorias, Usuários
├── routes/             # AppRoutes + guards (PrivateRoute, RoleRoute)
├── services/           # Orquestração e regras de negócio
├── styles/             # globals.css (tokens Tailwind)
├── types/              # Contratos do backend
└── utils/              # constants, storage, permissions, password, alerts, api-error
```

O alias `@/*` aponta para `src/*` e é usado em todos os imports.

---

## Como rodar localmente

Pré-requisitos: **Node.js ≥ 20.10.0**.

```bash
npm install
npm run dev       # Vite dev server
npm run build     # build de produção (SPA estático em dist/)
npm run preview   # serve o build localmente
```

O front espera a API rodando (por padrão em `http://localhost:8080`).
Ajuste `VITE_API_BASE_URL` se necessário.

---

## Variáveis de ambiente

| Variável             | Default                 | Descrição                                        |
| -------------------- | ----------------------- | ------------------------------------------------ |
| `VITE_API_BASE_URL`  | `http://localhost:8080` | URL base da API                                  |
| `VITE_CLIENT_ID`     | `myclientid`            | client_id usado no Basic Auth do `/oauth2/token` |
| `VITE_CLIENT_SECRET` | `myclientsecret`        | client_secret correspondente                     |

Todas as variáveis usam o prefixo `VITE_*` e são embutidas no bundle
client-side. **Não use secrets reais** nessas variáveis.

---

## Roteamento

Todas as rotas são declaradas em `src/routes/AppRoutes.tsx`. Rotas
principais:

| Caminho                            | Página                     | Guard         |
| ---------------------------------- | -------------------------- | ------------- |
| `/`                                | Home                       | —             |
| `/catalog`                         | Catálogo público           | —             |
| `/catalog/:productId`              | Detalhe do produto         | —             |
| `/auth/login`                      | Entrar                     | —             |
| `/auth/register`                   | Criar conta                | —             |
| `/auth/recover`                    | Recuperar senha            | —             |
| `/auth/reset-password?token=`      | Redefinir senha            | —             |
| `/auth/activation-pending`         | Aguardando ativação        | —             |
| `/activate-account?token=`        | Ativação de conta          | —             |
| `/dashboard`                       | Dashboard (visão geral)    | PrivateRoute  |
| `/dashboard/products`              | Lista de produtos          | PrivateRoute  |
| `/dashboard/products/new`          | Novo produto               | PrivateRoute  |
| `/dashboard/products/:id`          | Editar produto             | PrivateRoute  |
| `/dashboard/categories`            | Lista de categorias        | PrivateRoute  |
| `/dashboard/categories/new`        | Nova categoria             | PrivateRoute  |
| `/dashboard/categories/:id`        | Editar categoria           | PrivateRoute  |
| `/dashboard/users`                 | Lista de usuários          | RoleRoute(ADMIN) |
| `/dashboard/users/new`             | Novo usuário               | RoleRoute(ADMIN) |
| `/dashboard/users/:id`             | Detalhes do usuário        | RoleRoute(ADMIN) |
| `/dashboard/users/:id/edit`        | Editar usuário             | RoleRoute(ADMIN) |
| `/account/profile`                 | Meu Perfil (hub)           | PrivateRoute  |
| `/account/profile/personal`        | Dados pessoais             | PrivateRoute  |
| `/account/profile/security`        | Segurança (senha)          | PrivateRoute  |

Toda a árvore `/dashboard/*` e `/account/profile/*` é protegida por
`<PrivateRoute />` (guard de autenticação). As rotas de usuários
adicionam o gate `<RoleRoute roles={["ROLE_ADMIN"]} />` (guard de
autorização). Rotas legadas (`/login`, `/forgot-password`,
`/reset-password`, `/activation-pending`) redirecionam para os
caminhos canônicos em `/auth/*`.

---

## Camada de dados e API

Padrão simples com **Axios + hooks nativos do React**. Cada página
gerencia o ciclo `loading / data / error` via `useState` + `useEffect`
(ou via `usePagedQuery` nas listagens paginadas).

### Construção de URL

`src/api/base-url.ts` centraliza a lógica de URL sem conhecer
autenticação — existe para que `axios.ts` e `auth-api.ts` compartilhem
a mesma regra sem criar ciclo de importação:

- **Preview Lovable** (`*.lovable.app`): `baseURL = "/api/proxy"` (Vite
  faz proxy para `VITE_API_BASE_URL`).
- **Dev local / produção**: `baseURL = VITE_API_BASE_URL` direto.

### Instância `http` (`src/api/axios.ts`)

- **Interceptor de request**: injeta `Authorization: Bearer <access_token>`
  quando há sessão, e `Accept-Language` com o idioma ativo do i18n.
- **Interceptor de response**: em `401` com `refresh_token` disponível,
  executa `refreshSession()` (single-flight), aplica o novo token e
  faz um **retry único** da requisição original. Se o refresh falhar,
  encerra a sessão — mas só redireciona para `/auth/login` quando o
  caminho atual é privado (`isPrivatePath`). Um `401` com token válido
  (não expirado) é propagado para a tela tratar.

### Normalização de respostas

As APIs de Produtos, Categorias e Usuários normalizam respostas que
podem vir como array puro ou como `SpringPage<T>`, garantindo sempre
o contrato esperado pelo frontend.

---

## Autenticação e autorização

### Fluxo OAuth2 password grant + refresh token

```text
POST /oauth2/token
Authorization: Basic base64(client_id:client_secret)
Content-Type:  application/x-www-form-urlencoded

username=...&password=...&grant_type=password

→ 200 { access_token, refresh_token, token_type, expires_in, scope }
```

O backend utiliza **rotação de refresh token** (`reuseRefreshTokens(false)`):
cada `refresh_token` é de uso único — um novo par é emitido a cada
renovação. O frontend trata isso em `refreshSession()` com
**single-flight**: uma Promise compartilhada garante que múltiplas
origens concorrentes (401 do interceptor, timer proativo do
AuthContext, reidratação) produzam **uma única** chamada OAuth2.

### Renovação silenciosa (proactive refresh)

O `AuthContext` agenda a renovação ~60s antes do `exp` do Access Token
(`TOKEN_REFRESH_SKEW_MS = 60_000`) via `setTimeout`. Quando a aba
volta a ficar visível (`visibilitychange`) e a janela de renovação
já chegou, a renovação é disparada imediatamente. Não há polling.

### Responsabilidades distribuídas

| Módulo                     | Responsabilidade                                                       |
| -------------------------- | --------------------------------------------------------------------- |
| `utils/storage.ts`         | `get/save/removeAuthData` + cooldown de reenvio em `localStorage`     |
| `utils/permissions.ts`     | `decodeToken`, `isTokenValid` (leitura do JWT)                         |
| `utils/constants.ts`       | `ENDPOINTS`, `TOKEN_KEY`, `TOKEN_REFRESH_SKEW_MS`, cooldown constants |
| `api/auth-api.ts`          | `requestToken` + `refreshSession` (single-flight) via Axios global    |
| `api/account-api.ts`       | `me`, `updateMe`, `updatePassword`, `register`, `activate`, `reset`   |
| `api/base-url.ts`          | `getHttpBaseUrl` / `buildAuthUrl` (neutro, sem dependência cíclica)   |
| `services/auth-service.ts` | `login / logout / isAuthenticated / getCurrentUser`                   |
| `services/account-service.ts` | Ponte para ativação, recuperação, redefinição e alteração de senha  |
| `contexts/AuthContext.tsx` | Estado global reativo + renovação silenciosa + carregamento do usuário |
| `hooks/useAuth.ts`         | Acesso ao contexto                                                    |
| `hooks/useRoles.ts`        | `isAdmin / isOperator / hasRole / hasAnyRole`                         |
| `routes/route-access.ts`   | `isPrivatePath()` — fonte única de caminhos protegidos                |

O `AuthProvider` escuta `auth-change` e `storage` para reagir a
login/logout — inclusive quando ocorrem em outra aba.

### JWT e identidade

O Access Token é decodificado no cliente via `jwt-decode`. O payload
(`JwtPayload`) contém `userId` (identificador numérico), `username`
(login/e-mail) e `authorities` (roles). Esses claims alimentam
`AuthContext`, `useAuth` e `useRoles`. O `refresh_token` é opaco e
**nunca** é decodificado como JWT.

### Fluxos de conta

- **Cadastro** (`/auth/register`) → `POST /api/v1/accounts/register`,
  seguido de redirecionamento para `/auth/activation-pending`.
- **Aguardando ativação** — orienta o usuário a conferir o e-mail e
  oferece reenviar o link, com cooldown de 60s persistido em
  `localStorage`.
- **Ativação** (`/activate-account?token=`) — trata os status
  `success`, `expired`, `invalid`, `already` e `error`.
- **Recuperação/Redefinição** — `POST /api/v1/accounts/password-recovery`
  e `POST /api/v1/accounts/reset-password`.
- **Perfil — Dados pessoais** (`/account/profile/personal`) →
  `GET` e `PUT /api/v1/accounts/me`.
- **Perfil — Segurança** (`/account/profile/security`) →
  `PATCH /api/v1/accounts/me/password`.
- **Login OAuth2** — `POST /oauth2/token` com Basic Auth
  (`CLIENT_ID:CLIENT_SECRET`).

O gate de papel é **client-side apenas** — a fonte de verdade é o
backend, que rejeita requests sem o papel adequado com `403`.

### Endpoints integrados

| Domínio    | Endpoint                                     |
| ---------- | -------------------------------------------- |
| Auth       | `POST /oauth2/token`                         |
| Contas     | `POST /api/v1/accounts/register`             |
| Contas     | `GET  /api/v1/accounts/activate?token=`       |
| Contas     | `POST /api/v1/accounts/resend-activation`    |
| Contas     | `POST /api/v1/accounts/password-recovery`    |
| Contas     | `POST /api/v1/accounts/reset-password`       |
| Contas     | `GET  /api/v1/accounts/me`                    |
| Contas     | `PUT  /api/v1/accounts/me`                    |
| Contas     | `PATCH /api/v1/accounts/me/password`         |
| Usuários   | `GET/POST/PUT/DELETE /api/v1/users`           |
| Usuários   | `PATCH /api/v1/users/{id}/activate`          |
| Usuários   | `PATCH /api/v1/users/{id}/deactivate`         |
| Produtos   | `GET/POST/PUT/DELETE /api/v1/products`        |
| Categorias | `GET/POST/PUT/DELETE /api/v1/categories`      |

---

## Internacionalização (i18n)

O projeto é totalmente internacionalizado em **pt-BR** (padrão),
**en** e **es** via `i18next` + `react-i18next`.

- **Detecção**: preferência salva (`localStorage["asj.lang"]`) →
  navegador → fallback `pt-BR`.
- **Namespaces por domínio**: `common`, `navigation`, `validation`,
  `auth`, `profile`, `dashboard`, `catalog`, `products`,
  `categories`, `users`, `home`.
- **HTTP**: o idioma ativo é publicado em `getAcceptLanguageHeader()`
  e injetado como `Accept-Language` em toda requisição pelo
  interceptor Axios — páginas e services nunca configuram o header
  manualmente. O backend retorna mensagens já localizadas.
- **`<html lang>`**: `I18nProvider` sincroniza o atributo
  `document.documentElement.lang` ao idioma ativo.
- **Hook**: `useLanguage()` expõe `current`, `available`, `change` e
  `activeMeta` para o componente `LanguageSelector`.

Arquivos de tradução em `src/i18n/locales/{pt-BR,en,es}/*.json`.

---

## Validação de senha

`src/utils/password.ts` é a **fonte única de verdade** para a
experiência interativa de criação/alteração de senha, consumida por
Cadastro, Redefinição, Perfil (Segurança) e formulários de Usuário.

- **`evaluatePassword(password, context?)`**: avalia 9 critérios
  (tamanho ≥ 10, maiúscula, minúscula, número, especial, sem espaços,
  sem sequência numérica, não comum, sem dados pessoais) e retorna
  um `score` + nível de força (`veryWeak` → `strong`).
- **`buildPasswordValidation(t, getContext?)`**: regras de validação
  para React Hook Form, alinhadas com `evaluatePassword` e com os
  componentes visuais.
- **Componentes** (`src/components/forms/password/`):
  - `PasswordField` — input com toggle de visibilidade.
  - `PasswordRequirements` — checklist em tempo real com expansão
    automática em erros de API.
  - `PasswordStrength` — barra de 5 segmentos.
  - `PasswordMatch` — feedback de coincidência entre campos.

---

## Tratamento de erros

### `src/utils/api-error.ts` — parser puro

`parseApiError(err)` converte qualquer erro (AxiosError, Error,
string, unknown) em um `ApiError` normalizado e tipado. É a **única**
fonte responsável por interpretar o payload de erros do backend.
Função pura: sem efeitos colaterais, sem imports de UI.

O contrato oficial (`ApiErrorCode`) inclui: `VALIDATION_ERROR`,
`PASSWORD_UPDATE_ERROR`, `RESOURCE_NOT_FOUND`, `DATABASE_ERROR`,
`CONFLICT`, `INVALID_TOKEN`, `ACCESS_DISABLED`, `ACCESS_DENIED`,
`AUTHENTICATION_REQUIRED`, `INTERNAL_SERVER_ERROR`.

As mensagens do backend já vêm internacionalizadas via
`Accept-Language` — o frontend as exibe verbatim.

### `src/utils/api-error-handler.ts` — orquestração

`handleApiError(err, options)` decide o que fazer com o erro:
- `VALIDATION_ERROR` com `fieldErrors` → aplica erros por campo no
  React Hook Form (`setError`) com foco no primeiro campo.
- `PASSWORD_UPDATE_ERROR` → delega à tela (erro inline, sem SweetAlert).
- Demais casos → SweetAlert2 com título e mensagem i18n.
- Falhas de rede → propagadas (retorna `false`).

`getApiErrorMessage(err, fallback?)` é o atalho para fluxos sem RHF
(listagens, exclusões, dashboard).

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

Em produção (fora do preview Lovable), a instância `http` aponta
diretamente para `VITE_API_BASE_URL`, sem proxy. O módulo
`base-url.ts` encapsula essa decisão. Isso evita problemas de
**CORS** e **mixed-content** (HTTPS → HTTP).

---

## Design System e responsividade

O projeto utiliza **Tailwind CSS 3** com **tokens semânticos em HSL**
declarados em `src/styles/globals.css` e expostos via
`tailwind.config.ts`. Não há frameworks CSS de terceiros.

- **Tokens semânticos**: `--background`, `--foreground`,
  `--foreground-muted`, `--surface`, `--card`, `--primary`,
  `--accent`, `--success`, `--warning`, `--danger`, `--border`,
  `--ring`, `--input`, etc. Componentes consomem via utilitários
  Tailwind (`bg-background`, `text-foreground`, `bg-primary`, …) e
  nunca referenciam cores cruas.
- **Tipografia**: fontes `Space Grotesk` (headings) e `DM Sans`
  (body), com escala semântica (`display`, `h1`–`h3`, `title`,
  `subtitle`, `body`, `caption`).
- **Espaçamento**: escala semântica (`xs` = 4px, `sm` = 8px, `md` =
  16px, `lg` = 24px, `xl` = 32px, `2xl` = 48px, `3xl` = 64px).
- **Sombras**: `sm`, `md`, `lg`, `xl`.
- **Motion**: durações `fast` (120ms), `DEFAULT` (180ms), `slow`
  (280ms) com curvas `standard`, `entrance`, `exit`; keyframes
  `fade-in` e `scale-in`.
- **Dark mode**: scaffolding via `darkMode: "class"` (reservado para
  futuro, não ativado).
- **Plugins**: `@tailwindcss/forms`, `@tailwindcss/typography`.
- **Mobile-first**: `safe-area-insets`, `input { font-size: 16px }`
  (evita zoom no iOS), `-webkit-tap-highlight-color: transparent`.
- **Navbar** colapsa em hambúrguer abaixo de 992px.
- **Sidebar** (Dashboard): submenu "Meu Perfil" com toggle manual,
  chevron animado e sincronização de rota.
- **Catálogo**: barra de busca com filtro por categoria e paginação
  numerada — busca e filtro são inteiramente server-side, com debounce
  de 350ms e reset automático de página ao mudar filtros.
- **Skeletons**: `LoadingState`, `TableSkeleton`,
  `ProductGridSkeleton`, `ProductDetailsSkeleton`,
  `ProductFormSkeleton`, `UserFormSkeleton` — base unificada em
  `src/components/ui/Skeleton`.
- **Estados vazios/erro**: `EmptyState` e `ErrorState` padronizados
  via `state-layout.ts`.

---

## Convenções de código

- **TypeScript estrito** (`strict: true`).
- Componentes exportados como `default` em
  `src/components/<Nome>/index.tsx` e reexportados em
  `src/components/index.ts`.
- Tipos de domínio em `src/types/*.ts`.
- Camadas com responsabilidade única: `api → services → pages`,
  `contexts → hooks → componentes`.
- Alias `@/*` para `src/*` (configurado em `vite.config.ts` e
  `tsconfig.json`).
- Lint + format: `eslint` + `prettier`.
- **Architecture Freeze v2** em vigor: rotas, hooks, services, APIs,
  layouts estruturais e componentes compartilhados não são alterados
  fora das fases dedicadas.
- **Lazy loading**: áreas autenticadas e fluxo de auth são
  `lazy()`-loaded para manter o bundle inicial focado no catálogo
  público.

---

## Scripts

| Script              | O que faz                                   |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Sobe o Vite dev server                      |
| `npm run build`     | Build de produção (SPA estático em `dist/`) |
| `npm run build:dev` | Build em modo development                    |
| `npm run preview`   | Serve o build localmente                    |
| `npm run lint`      | Roda ESLint em todo o projeto               |
| `npm run format`    | Aplica Prettier                             |

---

## Roadmap

- **Dark Mode**: ativação do tema escuro já scaffolded em
  `tailwind.config.ts` (`darkMode: "class"`) e `globals.css` (`.dark`).
- **Lazy loading de locales**: os arquivos JSON de i18n são
  importados estaticamente; preparar code-splitting por idioma.
- **Expansão do Dashboard**: histórico de atividades, notificações e
  relatórios.
