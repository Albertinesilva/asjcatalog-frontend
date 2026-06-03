## Contexto

Você enviou o `dscatalog` (Next.js Pages Router, migrado parcialmente de Next 13 → 15.5.19, React 19). Este workspace Lovable não suporta Next.js — roda **TanStack Start (React 19 + Vite)**. Como você pediu que eu decidisse, vou portar o projeto para TanStack Start aqui, preservando 1:1 UI, estilos, fluxos e a integração com o backend Spring Boot externo (`/oauth2/token`, `/products`, `/categories`). Isso te dá preview ao vivo e, de quebra, resolve os bugs que você relatou.

## Bugs identificados no código atual

1. **Login mostra layout incompleto após autenticar.** `pages/admin/index.tsx` faz `getServerSideProps` chamando `/api/v1/products` (URL errada — o resto do projeto usa `/products`). No SSR ele falha silenciosamente, e o `DashboardPage` recebe `products` undefined → componentes de listagem somem.
2. **401 ao clicar em Categorias/Usuários.** Essas páginas hoje são placeholders vazios (`<h3>Categorias</h3>`), mas a navegação `/admin?index=categories` re-roda o `getServerSideProps` que chama `/products` *sem* token — quando o backend exige autenticação em algum endpoint, retorna 401. Além disso, `utils/api.ts` cria um `api` axios sem interceptor de Authorization; só o helper `authenticatedRequest` injeta token, e ninguém o usa.
3. **`btoa` no servidor.** `utils/api.ts` calcula `AUTH_TOKEN = Basic ${btoa(...)}` no módulo — `btoa` não existe em Node 20 antigo / SSR, quebra o build/SSR em ambientes server-only.
4. **`jwt-decode` v3 import default.** Em Next 15 + jwt-decode v4+ o import muda para `{ jwtDecode }`. Como o lockfile fixa v3, ok, mas vou usar v4 nomeado para evitar futura quebra.
5. **Roteamento Admin acoplado.** `pages/admin/index.tsx` faz login + dashboard no mesmo componente via `useState(logged)`. Sem rota dedicada, refresh perde estado. Vou separar em rotas reais com guard.

## O que vou construir (TanStack Start)

### Rotas (`src/routes/`)
```text
__root.tsx                       layout + Navbar + QueryClient + AuthProvider
index.tsx                        Home (porta de pages/index.tsx)
catalog/index.tsx                Catálogo (loader chama /products)
catalog/product/$product.tsx     Detalhes do produto
admin/auth.tsx                   Login (form react-hook-form → POST /oauth2/token)
_authenticated/route.tsx         Guard: redireciona p/ /admin/auth se sem token
_authenticated/admin/route.tsx   Layout com Sidebar + <Outlet />
_authenticated/admin/index.tsx   Redireciona p/ /admin/products
_authenticated/admin/products.tsx     Lista + Adicionar/Editar/Excluir
_authenticated/admin/products.$id.tsx Form de edição
_authenticated/admin/products.new.tsx Form de criação
_authenticated/admin/categories.tsx   CRUD básico
_authenticated/admin/users.tsx        Lista somente
```

### Componentes & estilos
- Portar `Navbar`, `NavbarLink`, `Sidebar`, `ButtonIcon`, `ProductItem`, `ProductItemAdmin`, `ProductPrice` 1:1, trocando `next/link` → `Link` do `@tanstack/react-router`, `next/image` → `<img>` ou import direto do Vite, `next/router` → `useRouter`/`useNavigate`.
- Manter CSS Modules (Vite suporta nativo) e o `custom.scss` + `globals.css`. Adicionar `sass` como dep.
- Copiar imagens de `public/` para `src/assets/` e importar via Vite.

### Auth (substitui `utils/auth.ts`)
- Mantém OAuth2 password grant contra `${VITE_API_BASE_URL}/oauth2/token` com Basic Auth de `VITE_CLIENT_ID:VITE_CLIENT_SECRET`.
- Token salvo em `localStorage` (mesma chave `authData`) + exposto via `AuthContext` injetado no router context.
- `axios` com **interceptor** que injeta `Authorization: Bearer <token>` em toda requisição, e interceptor de resposta que desloga em 401.
- Helpers: `isAuthenticated`, `hasRole`, `logout`, `getDecodedToken` (jwt-decode).

### Data fetching
- TanStack Query já vem no template. Cada rota com dados usa `queryClient.ensureQueryData` no loader + `useSuspenseQuery` no componente. Sem `getServerSideProps`.
- Mutations (CRUD produtos/categorias) com `useMutation` + `invalidateQueries`.

### CRUD que faltava
- **Produtos**: já lista; vou adicionar criar, editar, excluir (`POST/PUT/DELETE /products`), upload do `imgUrl` como campo texto, seleção de categorias via `GET /categories`.
- **Categorias**: lista + criar/editar/excluir (`/categories`).
- **Usuários**: lista (`/users`) — só leitura por agora (você não pediu CRUD completo).

### Configuração
- Variáveis (`.env`): `VITE_API_BASE_URL`, `VITE_CLIENT_ID`, `VITE_CLIENT_SECRET`. Defaults `http://localhost:8080`, `myclientid`, `myclientsecret`.
- Deps a instalar: `axios`, `react-hook-form`, `jwt-decode`, `bootstrap`, `sass`, `query-string`.
- Importar `bootstrap/dist/css/bootstrap.min.css` + JS bundle no `__root.tsx`.

## Detalhes técnicos relevantes

- `AUTH_TOKEN` calculado *dentro* de função (lazy) usando `btoa` no browser; no servidor não é chamado.
- Loaders públicos (`/catalog`, `/catalog/product/$id`) usam axios sem token (endpoints públicos do DSCatalog).
- Loaders protegidos rodam só no client (rota dentro de `_authenticated`, cuja `beforeLoad` lê token do `localStorage` com checagem `typeof window`).
- CORS: como o backend é externo (Spring Boot em :8080), o usuário precisa garantir CORS liberado para a origem do preview Lovable. Vou documentar isso no README.

## Ordem de execução

1. Instalar dependências e estrutura base (assets, estilos, types).
2. Auth: `AuthContext`, axios client com interceptors, rota `/admin/auth`, guard `_authenticated`.
3. Layout: `Navbar`, `Sidebar`, `__root` com providers.
4. Páginas públicas: Home, Catálogo, Detalhes.
5. Admin: layout + Produtos (lista, criar, editar, excluir).
6. Admin: Categorias (CRUD) e Usuários (lista).
7. Smoke test: rodar build, verificar rotas, confirmar interceptor anexa token.

## Fora do escopo

- Não vou manter `next/` nem fazer dual-stack. O zip enviado fica como referência; o código novo vive em `src/routes/` e `src/components/`.
- Não vou subir backend; você continua usando seu Spring Boot externo.
- Reset de senha, signup, refresh token automático — não estavam no original; deixo para depois se quiser.
