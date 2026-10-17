[← README](../README.md) · [Anterior](UTILS-AND-TYPES.md) · [Próximo](TESTING.md)

# Convenções

Este documento reúne os padrões praticados no código do ASJCatalog: como nomear arquivos, pastas, componentes, funções e tipos, como organizar exports e imports, como funcionam o lint e a formatação, qual formato de mensagem de commit seguir e como as branches e os Pull Requests se organizam. No fim, há um guia passo a passo para criar uma nova tela de cadastro (CRUD), com links para os documentos que detalham cada etapa.

## Onde fica no código

| Arquivo | Papel |
| --- | --- |
| `frontend/eslint.config.js` | Regras de lint |
| `frontend/.prettierrc`, `frontend/.prettierignore` | Formatação |
| `frontend/tsconfig.json` | Regras do TypeScript e alias `@/` |
| `frontend/vite.config.ts` | Alias `@/` no build |
| `frontend/package.json` | Scripts `lint` e `format` |

## Nomenclatura

### Arquivos e pastas

| O quê | Padrão | Exemplos |
| --- | --- | --- |
| Pastas de primeiro nível em `src/` | minúsculas, em inglês | `api/`, `components/`, `hooks/`, `pages/`, `utils/` |
| Pastas de domínio em `pages/` | minúsculas, em inglês, no plural | `pages/dashboard/products/`, `categories/`, `users/` |
| Componente com pasta própria | Pasta em PascalCase + `index.tsx` | `components/Navbar/index.tsx`, `components/ui/Button/index.tsx` |
| Componente em arquivo | PascalCase + `.tsx` | `components/shared/ErrorState.tsx`, `pages/auth/LoginPage.tsx` |
| Hook | `use` + camelCase + `.ts` | `hooks/usePagedQuery.ts` |
| Módulo sem React | kebab-case + `.ts` | `api/auth-api.ts`, `utils/api-error-handler.ts`, `routes/route-access.ts` |
| Provider de contexto | PascalCase + `.tsx`, com o objeto do contexto num arquivo kebab-case ao lado | `contexts/AuthContext.tsx` + `contexts/auth-context.ts` |
| Tipos locais de um domínio | `types.ts` dentro da pasta | `pages/dashboard/products/types.ts` |
| Traduções | `locales/<idioma>/<namespace>.json` | `locales/pt-BR/products.json` |

### Telas e componentes

| O quê | Padrão | Exemplos |
| --- | --- | --- |
| Tela de rota | sufixo `Page` | `CatalogPage`, `ProductListPage`, `UserDetailsPage` |
| Formulário de criação e edição | sufixo `Form`, com a prop `mode: "create" \| "edit"` | `ProductForm`, `CategoryForm`, `UserForm` |
| Layout | sufixo `Layout` | `DashboardLayout` |
| Componentes de lista do dashboard | `<Domínio>Table`, `<Domínio>TableRow`, `<Domínio>Actions` | `ProductTable`, `ProductTableRow`, `ProductActions` |
| Estados de tela | sufixo `State` | `LoadingState`, `ErrorState`, `EmptyState`, `NotFoundState` |
| Esqueletos de carregamento | sufixo `Skeleton` | `TableSkeleton`, `ProductFormSkeleton` |

### Funções, variáveis e tipos

| O quê | Padrão | Exemplos |
| --- | --- | --- |
| Objeto de API e de service | `<domínio>Api`, `<domínio>Service` | `productApi`, `categoryService` |
| Funções de API | verbos em camelCase | `findAll`, `findPage`, `findById`, `create`, `update`, `delete` |
| Manipuladores internos de eventos | `handle` + ação, ou um verbo | `handleLogout`, `handleSelect`, `confirmDelete`, `onSubmit` |
| Props de callback | `on` + evento | `onChange`, `onDelete`, `onRetry`, `onConfirm` |
| Valores booleanos | `is`/`has` + adjetivo (com exceções) | `isLoading`, `isSubmitting`, `hasError`; exceção: `loading` no `AuthContext` |
| Constantes de módulo | UPPER_SNAKE_CASE | `TOKEN_KEY`, `ENDPOINTS`, `PASSWORD_MIN_LENGTH`, `SUPPORTED_LANGUAGES` |
| Tipos | PascalCase, sempre com `type` (não há `interface`) | `ProductResponse`, `SpringPage<T>` |
| Tipos de requisição | sufixo `Request` | `ProductRequest`, `UserCreateRequest` |
| Props de componente | `type Props` no próprio arquivo | — |
| Uniões de valores fixos | strings literais | `type Role = "ROLE_ADMIN" \| "ROLE_OPERATOR"` |
| Chaves de tradução | camelCase, aninhadas por assunto | `auth:login.title`, `products:dialogs.delete.confirm` |
| Caminhos de rota | inglês, kebab-case | `/auth/reset-password`, `/account/profile/security` |

**Idioma:** identificadores (nomes de arquivos, variáveis, funções, tipos, rotas) em **inglês**. Os comentários são, na maioria, em **português**, com alguns em inglês. Textos exibidos ao usuário ficam **sempre** nos arquivos de tradução (veja [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md)).

## Exports, barrels e imports

- **Componentes e páginas** usam `export default`. **Módulos sem React** (api, services, utils, hooks) usam exports nomeados.
- **Barrels** (`index.ts` que reexportam): `@/components`, `@/components/ui`, `@/types`, `@/i18n` e um `index.ts` em `components/` de cada domínio do dashboard. Detalhes em [COMPONENTS.md](COMPONENTS.md#convenções).
- **Alias `@/`** aponta para `frontend/src/` e é o padrão dos imports. Imports relativos aparecem dentro de uma mesma pasta (`./auth-context`, `./components`) e em poucos casos entre pastas vizinhas de `components/`.
- **Imports só de tipo** usam `import type`, como em `import type { Category } from "@/types"`.
- **Camadas:** telas chamam services, nunca a `api/` diretamente (veja [ARCHITECTURE.md](ARCHITECTURE.md#as-camadas-pages--services--api)).

## Lint e formatação

### Ferramentas

| Ferramenta | Configuração | Papel |
| --- | --- | --- |
| **ESLint** 9 (flat config) | `eslint.config.js` | Encontra erros e padrões proibidos em arquivos `.ts` e `.tsx` |
| **typescript-eslint** | Regras recomendadas | Regras específicas de TypeScript |
| **eslint-plugin-react-hooks** | Regras recomendadas | Garante as regras dos hooks (nível de cima, dependências dos efeitos) |
| **eslint-plugin-react-refresh** | `only-export-components` (aviso) | Avisa quando um arquivo de componente exporta outras coisas, o que atrapalha o Fast Refresh |
| **Prettier** 3 | `.prettierrc` | Formatação automática |
| **eslint-plugin-prettier** | Configuração recomendada | Faz as diferenças de formatação aparecerem como erros do ESLint |
| **TypeScript** | `tsconfig.json` com `strict: true` | Checagem de tipos (`npx tsc --noEmit`) |

Regras de formatação (`.prettierrc`): linhas de até 100 caracteres, ponto e vírgula, aspas duplas e vírgula no último item de listas e objetos (`trailingComma: "all"`).

Ajustes do projeto no ESLint:

- `@typescript-eslint/no-unused-vars` está **desligada**, e o `tsconfig.json` também desliga `noUnusedLocals` e `noUnusedParameters`. Variáveis e imports sem uso não geram aviso.
- Há uma regra `no-restricted-imports` que bloqueia o pacote `server-only`. O projeto não usa esse pacote, e a mensagem da regra cita um framework que o projeto também não usa. ([#17](https://github.com/Albertinesilva/asjcatalog-frontend/issues/17))
- Os padrões ignorados (`dist`, `.output`, `.vinxi`) incluem pastas que não existem no projeto. ([#17](https://github.com/Albertinesilva/asjcatalog-frontend/issues/17))

### Scripts

Rode dentro de `frontend/`:

| Comando | O que faz |
| --- | --- |
| `npm run lint` | Verifica o código. Não altera arquivos |
| `npm run lint -- --fix` | Corrige automaticamente o que for possível (inclusive formatação) |
| `npm run format` | Formata todos os arquivos com o Prettier |
| `npx tsc --noEmit` | Verifica os tipos |

No Windows, o `lint` costuma acusar erros `Delete ␍`, causados só pelo fim de linha CRLF. Veja [ENVIRONMENT-AND-SETUP.md](ENVIRONMENT-AND-SETUP.md#observações-para-windows).

A **integração contínua (CI)** roda essas verificações no GitHub: o workflow `.github/workflows/ci.yml` executa `npm ci`, `npx tsc --noEmit`, `npm run build` e `npm run lint` em cada Pull Request e em cada push para a `develop`. Se um dos passos falhar, o CI falha e o Pull Request não deve entrar. Como o runner do GitHub usa Linux e recebe os arquivos em LF, os erros `Delete ␍` do Windows não aparecem lá.

O projeto não tem verificação automática antes do commit (*pre-commit hooks*) nem arquivo `.editorconfig`. Por isso, rode o lint e a checagem de tipos na sua máquina antes do push, para não descobrir o erro só no CI.

## Mensagens de commit

Os commits seguem o padrão **Conventional Commits**, no formato:

```text
tipo(escopo): descrição
```

- **tipo**: a natureza da mudança (tabela abaixo);
- **escopo**: opcional, indica a área afetada (por exemplo, `categories`, `auth`, `i18n`, `readme`);
- **descrição**: em português, em letra minúscula, no presente e na terceira pessoa (`adiciona`, `corrige`, `remove`), sem ponto final.

| Tipo | Uso |
| --- | --- |
| `feat` | Funcionalidade nova |
| `fix` | Correção |
| `refactor` | Mudança de código sem mudar comportamento |
| `test` | Testes |
| `docs` | Documentação |
| `build` | Build e dependências |
| `ci` | Integração contínua |

Exemplos reais do histórico:

```text
docs(claude): adiciona o CLAUDE.md e define o papel do Lovable só na publicação
docs(contributing): adiciona guia de contribuição, código de conduta, licença e modelos de issue e pr
ci: adiciona workflow com checagem de tipos, build e lint na develop
```

Ao resolver uma issue, cite o número no corpo do commit ou na descrição do Pull Request (`Refs #1`).

Os commits anteriores a esse padrão estão em inglês e no imperativo (por exemplo, `fix(auth): handle invalid credentials on login`) e usam também o tipo `chore`. Eles ficam como estão no histórico; para commits novos, vale o padrão em português.

Nenhuma ferramenta impõe esse padrão: o projeto não tem verificação automática das mensagens de commit. Segui-lo depende de quem faz o commit.

## Branches e Pull Requests

| Branch | Papel | Como recebe código |
| --- | --- | --- |
| `develop` | Projeto em desenvolvimento | Pull Requests de contribuição, por **squash** (todos os commits do PR viram um só) |
| `main` | Versão publicada do site, lida pelo Lovable | Só a `develop`, por Pull Request com **merge commit** (preserva os commits e registra a junção), feito pelo mantenedor |

- **Crie a branch a partir da `develop` atualizada** e abra o Pull Request de volta para ela, nunca para a `main`.
- **Nome da branch:** `tipo/descrição-curta`. Se ela resolve uma issue, o número vem logo depois do tipo, como em `fix/1-validacao-de-email` ou `docs/atualiza-readme`.
- **Fechamento das issues:** o GitHub só fecha uma issue sozinho quando o Pull Request entra na branch padrão (`main`). Como os PRs entram na `develop`, as issues são fechadas manualmente pelo mantenedor.
- **Publicação:** a `develop` entra na `main` por Pull Request com merge commit, e o site é atualizado com **Publish → Update** no Lovable. Veja [Arquivos usados pela publicação no Lovable](ENVIRONMENT-AND-SETUP.md#arquivos-usados-pela-publicação-no-lovable).

O passo a passo completo (fork, branch, commits, Pull Request e revisão de PRs externos) está no [guia de contribuição](../CONTRIBUTING.md).

## Guia: como criar uma nova tela CRUD

**CRUD** (*Create, Read, Update, Delete*) é o conjunto de telas para criar, listar, editar e excluir um tipo de registro. Use o módulo de **categorias** como referência: ele é o mais simples e tem todas as peças.

| # | Etapa | Referência real (categorias) | Detalhes |
| --- | --- | --- | --- |
| 1 | **Tipos** do registro e da requisição | `types/category.ts` (`Category`, `CategoryRequest`) | [UTILS-AND-TYPES.md](UTILS-AND-TYPES.md#como-adicionar-um-tipo) |
| 2 | **Caminho da API** em `ENDPOINTS` | `ENDPOINTS.categories` em `utils/constants.ts` | [API-AND-SERVICES.md](API-AND-SERVICES.md#como-adicionar-um-novo-endpoint) |
| 3 | **Funções de API**: `findPage`, `findById`, `create`, `update`, `delete` | `api/category-api.ts` | [API-AND-SERVICES.md](API-AND-SERVICES.md#api-e-services-quem-faz-o-quê) |
| 4 | **Service** | `services/category-service.ts` | [API-AND-SERVICES.md](API-AND-SERVICES.md#api-e-services-quem-faz-o-quê) |
| 5 | **Tipo dos filtros** da lista | `pages/dashboard/categories/types.ts` (`CategoryFilters`) | [HOOKS.md](HOOKS.md#listagem-com-busca-e-paginação-os-três-hooks-juntos) |
| 6 | **Componentes do domínio**: tabela, linha, ações e barrel | `pages/dashboard/categories/components/` | [COMPONENTS.md](COMPONENTS.md#componentes-de-domínio-do-dashboard) |
| 7 | **Página de lista**: `SearchInput` + `useDebouncedValue` + `usePagedQuery` + `Pagination` + `ConfirmDialog` para excluir | `CategoryListPage.tsx` | [HOOKS.md](HOOKS.md#usepagedquery), [COMPONENTS.md](COMPONENTS.md#componentes-compartilhados-shared) |
| 8 | **Formulário** com `mode` (criação e edição), `useResource` e `reset` | `CategoryForm.tsx` | [FORMS-AND-PASSWORD.md](FORMS-AND-PASSWORD.md#exemplo-completo-formulário-de-categoria) |
| 9 | **Rotas** em `AppRoutes.tsx`: lista, `/new` e `/:id`, com `lazy()`, dentro de `PrivateRoute` e `DashboardLayout` | Rotas `/dashboard/categories*` | [ROUTES-AND-PAGES.md](ROUTES-AND-PAGES.md#como-adicionar-uma-nova-rota) |
| 10 | **Breadcrumb e menu**: títulos em `resolveBreadcrumb` (`DashboardLayout`) e item na `Sidebar` | Casos de `/dashboard/categories` | [ROUTES-AND-PAGES.md](ROUTES-AND-PAGES.md#layouts) |
| 11 | **Perfis**: `Authorization` nos botões (criar e editar para operador e admin; excluir só para admin) e `RoleRoute` se a tela inteira for restrita | `CategoryActions.tsx`, `CategoryListPage.tsx` | [AUTHENTICATION.md](AUTHENTICATION.md#perfis-role_admin-e-role_operator) |
| 12 | **Traduções**: namespace novo (ou chaves novas) nos **três** idiomas, inclusive breadcrumb e menu em `navigation` | `locales/*/categories.json` | [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#como-adicionar-um-namespace) |
| 13 | **Tratamento de erros**: `handleApiError` no formulário, `getUiErrorMessage` na exclusão, `ErrorState` e `NotFoundState` nos carregamentos | `CategoryForm.tsx`, `CategoryListPage.tsx` | [ERROR-HANDLING.md](ERROR-HANDLING.md#como-tratar-erros-numa-tela-nova) |
| 14 | **Esqueletos de carregamento** da lista e do formulário | `TableSkeleton`, `CategoryFormSkeleton` | [COMPONENTS.md](COMPONENTS.md#componentes-compartilhados-shared) |
| 15 | **Verificação**: `npx tsc --noEmit`, `npm run lint`, teste manual nos três idiomas, nos dois temas e com os dois perfis | — | [ENVIRONMENT-AND-SETUP.md](ENVIRONMENT-AND-SETUP.md#scripts-do-packagejson) |

Opcional: um total no dashboard (`DashboardPage`, cartão de métricas e atalho), como os de produtos e categorias.

## Cuidados e limitações

Inconsistências de padrão encontradas no código:

- **Nomes de componentes:** os de topo e de `ui/` usam `Nome/index.tsx`; os de `shared/` e `forms/password/` usam `Nome.tsx`.
- **Arquivos fora do padrão kebab-case:** `pages/auth/_ui.ts` (com sublinhado) e os nomes simples `cn.ts`, `styles.ts`, `slides.ts`, `config.ts`, `http.ts`. ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))
- **Chaves de tradução sem prefixo** apenas em `CategoryActions` (`t("actions.edit")`).
- **Três formas de importar `cn`** e duas de importar o i18n (`@/i18n` e `@/i18n/config`). ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))
- **Imports relativos entre pastas** dentro de `components/` (`../NavbarLink`, `../cn`). ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))
- **Variáveis sem uso não são apontadas**, porque as regras correspondentes estão desligadas no ESLint e no TypeScript.
- **Formulários sem sufixo `Page`:** `ProductForm`, `CategoryForm` e `UserForm` são telas de rota, mas seguem o padrão `Form`.
- **Comentários de processo** ("Fase 10.3", "Architecture Freeze") ainda aparecem no código. ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))

## Veja também

- [ARCHITECTURE.md](ARCHITECTURE.md): camadas e papel de cada pasta.
- [COMPONENTS.md](COMPONENTS.md): convenções de componentes e como criar um novo.
- [ENVIRONMENT-AND-SETUP.md](ENVIRONMENT-AND-SETUP.md): scripts e observações para Windows.
- [CONTRIBUTING.md](../CONTRIBUTING.md): como contribuir, do fork ao Pull Request.
- [TESTING.md](TESTING.md): estado dos testes e proposta de estratégia.
- [GLOSSARY.md](GLOSSARY.md): significado dos termos técnicos usados aqui.
