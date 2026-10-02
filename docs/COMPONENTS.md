[← README](../README.md) · [Anterior](HOOKS.md) · [Próximo](FORMS-AND-PASSWORD.md)

# Componentes

Este documento apresenta os componentes reutilizáveis do frontend. Você vai ver como a pasta `components/` está organizada, as convenções seguidas, o que cada componente do design system oferece, onde os demais são usados, o que o projeto já faz em acessibilidade e como criar um componente novo no mesmo padrão.

## Onde fica no código

| Pasta ou arquivo | Conteúdo |
| --- | --- |
| `frontend/src/components/ui/` | Design system: `Button`, `Input`, `Select`, `Textarea`, `Card`, `Badge`, `Skeleton` e o utilitário `cn` |
| `frontend/src/components/shared/` | Estados de tela (carregando, erro, vazio, não encontrado), esqueletos de carregamento, paginação, busca, diálogo de confirmação |
| `frontend/src/components/forms/password/` | Campos e indicadores de senha |
| `frontend/src/components/<Nome>/index.tsx` | Navegação (`Navbar`, `NavbarLink`, `Sidebar`, `LanguageSelector`, `ThemeToggle`), controle de acesso (`Authorization`) e produto (`ProductItem`, `ProductImage`, `ProductPrice`, `ProductShowcase`) |
| `frontend/src/components/index.ts` | Reexporta os componentes de uso geral |
| `frontend/src/components/ui/index.ts` | Reexporta o design system |
| `frontend/src/pages/dashboard/<domínio>/components/` | Componentes de um único domínio do dashboard (tabelas, linhas, ações e badges de produtos, categorias e usuários) |

## Organização: genéricos e de domínio

| Grupo | O que é | Sabe algo do negócio? |
| --- | --- | --- |
| `ui/` | Peças visuais básicas, sem lógica de negócio | Não |
| `shared/` (genéricos) | `LoadingState`, `ErrorState`, `EmptyState`, `NotFoundState`, `Pagination`, `SearchInput`, `TableToolbar`, `ConfirmDialog`, `TableSkeleton` | Não |
| `shared/` (de domínio) | `CategoryFilterSelect`, `ProductGridSkeleton`, `ProductDetailsSkeleton`, `ProductFormSkeleton`, `UserFormSkeleton`, `CategoryFormSkeleton` | Sim: recebem ou imitam dados de um domínio |
| Navegação | `Navbar`, `NavbarLink`, `Sidebar`, `LanguageSelector`, `ThemeToggle` | Conhecem rotas, sessão e perfis |
| Produto | `ProductItem`, `ProductImage`, `ProductPrice`, `ProductShowcase` | Sim |
| Dashboard por domínio | Em `pages/dashboard/<domínio>/components/` | Sim, e só são usados naquele domínio |

Um componente **genérico** recebe tudo por props e funciona em qualquer tela. Um componente **de domínio** conhece um tipo de dado (produto, categoria) ou uma regra do negócio. Hoje, alguns componentes de domínio ficam em `components/` e `components/shared/`, junto dos genéricos (veja [Cuidados e limitações](#cuidados-e-limitações)).

## Convenções

- **Export default:** cada componente é exportado com `export default`. Os de topo e os de `ui/` ficam em `Nome/index.tsx`; os de `shared/` e `forms/password/`, em `Nome.tsx`.
- **Barrels:** um **barrel** é um arquivo `index.ts` que reexporta vários módulos para simplificar os imports. Há três:
  - `@/components`: componentes de uso geral (`Navbar`, `ErrorState`, `ConfirmDialog`, `PasswordField`…);
  - `@/components/ui`: design system, `cn`, `buttonClasses` e `inputBaseClasses`;
  - `pages/dashboard/<domínio>/components/index.ts`: componentes de cada domínio.

  `frontend/src/pages/dashboard/products/ProductListPage.tsx`

  ```tsx
  import {
    Authorization,
    CategoryFilterSelect,
    ConfirmDialog,
    ErrorState,
    Pagination,
    SearchInput,
    TableSkeleton,
    TableToolbar,
  } from "@/components";
  ```
- **Alias `@/`:** os imports usam `@/` (= `frontend/src/`). Há exceções com caminho relativo dentro de `components/`, como `Navbar` importando `../NavbarLink`.
- **Props tipadas no próprio arquivo:** cada componente declara um `type Props`. Os de `ui/` estendem os atributos HTML nativos (por exemplo, `ButtonHTMLAttributes`), então aceitam qualquer prop do elemento original (`onClick`, `disabled`, `aria-*`…).
- **`forwardRef` nos campos:** `Button`, `Input`, `Select`, `Textarea` e `PasswordField` usam `forwardRef`. Assim, o React Hook Form consegue acessar o elemento real com `{...register("campo")}`.
- **Textos traduzidos:** componentes com texto padrão usam `useTranslation` e aceitam sobrescrita por props (por exemplo, `ErrorState` usa `common:states.error` se nenhum `title` for passado).
- **Utilitário `cn`:** junta nomes de classes CSS, ignorando valores falsos:

  `frontend/src/components/ui/cn.ts`

  ```ts
  export function cn(...parts: Array<string | number | false | null | undefined>): string {
    return parts.filter(Boolean).join(" ");
  }
  ```

  Uso típico: `cn(classesBase, ativo && "bg-primary", className)`. O `cn` **não** resolve conflitos entre classes Tailwind: se duas classes definirem a mesma propriedade, vale a regra do CSS gerado, não a ordem dos argumentos.

## Design system (`ui/`)

As cores, fontes, espaçamentos e o tema escuro vêm de tokens definidos no CSS global e no Tailwind. Eles serão detalhados em [STYLING-AND-THEMING.md](STYLING-AND-THEMING.md). Aqui, só os componentes.

| Componente | Finalidade | Principais props | Variantes e tamanhos |
| --- | --- | --- | --- |
| `Button` | Botão padrão | `variant`, `size`, `loading`, `fullWidth`, `leftIcon`, `rightIcon`, `type` (padrão `"button"`) | `variant`: `primary`, `secondary`, `outline`, `danger`, `ghost`, `inverse`. `size`: `sm`, `md`, `lg`, `icon` |
| `buttonClasses(variant, size)` | Função (não componente) que devolve as classes do botão, para aplicar em um `<Link>` | — | As mesmas do `Button` |
| `Input` | Campo de texto com rótulo, ajuda e erro | `label`, `helperText`, `error`, `required`, `wrapperClassName`, `inputClassName` | — |
| `inputBaseClasses` | Classes base do campo, reaproveitadas por `Select`, `Textarea`, `SearchInput` e `PasswordField` | — | — |
| `Select` | Lista de seleção (simples ou múltipla) | As do `Input` + `multiple`, `selectClassName` | — |
| `Textarea` | Campo de texto de várias linhas | As do `Input` + `textareaClassName` | — |
| `Card` | Superfície com fundo, borda e sombra | `padding`, `bordered` (padrão `true`), `elevated` (padrão `true`) | `padding`: `none`, `sm`, `md` (padrão), `lg` |
| `Badge` | Etiqueta compacta | `variant` | `default`, `primary`, `outline` |
| `Skeleton` | Bloco cinza animado para "esqueletos" de carregamento | Atributos de `div` (`className` define o tamanho) | — |

Uma **variante** é uma versão pré-definida do mesmo componente (por exemplo, o botão `danger`, vermelho, para ações destrutivas).

### Button

`frontend/src/components/ui/Button/index.tsx`

```tsx
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={(ariaBusy ?? loading) ? true : undefined}
      className={cn(
        buttonBaseClasses,
        buttonVariantClasses[variant],
        buttonSizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
```

- `type` é `"button"` por padrão. Num formulário, passe `type="submit"` no botão de envio.
- Com `loading`, o botão fica desabilitado, mostra um ícone girando no lugar do `leftIcon` e recebe `aria-busy`.
- `size="icon"` cria um botão quadrado só com ícone. Nesse caso, passe um `aria-label` descrevendo a ação.
- `inverse` serve para fundos da cor da marca, como a `Navbar`.

**Exemplo real:**

`frontend/src/pages/dashboard/products/ProductForm.tsx`

```tsx
          <Button type="submit" variant="primary" loading={isSubmitting || loading}>
            {loading ? t("products:actions.saving") : t("products:actions.save")}
          </Button>
```

**Link com cara de botão:** para navegação, o projeto usa `buttonClasses` num `<Link>`, em vez de colocar um `<Button>` dentro de um link:

`frontend/src/pages/dashboard/products/ProductListPage.tsx`

```tsx
          <Link to="/dashboard/products/new" className={buttonClasses("primary", "md")}>
            {t("products:actions.create")}
          </Link>
```

### Input (e Select, Textarea)

`Input`, `Select` e `Textarea` têm a mesma estrutura: rótulo opcional, campo e, embaixo, a mensagem de erro **ou** o texto de ajuda.

`frontend/src/components/ui/Input/index.tsx`

```tsx
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
        className={cn(
          inputBaseClasses,
          hasError && "border-danger focus:border-danger focus:ring-danger/30",
          inputClassName,
          className,
        )}
        {...rest}
      />
```

- Sem `id`, o componente gera um com `useId`, e o `<label>` aponta para ele.
- Com `error`, o campo ganha borda vermelha e `aria-invalid`, e a mensagem fica ligada ao campo por `aria-describedby`. Assim, leitores de tela leem o erro junto com o campo.
- `required` mostra um asterisco no rótulo (escondido dos leitores de tela) e marca o campo como obrigatório.

**Exemplo real** (com React Hook Form):

`frontend/src/pages/dashboard/categories/CategoryForm.tsx`

```tsx
        <Input
          label={t("categories:form.name")}
          required
          error={errors.name?.message}
          {...register("name", { required: t("validation:nameRequired") })}
        />
```

### Card

Superfície padrão de formulários, cartões e diálogos. Por padrão tem borda, sombra e espaçamento `md`.

`frontend/src/pages/auth/LoginPage.tsx`

```tsx
    <Card padding="lg" elevated bordered className="w-full max-w-form">
```

### Diálogo (modal)

O design system **não tem** um componente "Modal" genérico. O único diálogo é o `ConfirmDialog`, em `shared/` (veja abaixo). Os avisos de sucesso e erro usam o SweetAlert2, por meio de `utils/alerts.ts` (veja [ERROR-HANDLING.md](ERROR-HANDLING.md#quando-o-sweetalert2-é-usado)).

## Componentes compartilhados (`shared/`)

| Componente | Finalidade | Principais props | Onde é usado |
| --- | --- | --- | --- |
| `LoadingState` | Indicador de carregamento com texto | `message` | Fallback das rotas com lazy loading, `PrivateRoute`, `RoleRoute`, páginas de perfil, `UserDetailsPage` |
| `ErrorState` | Erro recuperável, com botão "Tentar novamente" | `message` ou `title`, `description`, `onRetry`, `action` | Listas do dashboard, formulários (erro ao carregar), `CatalogPage`, `ProductDetailsPage`, `UserDetailsPage` |
| `EmptyState` | Lista vazia | `title`, `description`, `action`, `illustration` | `CatalogPage`, `ProductTable`, `CategoryTable`, `UserTable`, `NotFoundState` |
| `NotFoundState` | Registro inexistente (404) com botão de voltar | `backTo`, `backLabel`, `title`, `description` | `ProductDetailsPage`, `ProductForm`, `CategoryForm`, `UserForm`, `UserDetailsPage` |
| `Pagination` | Navegação numérica entre páginas (página interna começa em 0) | `page`, `totalPages`, `onChange`, `ariaLabel` | Listas do dashboard |
| `SearchInput` | Campo de busca com botão "Limpar" e espaço para filtros extras | `value`, `onChange`, `onClear`, `filters`, `placeholder`, `ariaLabel` | `CatalogPage` e listas do dashboard |
| `CategoryFilterSelect` | Filtro de categoria para encaixar no `SearchInput` | `categories`, `value`, `onChange`, `placeholder`, `ariaLabel` | `CatalogPage`, `ProductListPage` |
| `TableToolbar` | Cabeçalho de lista: contador de registros e área de ações | `counter`, `children` | Listas do dashboard |
| `ConfirmDialog` | Diálogo de confirmação | `open`, `title`, `description`, `variant`, `isConfirming`, `error`, `onConfirm`, `onCancel` | Exclusões no dashboard, `LoginPage`, `ActivationPendingPage` |
| `TableSkeleton` | Esqueleto de lista do dashboard | `rows` | Listas do dashboard |
| `ProductGridSkeleton`, `ProductDetailsSkeleton`, `ProductFormSkeleton`, `UserFormSkeleton`, `CategoryFormSkeleton` | Esqueletos com o formato de uma tela específica | `count` (só o primeiro) | Telas correspondentes |
| `catalog-grid.ts`, `state-layout.ts` | Classes CSS compartilhadas (grade do catálogo; layout de vazio e erro) | — | `CatalogPage`, `ProductGridSkeleton`; `EmptyState`, `ErrorState` |

Notas:

- `SearchInput` **não** faz debounce: quem usa deve combiná-lo com `useDebouncedValue` (veja [HOOKS.md](HOOKS.md#usedebouncedvalue)).
- `Pagination` esconde-se sozinho quando há uma página ou menos. Com mais de sete páginas, mostra a primeira, a última, as vizinhas da atual e reticências.
- Quando e como usar `ErrorState`, `NotFoundState` e o `error` do `ConfirmDialog` está em [ERROR-HANDLING.md](ERROR-HANDLING.md#como-tratar-erros-numa-tela-nova).

## Navegação

| Componente | Finalidade | Onde é usado |
| --- | --- | --- |
| `Navbar` | Barra superior: logo, links (Início, Catálogo, Dashboard ou Entrar), tema, idioma, usuário logado e "Sair". Abaixo de 1024 px vira menu "hambúrguer" | Os três layouts |
| `NavbarLink` | Link da `Navbar` com indicação da página ativa (`NavLink` do React Router) | `Navbar` |
| `Sidebar` | Menu lateral do dashboard: Dashboard, Produtos, Categorias, Usuários (só `ROLE_ADMIN`), submenu "Meu perfil" e link para o catálogo. No celular, vira uma faixa horizontal rolável | `DashboardLayout` |
| `LanguageSelector` | Lista suspensa para trocar o idioma (usa `useLanguage`) | `Navbar` |
| `ThemeToggle` | Botão que alterna o tema em ciclo: claro → escuro → sistema (usa `useTheme`) | `Navbar` |
| `Authorization` | Mostra os filhos só se o usuário tiver algum dos perfis em `roles`; senão, mostra `fallback` | Ações das listas do dashboard |

## Componentes de produto

| Componente | Finalidade | Onde é usado |
| --- | --- | --- |
| `ProductItem` | Card de produto do catálogo (imagem, nome, preço), que leva ao detalhe | `CatalogPage` |
| `ProductImage` | Imagem do produto. Se a URL estiver vazia ou a imagem falhar, mostra um ícone neutro no lugar | `ProductItem`, `ProductDetailsPage`, `ProductTableRow` |
| `ProductPrice` | Preço formatado em reais (`R$` + milhar com ponto e centavos com vírgula), nos tamanhos `md` e `sm` | `ProductItem`, `ProductDetailsPage`, `ProductTableRow` |
| `ProductShowcase` | Carrossel da página inicial, com fotos por categoria, troca automática a cada 5 segundos, pausa e setas. As imagens ficam em `ProductShowcase/slides.ts` | `HomePage` |

## Componentes de domínio do dashboard

Cada domínio (`products`, `categories`, `users`) tem, em `pages/dashboard/<domínio>/components/`:

| Componente | Papel |
| --- | --- |
| `*Table` | Recebe a lista e mostra os itens, ou um `EmptyState` (com "limpar filtros" quando há busca ativa) |
| `*TableRow` | Um item da lista, desenhado como um `Card` |
| `*Actions` | Botões do item (ver, editar, excluir), com `Authorization` nos que dependem de perfil |
| `ProductCategoryBadge`, `UserRoleBadge` | Etiquetas de categoria e de perfil |

Apesar do nome "Table", esses componentes **não** usam `<table>`: são listas de cards.

## Campos de senha (`forms/password/`)

`PasswordField` (campo com botão de mostrar e ocultar), `PasswordRequirements` (lista de requisitos atendidos), `PasswordStrength` (barra de força) e `PasswordMatch` (indica se as senhas coincidem). Eles são usados no login, no cadastro, na redefinição de senha, no perfil e no formulário de usuário. A explicação completa, com as regras de validação, está em [FORMS-AND-PASSWORD.md](FORMS-AND-PASSWORD.md).

## Acessibilidade

**Acessibilidade** é fazer a interface funcionar também para quem usa teclado, leitor de tela ou outras tecnologias assistivas.

### O que o projeto já faz

| Recurso | Onde |
| --- | --- |
| Rótulos ligados aos campos (`<label htmlFor>`), erros ligados por `aria-describedby` e `aria-invalid` | `Input`, `Select`, `Textarea` |
| `aria-label` em botões só com ícone e em regiões | `ThemeToggle`, botão do menu da `Navbar`, `Pagination` (anterior/próxima), `SearchInput`, carrossel |
| Foco visível (`focus-visible:ring`) em botões, links e campos | Classes base de `Button`, `NavbarLink`, `Pagination`, `Sidebar` e outros |
| Diálogo acessível: `role="dialog"`, `aria-modal`, título e descrição ligados, foco inicial em "Cancelar", foco preso dentro do diálogo, Escape fecha e o foco volta ao botão que abriu | `ConfirmDialog` |
| Menu mobile: `aria-expanded`, Escape fecha e devolve o foco ao botão | `Navbar` |
| Submenu com `aria-expanded` e `aria-controls` | `Sidebar` |
| Página ativa anunciada com `aria-current="page"` | `Pagination` |
| Estados anunciados: `role="status"` e `aria-live` no carregamento, `role="alert"` no erro | `LoadingState`, `TableSkeleton`, `ErrorState`, mensagens de erro de formulário |
| Elementos decorativos escondidos (`aria-hidden`) | `Skeleton`, ícones SVG, imagens decorativas |
| Botão ocupado anunciado com `aria-busy` | `Button` com `loading` |
| Carrossel: `aria-roledescription`, navegação por setas do teclado, botão de pausa, pausa automática com foco de teclado e sem troca automática quando o sistema pede menos movimento | `ProductShowcase` |

### O que falta

- **Botão dentro de link:** em dez lugares, um `<Button>` fica dentro de um `<Link>`. Isso gera `<button>` dentro de `<a>` (HTML inválido) e dois elementos focáveis para a mesma ação. Ocorrências: `HomePage` (2), `NotFoundPage`, `RegisterPage`, `RecoverPage`, `ResetPasswordPage`, `ActivateAccountPage` (3) e `NotFoundState`. A alternativa já usada no projeto é `buttonClasses` no `<Link>`. ([#9](https://github.com/Albertinesilva/asjcatalog-frontend/issues/9))
- **Seletor de idioma:** o comentário de `LanguageSelector` cita navegação por setas e fechamento ao perder o foco, mas o código só trata Escape e clique fora. Além disso, usa `role="listbox"` com `role="option"` em `<li>` que contêm `<button>`, um padrão que não segue a especificação ARIA de listbox. ([#10](https://github.com/Albertinesilva/asjcatalog-frontend/issues/10))
- **Listas sem semântica de tabela:** as `*Table` do dashboard são divs e cards, sem cabeçalhos de coluna para leitores de tela. ([#21](https://github.com/Albertinesilva/asjcatalog-frontend/issues/21))
- **Campos só com `aria-label`:** nas telas de autenticação e no `SearchInput`, vários campos não têm rótulo visível, apenas `placeholder` e `aria-label`. ([#21](https://github.com/Albertinesilva/asjcatalog-frontend/issues/21))
- **Sem "pular para o conteúdo":** não há link de atalho para pular a barra de navegação. ([#21](https://github.com/Albertinesilva/asjcatalog-frontend/issues/21))

## Como criar um novo componente

1. **Escolha o lugar:**
   - peça visual sem regra de negócio → `components/ui/Nome/index.tsx`;
   - estado ou estrutura reaproveitável entre telas → `components/shared/Nome.tsx`;
   - usado só num domínio do dashboard → `pages/dashboard/<domínio>/components/Nome.tsx`.
2. **Declare as props** num `type Props` no próprio arquivo. Se o componente envolver um elemento HTML, estenda os atributos dele (`HTMLAttributes<HTMLDivElement>`, por exemplo) e repasse o resto com `...rest`.
3. **Use os tokens**: classes Tailwind semânticas (`bg-surface`, `text-foreground`…), nunca cores fixas. Junte as classes com `cn` e aceite um `className` externo.
4. **Textos** com `useTranslation`, com props para sobrescrever.
5. **Campos de formulário:** use `forwardRef` para funcionar com o React Hook Form.
6. **Acessibilidade:** rótulo para cada campo, `aria-label` em botões só com ícone, foco visível e `aria-hidden` em ícones decorativos.
7. **Exporte** com `export default` e acrescente a linha no barrel correspondente (`components/index.ts`, `components/ui/index.ts` ou o `index.ts` do domínio).
8. **Para navegar**, use `<Link className={buttonClasses(...)}>`, nunca `<Link><Button /></Link>`.

## Cuidados e limitações

- **Botão dentro de link** em dez lugares (lista em [O que falta](#o-que-falta)). ([#9](https://github.com/Albertinesilva/asjcatalog-frontend/issues/9))
- **Componentes de domínio em pastas genéricas:** os de produto ficam na raiz de `components/`, e `CategoryFilterSelect` e os esqueletos de tela ficam em `shared/`. ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))
- **Paginação do catálogo duplicada:** a `CatalogPage` tem paginação própria em vez de usar `Pagination`. Com mais de 11 páginas, ela mostra de 1 a 10, reticências e a última página. As páginas intermediárias além da 10ª não aparecem, e a página atual fica sem destaque. ([#8](https://github.com/Albertinesilva/asjcatalog-frontend/issues/8))
- **Ícones SVG repetidos:** cada componente desenha os próprios ícones (`Sidebar`, `DashboardPage`, `ProductShowcase`, `ThemeToggle`…), sem uma biblioteca ou módulo comum. ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))
- **`cn` não resolve conflitos** de classes Tailwind. ([#23](https://github.com/Albertinesilva/asjcatalog-frontend/issues/23))
- **Três formas de importar `cn`:** `@/components/ui`, `@/components/ui/cn` e `../cn`. ([#24](https://github.com/Albertinesilva/asjcatalog-frontend/issues/24))
- **Sem componente de modal genérico:** diálogos que não sejam de confirmação precisariam de um componente novo.

## Veja também

- [HOOKS.md](HOOKS.md): hooks usados pelos componentes (`useRoles`, `useTheme`, `useLanguage`, `useDebouncedValue`).
- [ERROR-HANDLING.md](ERROR-HANDLING.md): quando usar `ErrorState`, `NotFoundState` e alertas.
- [ROUTES-AND-PAGES.md](ROUTES-AND-PAGES.md): layouts que usam `Navbar` e `Sidebar`.
- [FORMS-AND-PASSWORD.md](FORMS-AND-PASSWORD.md): formulários e componentes de senha.
- [STYLING-AND-THEMING.md](STYLING-AND-THEMING.md): tokens, tipografia e escalas usados pelos componentes.
- [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md): textos padrão traduzidos dos componentes.
- [CONVENTIONS.md](CONVENTIONS.md): nomenclatura e o guia de uma tela CRUD completa.
- [GLOSSARY.md](GLOSSARY.md): significado dos termos técnicos usados aqui.
