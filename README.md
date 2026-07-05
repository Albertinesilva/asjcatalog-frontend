# ASJ Catalog

**ASJ Catalog** é uma plataforma profissional para gestão e organização
de catálogos de produtos, com controle centralizado e administração
simplificada. O front-end é um SPA em **React 19 + Vite + React Router**
que consome uma API REST OAuth2, oferecendo uma área pública (Home e
Catálogo) e uma área autenticada (Dashboard) com CRUD de Produtos,
Categorias e Usuários.

> Stack: **Vite · React 19 · TypeScript 5 · React Router v6 ·
> React Hook Form · Axios · Bootstrap 5 · JWT (jwt-decode) · SweetAlert2**

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
9. [Proxy de API (dev)](#proxy-de-api-dev)
10. [Design tokens e responsividade](#design-tokens-e-responsividade)
11. [Convenções de código](#convenções-de-código)
12. [Scripts](#scripts)
13. [Roadmap](#roadmap)

---

## Visão geral

O ASJ Catalog atende dois públicos:

- **Área pública** (`/`, `/catalog`, `/catalog/:productId`) — qualquer
  visitante pode navegar pelo catálogo, filtrar produtos e visualizar
  os detalhes de cada item.
- **Área autenticada — Dashboard** (`/dashboard/*`) — protegida por
  autenticação JWT. Operadores gerenciam Produtos e Categorias;
  administradores também gerenciam Usuários.

O objetivo do produto é oferecer uma superfície simples e consistente
para catalogação e administração, sem incorporar comportamentos de
marketplace ou e-commerce.

---

## Stack e dependências

| Camada       | Tecnologia                                 |
| ------------ | ------------------------------------------ |
| Build        | Vite                                       |
| UI           | React 19 + TypeScript 5                    |
| Roteamento   | React Router v6                            |
| Formulários  | React Hook Form                            |
| HTTP         | Axios + query-string                       |
| Estilo       | Bootstrap 5 + CSS Modules                  |
| Auth         | JWT (Bearer) + `jwt-decode` + localStorage |
| Alertas      | SweetAlert2 (via `utils/alerts.ts`)        |
| Runtime      | Node.js ≥ 20.10.0                          |

---

## Estrutura de pastas

```text
src/
├── api/                # Camada HTTP (Axios + chamadas cruas)
├── assets/             # Imagens e ícones
├── components/         # Componentes de UI
│   └── shared/         # Componentes genéricos reutilizáveis
├── contexts/           # Estado global (AuthContext)
├── hooks/              # Hooks reativos e utilitários
├── layouts/            # AuthLayout, CatalogLayout, DashboardLayout
├── pages/
│   ├── HomePage.tsx
│   ├── auth/           # login, register, recover, reset, activation
│   ├── account/        # ProfilePage (/account/profile)
│   ├── catalog/        # Catálogo público
│   └── dashboard/      # Área autenticada (produtos, categorias, usuários)
├── routes/             # AppRoutes + guards (PrivateRoute, AdminRoute)
├── services/           # Orquestração e regras de negócio
├── styles/             # globals.css + CSS Modules por página
├── types/              # Contratos do backend
└── utils/              # Constantes, storage, permissions, alerts
```

O alias `@/*` aponta para `src/*` e é usado em todos os imports.

---

## Como rodar localmente

Pré-requisitos: **Node.js ≥ 20.10.0**.

```bash
npm install
npm run dev       # Vite dev server
npm run build     # build de produção
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

| Caminho                          | Página                                     |
| -------------------------------- | ------------------------------------------ |
| `/`                              | Home                                       |
| `/catalog`                       | Catálogo público                           |
| `/catalog/:productId`            | Detalhe do produto                         |
| `/auth/login`                    | Entrar                                     |
| `/auth/register`                 | Criar conta                                |
| `/auth/recover`                  | Recuperar senha                            |
| `/auth/reset-password?token=`    | Redefinir senha                            |
| `/auth/activation-pending`       | Aguardando ativação                        |
| `/activate-account?token=`       | Ativação de conta                          |
| `/dashboard`                     | Dashboard (visão geral)                    |
| `/dashboard/products`            | Lista de produtos                          |
| `/dashboard/products/new`        | Novo produto                               |
| `/dashboard/products/:id`        | Editar produto                             |
| `/dashboard/categories`          | Lista de categorias                        |
| `/dashboard/categories/new`      | Nova categoria                             |
| `/dashboard/categories/:id`      | Editar categoria                           |
| `/dashboard/users` (ADMIN)       | Lista de usuários                          |
| `/dashboard/users/new` (ADMIN)   | Novo usuário                               |
| `/dashboard/users/:id` (ADMIN)   | Detalhes do usuário                        |
| `/dashboard/users/:id/edit`      | Editar usuário (ADMIN)                     |
| `/account/profile`               | Meu Perfil                                 |

Toda a árvore `/dashboard/*` e `/account/profile` é protegida por
`<PrivateRoute />`. As rotas de usuários adicionam o gate `<AdminRoute />`.
Rotas antigas em `/admin/*` seguem apenas como redirecionamento temporário
para os novos caminhos em `/dashboard/*`.

---

## Camada de dados e API

Padrão simples com **Axios + hooks nativos do React**. Cada página
gerencia o ciclo `loading / data / error` via `useState` + `useEffect`
(ou via `usePagedQuery` nas listagens paginadas).

A instância `http` (em `src/api/axios.ts`):

- Usa `baseURL = "/api/proxy"` em preview e dev local (Vite faz proxy
  para `VITE_API_BASE_URL`).
- Interceptor de request injeta `Authorization: Bearer <access_token>`
  quando há sessão.
- Interceptor de response chama `logout()` em `401`.

---

## Autenticação e autorização

Fluxo OAuth2 **password grant**:

```text
POST /oauth2/token
Authorization: Basic base64(client_id:client_secret)
Content-Type:  application/x-www-form-urlencoded

username=...&password=...&grant_type=password

→ 200 { access_token, token_type, expires_in, scope, ... }
```

Responsabilidades distribuídas:

| Módulo                        | Responsabilidade                                                  |
| ----------------------------- | ----------------------------------------------------------------- |
| `utils/storage.ts`            | `get/save/removeAuthData` em `localStorage["authData"]`           |
| `utils/permissions.ts`        | `decodeToken`, `isTokenValid`, `hasAnyRole`, `isAdmin/isOperator` |
| `utils/alerts.ts`             | Wrapper SweetAlert2                                               |
| `api/auth-api.ts`             | `requestToken()` → POST `/oauth2/token`                           |
| `api/account-api.ts`          | `register / activate / resendActivation / recovery / reset`       |
| `services/auth-service.ts`    | `login / logout / isAuthenticated / getCurrentUser`               |
| `contexts/AuthContext.tsx`    | Estado global reativo (`auth-change` + `storage`)                 |
| `hooks/useAuth.ts`            | Acesso ao contexto                                                |
| `hooks/useRoles.ts`           | `isAdmin / isOperator / hasRole`                                  |

O `AuthProvider` escuta `auth-change` e `storage` para reagir a
login/logout — inclusive quando ocorrem em outra aba.

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
- **Login OAuth2** — `POST /oauth2/token` com Basic Auth
  (`CLIENT_ID:CLIENT_SECRET`).

O gate de papel é **client-side apenas** — a fonte de verdade é o
backend, que rejeita requests sem o papel adequado com `403`.

### Endpoints integrados

| Domínio    | Endpoint                                  |
| ---------- | ----------------------------------------- |
| Auth       | `POST /oauth2/token`                      |
| Contas     | `POST /api/v1/accounts/register`          |
| Contas     | `GET  /api/v1/accounts/activate?token=`   |
| Contas     | `POST /api/v1/accounts/resend-activation` |
| Contas     | `POST /api/v1/accounts/password-recovery` |
| Contas     | `POST /api/v1/accounts/reset-password`    |
| Usuários   | `GET/POST/PUT/DELETE /api/v1/users`       |
| Usuários   | `PATCH /api/v1/users/{id}/activate`       |
| Usuários   | `PATCH /api/v1/users/{id}/deactivate`     |
| Produtos   | `GET/POST/PUT/DELETE /products`           |
| Categorias | `GET/POST/PUT/DELETE /categories`         |

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

Isso evita problemas de **CORS** e **mixed-content** (HTTPS → HTTP).

---

## Design tokens e responsividade

- **Design tokens provisórios** vivem em `src/styles/globals.css`
  (`--asj-primary`, `--asj-secondary`, `--asj-bg-dark`, `--asj-surface`,
  `--asj-border`, `--asj-body-bg`, `--asj-body-color`). Esses tokens
  ficam congelados até a definição formal do Design System (Fase 10).
- **Bootstrap 5** fornece grid e utilitários.
- **CSS Modules** (`*.module.css`) escopam estilos por página/componente.
- Mobile-first: `safe-area-insets`, `input { font-size: 16px }`
  (evita zoom no iOS), `-webkit-tap-highlight-color: transparent`.
- **Navbar** colapsa em hambúrguer abaixo de 992px.
- **Catálogo**: barra de busca com filtro por categoria e paginação
  numerada — busca e filtro são inteiramente server-side, com debounce
  de 350ms e reset automático de página ao mudar filtros.

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

---

## Scripts

| Script            | O que faz                                    |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Sobe o Vite dev server                       |
| `npm run build`   | Build de produção (SPA estático em `dist/`)  |
| `npm run preview` | Serve o build localmente                     |
| `npm run lint`    | Roda ESLint em todo o projeto                |
| `npm run format`  | Aplica Prettier                              |

---

## Roadmap

- **Fase 10 — Design System + Tailwind**: consolidação de paleta,
  tipografia, componentes (botões, inputs, cards, badges, tabelas),
  espaçamentos, sombras, tokens e animações.
- **Fase 11+**: expansão do Dashboard com histórico de atividades,
  notificações e relatórios.
