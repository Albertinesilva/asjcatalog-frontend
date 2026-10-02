[← README](../README.md) · [Anterior](STYLING-AND-THEMING.md) · [Próximo](UTILS-AND-TYPES.md)

# Internacionalização (i18n)

Este documento explica como o ASJCatalog funciona em três idiomas. Você vai ver a configuração do i18next, como o idioma inicial é escolhido e salvo, como os textos são organizados em namespaces, como usá-los nos componentes (inclusive com variáveis e plural), como o idioma chega à API e o passo a passo para acrescentar textos, namespaces e idiomas sem deixar os arquivos inconsistentes.

## Onde fica no código

| Arquivo | Papel |
| --- | --- |
| `frontend/src/i18n/config.ts` | Inicializa o i18next: idiomas, namespaces, detecção e textos |
| `frontend/src/i18n/index.ts` | Reexporta a instância e as constantes de `config.ts` |
| `frontend/src/i18n/locales/<idioma>/<namespace>.json` | Os textos traduzidos |
| `frontend/src/i18n/providers/I18nProvider.tsx` | Disponibiliza o i18next ao React e mantém o `lang` do `<html>` atualizado |
| `frontend/src/i18n/hooks/useLanguage.ts` | Lê, lista e troca o idioma |
| `frontend/src/i18n/http.ts` | Monta o cabeçalho `Accept-Language` |
| `frontend/src/components/LanguageSelector/index.tsx` | Seletor de idioma da `Navbar` |

## O que é i18n e como o projeto faz

**i18n** é a abreviação de *internationalization* (internacionalização): preparar o sistema para mostrar a interface em vários idiomas. Em vez de escrever textos fixos no JSX, o código usa **chaves** (como `auth:login.title`), e cada idioma tem um arquivo com o texto de cada chave.

O projeto usa três bibliotecas:

| Biblioteca | Papel |
| --- | --- |
| `i18next` | O motor: guarda os textos, resolve as chaves, faz interpolação e plural |
| `react-i18next` | Liga o i18next ao React (`useTranslation`, `Trans`, `I18nextProvider`) e redesenha a tela quando o idioma muda |
| `i18next-browser-languagedetector` | Descobre o idioma inicial e o salva no navegador |

### Configuração

`frontend/src/i18n/config.ts`

```ts
if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
      ns: NAMESPACES as unknown as string[],
      defaultNS: "common",
      interpolation: { escapeValue: false },
      returnNull: false,
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        lookupLocalStorage: I18N_STORAGE_KEY,
        caches: ["localStorage"],
      },
      react: { useSuspense: false },
    });
}
```

| Opção | Significado |
| --- | --- |
| `resources` | Todos os textos, importados dos JSON (veja [Namespaces](#namespaces)) |
| `fallbackLng: "pt-BR"` | Idioma usado quando o detectado não é suportado ou quando falta uma chave |
| `supportedLngs` | `pt-BR`, `en` e `es` |
| `defaultNS: "common"` | Namespace usado quando a chave não indica outro |
| `interpolation.escapeValue: false` | O i18next não escapa o HTML dos valores, porque o React já faz isso ao renderizar texto |
| `react.useSuspense: false` | Os textos já estão no bundle, então não é preciso esperar carregamento com `Suspense` |
| `detection` | Ordem de detecção e onde salvar o idioma (próxima seção) |

O arquivo é importado (direta ou indiretamente) antes de qualquer tela, e o `if (!i18n.isInitialized)` impede uma segunda inicialização.

## Idiomas, detecção e persistência

`frontend/src/i18n/config.ts`

```ts
export const SUPPORTED_LANGUAGES = [
  { code: "pt-BR", label: "Português", short: "PT", flag: "🇧🇷" },
  { code: "en", label: "English", short: "EN", flag: "🇺🇸" },
  { code: "es", label: "Español", short: "ES", flag: "🇪🇸" },
] as const;
```

- **Idioma padrão e de fallback:** `pt-BR` (`DEFAULT_LANGUAGE`).
- **Detecção do idioma inicial**, nesta ordem:
  1. `localStorage`, na chave **`asj.lang`** (`I18N_STORAGE_KEY`): o idioma salvo antes;
  2. idioma do navegador (`navigator`);
  3. atributo `lang` do `<html>`, que no `index.html` é `pt-BR`.
- Se o idioma encontrado não for suportado, o i18next tenta um compatível entre os suportados e, se não houver, usa o `pt-BR`.
- **Persistência:** com `caches: ["localStorage"]`, o detector grava o idioma em `asj.lang`. A troca de idioma pela interface também fica salva, e a próxima visita começa nele.
- **`<html lang>`:** o `I18nProvider` mantém o atributo `lang` igual ao idioma ativo, o que ajuda leitores de tela e tradutores automáticos do navegador.

## Namespaces

Um **namespace** é um grupo de textos de um mesmo assunto, guardado num arquivo próprio. Cada idioma tem os mesmos 11 arquivos:

```text
frontend/src/i18n/locales/
├── pt-BR/   auth.json  catalog.json  categories.json  common.json  dashboard.json  home.json
│            navigation.json  products.json  profile.json  users.json  validation.json
├── en/      (os mesmos 11 arquivos)
└── es/      (os mesmos 11 arquivos)
```

| Namespace | Conteúdo | Usado em |
| --- | --- | --- |
| `common` | Ações (salvar, cancelar, tentar novamente…), estados (carregando, vazio, erro), contador de registros, paginação, confirmação, erros genéricos, seletor de idioma | Componentes compartilhados (`ErrorState`, `EmptyState`, `LoadingState`, `Pagination`, `SearchInput`, `TableToolbar`, `ConfirmDialog`, esqueletos, `LanguageSelector`), `utils/alerts.ts`, `utils/ui-error.ts`, `utils/api-error-handler.ts` e algumas páginas |
| `navigation` | Links do menu, tema, perfis, menu lateral, breadcrumbs, rodapé | `Navbar`, `Sidebar`, `ThemeToggle`, `DashboardLayout` |
| `validation` | Mensagens de validação de formulário e textos de senha (critérios, força, mostrar/ocultar) | Formulários, componentes de senha, `utils/password.ts` |
| `auth` | Login, cadastro, recuperação e redefinição de senha, ativação | Páginas de `pages/auth/` |
| `profile` | Perfil: dados pessoais e segurança | Páginas de `pages/account/` |
| `dashboard` | Visão geral do dashboard (métricas, atalhos, atividade) | `DashboardPage` |
| `catalog` | Catálogo público e detalhe do produto | `CatalogPage`, `ProductDetailsPage` |
| `products` | Administração de produtos | `ProductListPage`, `ProductForm`, `ProductTable`, `ProductActions` |
| `categories` | Administração de categorias | `CategoryListPage`, `CategoryForm`, `CategoryTable`, `CategoryActions` |
| `users` | Administração de usuários | `UserListPage`, `UserForm`, `UserDetailsPage`, `UserTable`, `UserActions`, `UserRoleBadge` |
| `home` | Página inicial, carrossel, texto lateral da autenticação, página 404 | `HomePage`, `ProductShowcase`, `AuthLayout`, `NotFoundPage` |

Hoje cada idioma tem 450 chaves, e os três arquivos de cada namespace têm exatamente as mesmas chaves.

## Usando os textos nos componentes

### `useTranslation` e `t`

Nos componentes, o hook `useTranslation` devolve a função `t`, que recebe a chave e devolve o texto no idioma ativo. O padrão do projeto é **escrever o namespace na chave**, no formato `namespace:caminho.da.chave`:

`frontend/src/pages/auth/LoginPage.tsx`

```tsx
        <h2 className={authFormTitle}>{t("auth:login.title")}</h2>
```

O argumento de `useTranslation` varia: muitos componentes usam `useTranslation()` (sem argumento) e outros indicam namespaces, como `useTranslation(["products"])`. Com o prefixo `namespace:` na chave, as duas formas funcionam. Sem o prefixo, a chave é procurada no namespace indicado no hook (ou em `common`, se nenhum for indicado). Só um componente usa chaves sem prefixo: `CategoryActions` chama `t("actions.edit")` com `useTranslation("categories")`.

### Interpolação (variáveis no texto)

Valores entre `{{ }}` no JSON são substituídos pelos valores passados a `t`:

`frontend/src/pages/dashboard/DashboardPage.tsx`

```tsx
        {t("dashboard:greeting", { name: greetingName })}
```

```json
"greeting": "Olá, {{name}}. Bem-vindo(a) ao painel de gestão do ASJCatalog."
```

### Plural

Quando a chamada passa `count`, o i18next escolhe a forma certa com os sufixos `_one` (um) e `_other` (vários):

`frontend/src/components/shared/TableToolbar.tsx`

```tsx
          <Badge variant="default">{t("common:table.records", { count: counter })}</Badge>
```

`frontend/src/i18n/locales/pt-BR/common.json`

```json
  "table": {
    "records_one": "{{count}} registro",
    "records_other": "{{count}} registros"
  },
```

O mesmo acontece em `auth:activationPending.cooldownHint` (tempo de espera para reenviar o e-mail). A chave `validation:maxChars` também recebe `count`, mas tem uma forma só, usada para qualquer número.

### Texto com formatação: `Trans`

Para um texto com trechos em negrito ou links, o componente `Trans` substitui marcações do JSON por componentes React. O projeto usa isso nos diálogos de exclusão:

`frontend/src/pages/dashboard/products/ProductListPage.tsx`

```tsx
              <Trans
                i18nKey="products:dialogs.delete.message"
                values={{ name: pendingDelete.name }}
                components={{ strong: <strong /> }}
              />
```

```json
"message": "Tem certeza que deseja excluir <strong>{{name}}</strong>? Esta ação não pode ser desfeita."
```

### Chaves montadas no código

Alguns textos usam chaves montadas a partir de valores:

- `` t(`navigation:theme.${theme}`) `` (`ThemeToggle`);
- `` t(`users:roles.${r.authority}`) `` (`UserForm`);
- `` t(`home:showcase.categories.${key}`) `` (`ProductShowcase`);
- `` t(`validation:password.strength.${strength}`) `` (`PasswordStrength`).

Ao procurar chaves sem uso, lembre que elas não aparecem escritas por inteiro no código.

### Fora de componentes React

Em funções comuns (fora de componentes), o código usa a instância diretamente: `i18n.t("common:errors.network")`. É o caso de `utils/alerts.ts`, `utils/ui-error.ts` e `utils/api-error-handler.ts`. Assim, o texto sai no idioma ativo no momento da chamada.

## Troca de idioma pela interface

O `LanguageSelector`, na `Navbar`, lista os idiomas com bandeira e nome e, ao escolher um, chama `change(code)` do hook `useLanguage`. O i18next troca o idioma, salva em `asj.lang`, e todos os componentes que usam `t` são redesenhados. Os detalhes do hook estão em [HOOKS.md](HOOKS.md#uselanguage) e os do componente, em [COMPONENTS.md](COMPONENTS.md#navegação).

## Integração com a API

Toda requisição da instância `http` envia o idioma ativo no cabeçalho `Accept-Language`, montado em `i18n/http.ts`:

`frontend/src/i18n/http.ts`

```ts
export function getAcceptLanguageHeader(): string {
  const active = getCurrentLanguage();
  // pt-BR aceito diretamente; en → en-US; es → es-ES para melhor casamento.
  if (active === "en") return "en-US,en;q=0.9";
  if (active === "es") return "es-ES,es;q=0.9";
  return "pt-BR,pt;q=0.9";
}
```

A API usa esse cabeçalho para devolver as mensagens de erro já traduzidas, e o frontend as exibe como chegam. O pedido de token (login) não envia o cabeçalho. Veja [API-AND-SERVICES.md](API-AND-SERVICES.md#requisição-adiciona-cabeçalhos) e [ERROR-HANDLING.md](ERROR-HANDLING.md#mensagens-quem-traduz-o-quê).

## Como adicionar uma chave

1. Escolha o namespace pelo assunto (tabela acima).
2. Acrescente a chave **no mesmo caminho** nos três arquivos: `locales/pt-BR/<ns>.json`, `locales/en/<ns>.json` e `locales/es/<ns>.json`.
3. Se o texto tiver número variável, crie as formas `_one` e `_other` nos três idiomas e passe `count` na chamada.
4. Use no código com o prefixo do namespace: `t("<ns>:caminho.da.chave")`.
5. Confira se o texto aparece nos três idiomas, trocando o idioma pelo seletor.

## Como adicionar um namespace

1. Crie `<nome>.json` nas três pastas (`pt-BR`, `en`, `es`), com as mesmas chaves.
2. Em `i18n/config.ts`:
   - importe os três arquivos (seguindo o padrão `import ptBRNome from "./locales/pt-BR/nome.json"`);
   - acrescente o namespace em `resources`, dentro de cada um dos três idiomas;
   - acrescente o nome em `NAMESPACES`.
3. Use `t("<nome>:...")` nos componentes.

## Como adicionar um idioma

Exemplo: francês (`fr`).

1. Crie a pasta `locales/fr/` com os **11** arquivos, com as mesmas chaves dos outros idiomas, traduzidas. Confira as formas de plural do novo idioma: o i18next usa as regras de plural de cada língua.
2. Em `i18n/config.ts`:
   - importe os 11 arquivos;
   - acrescente o bloco `fr: { common: ..., navigation: ..., ... }` em `resources`;
   - acrescente `{ code: "fr", label: "Français", short: "FR", flag: "..." }` em `SUPPORTED_LANGUAGES`. O tipo `SupportedLanguage` e o seletor de idioma passam a incluí-lo automaticamente.
3. Em `i18n/http.ts`, acrescente o caso de `getAcceptLanguageHeader` para o novo idioma. Sem isso, a função cai no último `return` e envia `pt-BR` para a API.
4. Confirme com o backend se ele tem mensagens nesse idioma.

## Mantendo os três idiomas consistentes

Não há ferramenta automática no projeto que compare os arquivos de tradução. Se faltar uma chave em um idioma, o i18next usa o texto do `pt-BR` (fallback), e o problema pode passar despercebido.

Cuidados ao editar:

- Toda chave nova ou removida deve ser alterada **nos três idiomas** no mesmo commit.
- Mantenha a mesma estrutura (mesmos objetos e caminhos) nos três arquivos de cada namespace.
- Não traduza o que está entre `{{ }}` nem as marcações como `<strong>`.
- Antes de remover uma chave "sem uso", confira as chaves montadas no código (seção [Chaves montadas no código](#chaves-montadas-no-código)).

Para conferir manualmente, este comando (rodado dentro de `frontend/`) lista as chaves que existem em `pt-BR` e faltam em outro idioma. Ele só lê os arquivos:

```bash
node -e "const fs=require('fs');const f=(o,p='')=>Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'?f(v,p+k+'.'):[p+k]);const d='src/i18n/locales/';for(const l of ['en','es'])for(const n of fs.readdirSync(d+'pt-BR')){const a=f(JSON.parse(fs.readFileSync(d+'pt-BR/'+n))),b=new Set(f(JSON.parse(fs.readFileSync(d+l+'/'+n))));a.filter(k=>!b.has(k)).forEach(k=>console.log(l,n,k))}"
```

Sem saída, significa que nenhuma chave do `pt-BR` falta em `en` ou `es`.

## Cuidados e limitações

- **Tudo no bundle:** os 33 arquivos de tradução são importados de forma estática. O usuário baixa os três idiomas, mesmo usando só um. ([#20](https://github.com/Albertinesilva/asjcatalog-frontend/issues/20))
- **Chave inexistente:** `CategoryForm` usa `common:error`, que não existe; o texto cai no `defaultValue` fixo "Erro", em português. ([#20](https://github.com/Albertinesilva/asjcatalog-frontend/issues/20))
- **Sem verificação de chaves pelo TypeScript:** as chaves são texto livre. Um erro de digitação não gera erro de compilação, e a tela mostra a própria chave ou o fallback. ([#20](https://github.com/Albertinesilva/asjcatalog-frontend/issues/20))
- **Textos e formatos fixos:**
  - `ProductPrice` sempre mostra `R$` e o formato brasileiro (`1.234,56`), em qualquer idioma; ([#20](https://github.com/Albertinesilva/asjcatalog-frontend/issues/20))
  - `parseApiError` tem dois textos padrão em português; ([#20](https://github.com/Albertinesilva/asjcatalog-frontend/issues/20))
  - o `aria-label` do breadcrumb usa `"Breadcrumb"` como `defaultValue`.
- **Bandeiras em emoji:** o seletor usa emojis de bandeira (🇧🇷, 🇺🇸, 🇪🇸). No Windows, os navegadores costumam mostrar as letras do país em vez da bandeira; a sigla (`PT`, `EN`, `ES`) aparece ao lado. ([#20](https://github.com/Albertinesilva/asjcatalog-frontend/issues/20))
- **Login sem `Accept-Language`:** as mensagens de erro do pedido de token não seguem o idioma escolhido. ([#20](https://github.com/Albertinesilva/asjcatalog-frontend/issues/20))
- **`<html lang>` atualizado em dois lugares:** pelo `I18nProvider` e pelo `change` do `useLanguage`. ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))
- **Chaves sem uso aparente:** `catalog:loading`, `dashboard:welcome`, `common:actions.edit`, `common:actions.delete` e `validation:required`. ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))

## Veja também

- [HOOKS.md](HOOKS.md#uselanguage): o hook `useLanguage`.
- [COMPONENTS.md](COMPONENTS.md): o `LanguageSelector` e os componentes com textos padrão.
- [ERROR-HANDLING.md](ERROR-HANDLING.md#mensagens-quem-traduz-o-quê): o que a API traduz e o que o frontend traduz.
- [FORMS-AND-PASSWORD.md](FORMS-AND-PASSWORD.md): mensagens de validação.
- [GLOSSARY.md](GLOSSARY.md): significado dos termos técnicos usados aqui.
