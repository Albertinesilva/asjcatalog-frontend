## Objetivo

Reorganizar o `src/` para a estrutura profissional pedida e implementar a camada de integração com o backend Spring Boot (OAuth2 Password Grant + CRUD de usuários), conforme o PDF.

## Nova estrutura de pastas

```text
src/
├── api/                # Camada HTTP (axios + chamadas cruas)
│   ├── axios.ts
│   ├── auth-api.ts
│   ├── user-api.ts
│   ├── product-api.ts
│   └── category-api.ts
├── assets/
├── components/
│   ├── ButtonIcon/
│   ├── Navbar/
│   ├── NavbarLink/
│   ├── ProductItem/
│   ├── ProductItemAdmin/
│   ├── ProductPrice/
│   ├── Sidebar/
│   └── shared/         # componentes reutilizáveis genéricos
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useRoles.ts
│   └── usePagination.ts
├── layouts/
│   ├── AdminLayout.tsx
│   ├── AuthLayout.tsx
│   └── CatalogLayout.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── RecoverPage.tsx
│   ├── admin/
│   │   ├── DashboardPage.tsx
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
│   ├── AppRoutes.tsx
│   ├── PrivateRoute.tsx
│   ├── AdminRoute.tsx
│   └── OperatorRoute.tsx
├── services/           # Regras de negócio + orquestração
│   ├── auth-service.ts
│   ├── user-service.ts
│   ├── product-service.ts
│   └── category-service.ts
├── types/
│   ├── auth.ts
│   ├── user.ts
│   ├── product.ts
│   └── category.ts
├── utils/
│   ├── storage.ts
│   ├── permissions.ts
│   └── constants.ts
├── styles/             # CSS modules e globals (mantido)
├── App.tsx
└── main.tsx
```

Pastas atuais removidas/renomeadas: `src/@types/` → `src/types/`, `src/pages/_app.tsx` → `src/App.tsx` (apenas providers), `src/utils/api.ts|auth.ts|use-auth.ts` realocados para `api/`, `services/`, `contexts/`, `hooks/`.

## Camadas e responsabilidades

- **types/**: contratos do backend (`LoginRequest`, `LoginResponse`, `AccessToken`, `User`, `Role`, `Product`, `Category`, `SpringPage<T>`).
- **utils/constants.ts**: `API_BASE_URL`, `CLIENT_ID`, `CLIENT_SECRET`, `TOKEN_KEY`, rotas de endpoints.
- **utils/storage.ts**: `getAuthData`, `saveAuthData`, `removeAuthData` (localStorage).
- **utils/permissions.ts**: `decodeToken`, `isTokenValid`, `hasAnyRole`.
- **api/axios.ts**: instância única `http`. Request interceptor injeta `Authorization: Bearer`. Response interceptor: em 401 limpa sessão e redireciona para `/auth/login`.
- **api/auth-api.ts**: `requestToken({username,password})` → POST `/oauth2/token` com Basic Auth (axios cru, sem interceptor).
- **api/user-api.ts**: `registerUser`, `createUser`, `updateUser`, `findUserById`, `findAllUsers(page,size)`, `activateUser`, `deactivateUser`, `deleteUser` (rotas `/api/v1/users*` do PDF).
- **api/product-api.ts** e **api/category-api.ts**: CRUD `/products` e `/categories`.
- **services/auth-service.ts**: `login`, `logout`, `getCurrentUser`, `isAuthenticated` (consome `auth-api` + `storage` + `permissions`).
- **services/user-service.ts / product-service.ts / category-service.ts**: orquestram chamadas das `api/*` e expõem para as páginas.
- **contexts/AuthContext.tsx**: estado global `{ authenticated, user, roles }`, listeners de `auth-change`/`storage`, métodos `login/logout`.
- **hooks/useAuth.ts**: consome o contexto.
- **hooks/useRoles.ts**: `hasRole(role)`, `isAdmin`, `isOperator`.
- **hooks/usePagination.ts**: estado de paginação (page, size, totalPages, handlers) para Spring `Page`.

## Layouts e rotas

- **layouts/AuthLayout.tsx**: split com imagem (atual `/admin/auth`).
- **layouts/AdminLayout.tsx**: `Navbar` + `Sidebar` + `<Outlet/>`.
- **layouts/CatalogLayout.tsx**: `Navbar` + `<Outlet/>`.
- **routes/PrivateRoute.tsx**: exige autenticação.
- **routes/AdminRoute.tsx**: exige `ROLE_ADMIN`.
- **routes/OperatorRoute.tsx**: exige `ROLE_OPERATOR` (ou superior).
- **routes/AppRoutes.tsx**: mapa de rotas usando os layouts e guards.

Mapa de rotas:

```text
/                          HomePage (CatalogLayout)
/catalog                   CatalogPage
/catalog/:productId        ProductDetailsPage
/auth/login                LoginPage
/auth/register             RegisterPage
/auth/recover              RecoverPage
/admin                     DashboardPage           [Private]
/admin/products            ProductListPage         [Private]
/admin/products/new        ProductForm             [Private]
/admin/products/:id        ProductForm             [Private]
/admin/categories          CategoryListPage        [Private]
/admin/categories/new|:id  CategoryForm            [Private]
/admin/users               UserListPage            [Admin]
/admin/users/new           UserForm                [Admin]
/admin/users/:id           UserDetailsPage         [Admin/Operator self]
/admin/users/:id/edit      UserForm                [Admin]
```

## Integração com backend (conforme PDF)

- Login: `POST /oauth2/token` com `grant_type=password`, Basic Auth `client_id:client_secret`. Salvar `access_token` no localStorage.
- Usuários: `POST /api/v1/users/register` (público), `GET|POST /api/v1/users`, `GET|PUT|DELETE /api/v1/users/{id}`, `PATCH /api/v1/users/{id}/activate|deactivate`.
- Produtos/Categorias: mantém endpoints atuais (`/products`, `/categories`).
- jwt-decode para `authorities` e `username`.
- Interceptor 401 → logout + redirect login.

## UI/Páginas

- `LoginPage`, `RegisterPage`, `RecoverPage`: portar conteúdo atual de `src/pages/admin/auth/*` para o novo `pages/auth/*` sob `AuthLayout`. `RegisterPage` passa a chamar `POST /api/v1/users/register` de verdade.
- `DashboardPage`: cards de atalho para Produtos/Categorias/Usuários.
- `UserListPage`: tabela com paginação (`usePagination`), botões ativar/desativar/excluir, gating por `ROLE_ADMIN`.
- `UserForm`: criação/edição (nome, email, senha, roles select múltiplo).
- `UserDetailsPage`: visualização readonly.
- `ProductListPage` / `ProductForm` / `CategoryListPage` / `CategoryForm`: portar/expandir o que já existe usando os novos services.
- `Sidebar` passa a usar `useRoles` para esconder "Usuários" para não-admins.

## App.tsx e main.tsx

- `App.tsx`: envolve `<BrowserRouter>` + `<AuthProvider>` + `<AppRoutes/>` e carrega bootstrap JS bundle.
- `main.tsx`: monta `<App/>` e importa `styles/globals.css` + `bootstrap/dist/css/bootstrap.min.css`.

## Execução

1. Criar `types/`, `utils/`, `api/`, `services/`, `contexts/`, `hooks/`, `layouts/`, `routes/`.
2. Mover componentes existentes para os novos lugares (sem mexer no visual). Atualizar imports.
3. Reescrever páginas dentro de `pages/auth`, `pages/admin/*`, `pages/catalog/*`.
4. Apagar pastas obsoletas: `src/@types/`, `src/pages/_app.tsx`, `src/pages/admin/dashboard/`, `src/utils/api.ts|auth.ts|use-auth.ts|index.ts`, `src/pages/index.tsx` (substituído por `pages/HomePage.tsx`), `src/pages/admin/auth/`, `src/pages/catalog/[product].tsx`.
5. Atualizar `vite.config.ts` se necessário (alias `@` já existe) e `README.md` com nova árvore + endpoints integrados.

## Fora de escopo

- Não implementar refresh token automático nem recuperação de senha real (backend não documentado no PDF).
- Não alterar estilos visuais — apenas reorganização + integração.
- Não criar testes automatizados nesta etapa.
