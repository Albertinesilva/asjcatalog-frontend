[← README](../README.md) · [Anterior](INTERNATIONALIZATION.md) · [Próximo](CONVENTIONS.md)

# Utilitários e tipos

Este documento descreve as funções auxiliares de `frontend/src/utils/` e os tipos TypeScript de `frontend/src/types/`. Você vai ver o que cada utilitário faz e onde é usado, os tipos que representam os dados da aplicação e os contratos com a API, e como acrescentar um utilitário ou um tipo novo no mesmo padrão. Quando um assunto já foi detalhado em outro documento, aqui há só um resumo e o link.

## Onde fica no código

| Pasta ou arquivo | Conteúdo |
| --- | --- |
| `frontend/src/utils/` | Funções auxiliares sem componentes React (8 arquivos) |
| `frontend/src/types/` | Tipos de domínio e contratos com a API (`auth.ts`, `user.ts`, `product.ts`, `category.ts`) e o barrel `index.ts` |
| Outros arquivos `*.ts` | Tipos locais, declarados perto de quem os usa (veja [Tipos fora de `types/`](#tipos-fora-de-types)) |

## Utilitários (`utils/`)

| Arquivo | Finalidade | Usado em | Detalhes |
| --- | --- | --- | --- |
| `constants.ts` | Variáveis de ambiente, caminhos da API, chaves do `localStorage` e tempos fixos | `api/*`, `AuthContext`, `storage.ts` | [Nesta página](#constantsts) |
| `storage.ts` | Leitura e gravação no `localStorage`: sessão, e-mail pendente, tempo de espera de reenvio | `api/auth-api.ts`, `api/axios.ts`, `auth-service`, `permissions.ts`, páginas de cadastro e ativação | [Nesta página](#storagets) |
| `permissions.ts` | Decodifica o access token e verifica a expiração | `AuthContext`, `auth-service`, `api/axios.ts` | [Nesta página](#permissionsts) e [AUTHENTICATION.md](AUTHENTICATION.md#leitura-do-token-jwt-decode) |
| `alerts.ts` | Janelas de alerta (SweetAlert2) | Páginas com formulários e exclusões, `api-error-handler.ts` | [Nesta página](#alertsts) |
| `password.ts` | Regras e avaliação de senha | Componentes de senha e formulários com senha | [FORMS-AND-PASSWORD.md](FORMS-AND-PASSWORD.md#validação-de-senha) |
| `api-error.ts` | `parseApiError` e os tipos do contrato de erro | `api-error-handler.ts`, `ui-error.ts` e páginas com casos específicos | [ERROR-HANDLING.md](ERROR-HANDLING.md#o-contrato-de-erro-da-api) |
| `api-error-handler.ts` | `handleApiError` e `getApiErrorCode` | Formulários | [ERROR-HANDLING.md](ERROR-HANDLING.md#formulários-handleapierror-e-react-hook-form) |
| `ui-error.ts` | `getUiErrorMessage` e `isNotFoundError` | Páginas, `usePagedQuery`, `useResource`, `api-error-handler.ts` | [ERROR-HANDLING.md](ERROR-HANDLING.md#o-texto-mostrado-ao-usuário-getuierrormessage) |

O endereço base da API fica em `api/base-url.ts`, não em `utils/`. Veja [ENVIRONMENT-AND-SETUP.md](ENVIRONMENT-AND-SETUP.md#como-o-frontend-chega-à-api).

### `constants.ts`

Reúne valores fixos usados em vários lugares:

| Exportação | Conteúdo |
| --- | --- |
| `API_BASE_URL`, `CLIENT_ID`, `CLIENT_SECRET` | Lidos das variáveis `VITE_*`, com valor padrão quando faltam (veja [ENVIRONMENT-AND-SETUP.md](ENVIRONMENT-AND-SETUP.md#variáveis-de-ambiente)) |
| `TOKEN_KEY` | Chave da sessão no `localStorage` (`authData`) |
| `TOKEN_REFRESH_SKEW_MS` | Antecedência da renovação de sessão (60 000 ms) |
| `ENDPOINTS` | Caminhos da API |
| `PENDING_EMAIL_KEY` | Chave do e-mail pendente de ativação (`pendingActivationEmail`) |
| `RESEND_COOLDOWN_KEY`, `RESEND_COOLDOWN_MS` | Chave e duração (60 000 ms) do tempo de espera de reenvio |

`frontend/src/utils/constants.ts`

```ts
export const ENDPOINTS = {
  token: "/oauth2/token",
  users: "/api/v1/users",
  usersRegister: "/api/v1/users/register",
  products: "/api/v1/products",
  categories: "/api/v1/categories",
  accountsRegister: "/api/v1/accounts/register",
  accountsActivate: "/api/v1/accounts/activate",
  accountsResend: "/api/v1/accounts/resend-activation",
  accountsPasswordRecovery: "/api/v1/accounts/password-recovery",
  accountsResetPassword: "/api/v1/accounts/reset-password",
  accountsMe: "/api/v1/accounts/me",
  accountsMePassword: "/api/v1/accounts/me/password",
} as const;
```

O `as const` torna o objeto somente leitura e faz o TypeScript tratar cada valor como o texto exato, e não como um `string` qualquer.

As chaves do tema (`asj.theme`) e do idioma (`asj.lang`) **não** ficam aqui: estão em `contexts/theme-context.ts` e `i18n/config.ts`.

### `storage.ts`

Toda leitura e gravação no `localStorage` relacionada à sessão e à ativação de conta passa por este arquivo.

| Função | Assinatura | O que faz | Usada em |
| --- | --- | --- | --- |
| `getAuthData` | `(): LoginResponse \| null` | Lê e converte a sessão salva. Devolve `null` se não houver ou se o JSON estiver inválido | `auth-api.ts`, `axios.ts`, `auth-service`, `permissions.ts` |
| `saveAuthData` | `(data: LoginResponse): void` | Grava a sessão, apaga o e-mail pendente e dispara `auth-change` | `auth-api.ts`, `auth-service` |
| `removeAuthData` | `(): void` | Apaga a sessão e o e-mail pendente e dispara `auth-change` | `auth-service`, `axios.ts` |
| `savePendingEmail` | `(email: string): void` | Guarda o e-mail aguardando ativação | `RegisterPage`, `ActivationPendingPage` |
| `getPendingEmail` | `(): string \| null` | Lê o e-mail aguardando ativação | `ActivationPendingPage`, `ActivateAccountPage` |
| `removePendingEmail` | `(): void` | Apaga o e-mail aguardando ativação | `ActivateAccountPage` |
| `startResendCooldown` | `(ms?: number): void` | Grava o momento em que o reenvio volta a ser permitido (padrão: agora + 60 s) | `RegisterPage`, `ActivationPendingPage` |
| `getResendCooldownRemainingMs` | `(): number` | Devolve quantos milissegundos faltam (0 se já passou, apagando a chave) | `ActivationPendingPage` |

`frontend/src/utils/storage.ts`

```ts
export function getAuthData(): LoginResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse;
  } catch {
    return null;
  }
}
```

- Todas as funções começam com `if (typeof window === "undefined")`. Essa proteção só faria diferença fora do navegador (por exemplo, em testes no Node). Numa SPA, `window` sempre existe.
- O papel de `saveAuthData` e `removeAuthData` na sessão está em [AUTHENTICATION.md](AUTHENTICATION.md#onde-a-sessão-fica-guardada), e o tempo de espera de reenvio, em [FORMS-AND-PASSWORD.md](FORMS-AND-PASSWORD.md#tempo-de-espera-para-reenviar-o-e-mail-de-ativação).

### `permissions.ts`

| Função | Assinatura | O que faz |
| --- | --- | --- |
| `decodeToken` | `(): JwtPayload \| null` | Lê o access token salvo e decodifica o payload com `jwt-decode`. Devolve `null` se não houver token ou se ele for inválido |
| `isTokenValid` | `(): boolean` | `true` se o token existe e ainda não expirou (claim `exp`) |

O comentário do arquivo pede que os componentes **não** chamem essas funções diretamente: eles devem usar `useAuth` e `useRoles`. O código das duas funções e a tabela de claims estão em [AUTHENTICATION.md](AUTHENTICATION.md#leitura-do-token-jwt-decode).

### `alerts.ts`

Encapsula o SweetAlert2. Nenhuma página importa `sweetalert2` diretamente: todas usam o objeto `alerts`.

| Função | Assinatura | Usada? |
| --- | --- | --- |
| `alerts.success` | `(title: string, text?: string) => Promise<SweetAlertResult>` | Sim (mensagens de sucesso) |
| `alerts.error` | `(title: string, text?: string) => Promise<SweetAlertResult>` | Sim (erros) |
| `alerts.warning` | `(title: string, text?: string) => Promise<SweetAlertResult>` | Sim (ativação de conta) |
| `alerts.info` | `(title: string, text?: string) => Promise<SweetAlertResult>` | Não |
| `alerts.confirm` | `(title, text?, confirmText?, cancelText?) => Promise<SweetAlertResult>` | Não (o projeto usa o `ConfirmDialog`) |
| `alerts.loading` | `(title?: string, text?: string) => void` | Não |
| `alerts.close` | `() => void` | Não |

`frontend/src/utils/alerts.ts`

```ts
function fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
  return Swal.fire({
    heightAuto: false,
    showClass,
    ...options,
  });
}

export const alerts = {
  success(title: string, text?: string): Promise<SweetAlertResult> {
    return fire({
      icon: "success",
      title,
      text,
      confirmButtonText: tr("common:actions.ok", "OK"),
    });
  },
```

- Os textos dos botões vêm do i18n, no idioma ativo (`tr` usa `i18n.t` com um texto padrão).
- As funções devolvem a Promise do próprio SweetAlert2, que termina quando o usuário fecha a janela. Por isso as telas fazem `await alerts.success(...)` e só depois navegam.
- As cores vêm do CSS (veja [STYLING-AND-THEMING.md](STYLING-AND-THEMING.md#tema-do-sweetalert2)).

**Exemplo real:**

`frontend/src/pages/auth/RecoverPage.tsx`

```tsx
      await accountService.requestPasswordRecovery(data.email);
      await alerts.success(t("auth:recover.successTitle"), t("auth:recover.successMessage"));
      navigate("/auth/login");
```

### Formatação

Não há um módulo de formatação em `utils/`. O único formatador do projeto é a função `formatPrice`, interna do componente `ProductPrice`, que formata o preço no padrão brasileiro (veja [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#cuidados-e-limitações)).

## Tipos (`types/`)

O projeto declara tipos sempre com `type` (não há `interface`). Os tipos compartilhados ficam em `types/` e são importados pelo barrel:

```ts
import type { Category, Paginated, ProductResponse } from "@/types";
```

| Arquivo | Conteúdo |
| --- | --- |
| `auth.ts` | `Role`, `LoginRequest`, `LoginResponse`, `JwtPayload`, `AccessToken`, `AuthContextData` |
| `user.ts` | `UserRole`, `User`, `UserDetails` e os tipos de requisição de usuário e conta |
| `product.ts` | `ProductResponse`, `ProductRequest` e `SpringPage<T>` |
| `category.ts` | `Category`, `CategoryRequest` |
| `index.ts` | Reexporta os quatro arquivos e declara `Paginated<T>` e alguns tipos de props de componentes |

### Tipos de domínio

Representam os dados da aplicação como chegam da API.

`frontend/src/types/product.ts`

```ts
export type ProductResponse = {
  id: number;
  name: string;
  description: string;
  price: number;
  imgUrl: string;
  categories: Category[];
};
```

`frontend/src/types/user.ts`

```ts
export type UserRole = {
  id: number;
  authority: Role;
};

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  roles?: UserRole[];
};

/** Mesma entidade de `User`, com `roles` garantido (respostas detalhadas do admin). */
export type UserDetails = User & { roles: UserRole[] };
```

| Tipo | Representa |
| --- | --- |
| `ProductResponse` | Produto, com a lista de categorias |
| `Category` | Categoria (`id`, `name`) |
| `User` | Usuário. `roles` é opcional porque nem toda resposta o traz |
| `UserDetails` | Usuário com `roles` obrigatório (o `&` junta os dois tipos) |
| `UserRole` | Perfil de um usuário, com `id` e `authority` |
| `Role` | Os perfis possíveis: `"ROLE_ADMIN" \| "ROLE_OPERATOR"` |

### Contratos com a API

**Requisições** (o que o frontend envia):

| Tipo | Campos | Endpoint |
| --- | --- | --- |
| `LoginRequest` | `username`, `password` | `POST /oauth2/token` |
| `ProductRequest` | `name`, `description`, `price`, `imgUrl`, `categoryIds` | `POST` e `PUT /api/v1/products` |
| `CategoryRequest` | `name` | `POST /api/v1/categories` (o `PUT` recebe `Category`) |
| `UserRegisterRequest` | `firstName`, `lastName`, `email`, `password` | `POST /api/v1/accounts/register` |
| `UserCreateRequest` | `UserRegisterRequest` + `roleIds` | `POST /api/v1/users` |
| `UserUpdateRequest` | Todos opcionais: `firstName`, `lastName`, `email`, `password`, `roleIds` | `PUT /api/v1/users/{id}` |
| `AuthenticatedUserUpdateRequest` | `firstName`, `lastName`, `email` | `PUT /api/v1/accounts/me` |
| `AuthenticatedPasswordUpdateRequest` | `currentPassword`, `newPassword`, `confirmPassword` | `PATCH /api/v1/accounts/me/password` |

Note que a requisição **envia ids** (`categoryIds`, `roleIds`), enquanto a resposta **traz objetos** (`categories`, `roles`).

**Respostas:** os tipos de domínio acima, mais `LoginResponse` (estrutura em [AUTHENTICATION.md](AUTHENTICATION.md#onde-a-sessão-fica-guardada)).

**Paginação:** `SpringPage<T>` e o apelido `Paginated<T>`, descritos em [API-AND-SERVICES.md](API-AND-SERVICES.md#respostas-paginadas-springpage).

**Erros:** os tipos do contrato de erro (`ApiErrorCode`, `ApiFieldError`, `ApiError`) ficam em `utils/api-error.ts`, não em `types/`. Veja [ERROR-HANDLING.md](ERROR-HANDLING.md#o-contrato-de-erro-da-api).

### Tipos auxiliares

| Tipo | Onde | Para que serve |
| --- | --- | --- |
| `JwtPayload` | `auth.ts` | Claims do access token (veja [AUTHENTICATION.md](AUTHENTICATION.md#leitura-do-token-jwt-decode)) |
| `AccessToken` | `auth.ts` | Apelido de `JwtPayload` "mantido para compatibilidade" (comentário no código). Usado no estado do `AuthContext` |
| `AuthContextData` | `auth.ts` | O que o `AuthContext` expõe (veja [CONTEXTS.md](CONTEXTS.md#o-que-o-contexto-expõe)) |
| `NavLinkProps` | `index.ts` | Props do `NavbarLink` |
| `ProductPriceProps` | `index.ts` | Parte das props do `ProductPrice` |
| `ProductItemProps` | `index.ts` | Apelido de `ProductResponse`, usado como props do `ProductItem` |

### Tipos fora de `types/`

Tipos usados por um único módulo ficam perto dele:

| Tipo | Arquivo |
| --- | --- |
| `ProductQueryParams`, `CategoryQueryParams` | `api/product-api.ts`, `api/category-api.ts` |
| `ProductFilters`, `CategoryFilters`, `UserFilters` | `pages/dashboard/<domínio>/types.ts` |
| `ResourceState<T>`, `PaginationState` | `hooks/useResource.ts`, `hooks/usePagination.ts` |
| `Theme`, `ResolvedTheme`, `ThemeContextData` | `contexts/theme-context.ts` |
| `SupportedLanguage` | `i18n/config.ts` |
| `ButtonVariant`, `ButtonSize`, `BadgeVariant` | `components/ui/` |
| `ShowcaseSlide` | `components/ProductShowcase/slides.ts` |
| `ApiErrorCode`, `ApiFieldError`, `ApiError`, `HandleApiErrorOptions` | `utils/api-error.ts`, `utils/api-error-handler.ts` |
| `PasswordCriterion`, `PasswordStrengthKey`, `PasswordEvaluation`, `PersonalDataContext` | `utils/password.ts` |

As props de cada componente ficam num `type Props` dentro do próprio arquivo, sem exportar.

## Como adicionar um utilitário

1. Crie o arquivo em `utils/` com nome em kebab-case (`format-date.ts`, por exemplo), ou acrescente a função a um arquivo existente do mesmo assunto.
2. Exporte **funções nomeadas** (`export function ...`). Para um grupo de funções relacionadas, siga o padrão de objeto do `alerts`.
3. Mantenha o arquivo sem componentes React. Se precisar de texto traduzido fora de componentes, use `i18n.t`, como em `ui-error.ts`.
4. Valores fixos compartilhados (caminhos, chaves de armazenamento, tempos) vão para `constants.ts`.
5. Acesso ao `localStorage` vai para `storage.ts`, com a mesma proteção `typeof window`.

## Como adicionar um tipo

1. **Tipo compartilhado** (usado por mais de um módulo ou que representa dados da API): coloque no arquivo de `types/` do domínio, ou crie um arquivo novo e acrescente `export * from "./novo"` em `types/index.ts`.
2. **Tipo de um único módulo:** declare-o no próprio arquivo, como os tipos de filtros e de estado dos hooks.
3. Use `type`, não `interface`, para seguir o padrão do projeto.
4. Para dados da API, separe a **requisição** (sufixo `Request`) da **resposta** (nome do domínio ou sufixo `Response`).
5. Importe com `import type { ... } from "@/types"`.

## Cuidados e limitações

- **Chaves de armazenamento espalhadas e com nomes diferentes:** `authData`, `pendingActivationEmail` e `activationResendAvailableAt` estão em `constants.ts`; `asj.theme` e `asj.lang` estão em `contexts/theme-context.ts` e `i18n/config.ts`, com outro padrão de nome.
- **`constants.ts` mistura assuntos:** variáveis de ambiente, endpoints, chaves de armazenamento e tempos ficam no mesmo arquivo.
- **Funções sem uso em `alerts.ts`:** `info`, `confirm`, `loading` e `close`. ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))
- **Tipos fora do lugar esperado:** `SpringPage` está em `product.ts`, embora seja genérico; os tipos de erro estão em `utils/`; e `types/index.ts` mistura tipos de dados com props de componentes. ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))
- **Dois nomes para o mesmo conceito:** `Paginated` e `SpringPage`, e `JwtPayload` e `AccessToken`. ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))
- **`categoryApi.update` usa `Category`** (com `id`), e não um tipo de requisição. ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))
- **Sem módulo de formatação:** a formatação de preço fica dentro do componente. ([#20](https://github.com/Albertinesilva/asjcatalog-frontend/issues/20))

## Veja também

- [ERROR-HANDLING.md](ERROR-HANDLING.md): `parseApiError`, `handleApiError` e `getUiErrorMessage`.
- [AUTHENTICATION.md](AUTHENTICATION.md): uso de `storage.ts` e `permissions.ts` na sessão.
- [FORMS-AND-PASSWORD.md](FORMS-AND-PASSWORD.md): `password.ts` e o tempo de espera de reenvio.
- [API-AND-SERVICES.md](API-AND-SERVICES.md): `ENDPOINTS` e tipos de paginação.
- [GLOSSARY.md](GLOSSARY.md): significado dos termos técnicos usados aqui.
