[← README](../README.md) · [Anterior](FORMS-AND-PASSWORD.md) · [Próximo](INTERNATIONALIZATION.md)

# Estilo e tema

Este documento explica como o visual do ASJCatalog é construído. Você vai ver a configuração do Tailwind CSS, a organização do CSS global, os tokens de cor semânticos dos temas claro e escuro, como o modo escuro funciona, as escalas de tipografia, espaçamento, raios e sombras, o tema do SweetAlert2 e como criar ou alterar estilos seguindo o padrão.

## Onde fica no código

| Arquivo | Papel |
| --- | --- |
| `frontend/tailwind.config.ts` | Configuração do Tailwind: modo escuro, cores ligadas aos tokens, fontes, escalas, animações e plugins |
| `frontend/postcss.config.js` | Liga o Tailwind e o Autoprefixer ao build |
| `frontend/src/styles/globals.css` | Diretivas do Tailwind, tokens dos temas claro e escuro, estilos base e tema do SweetAlert2 |
| `frontend/src/main.tsx` | Importa o `globals.css` |
| `frontend/index.html` | Carrega as fontes do Google Fonts e aplica o tema antes do React (script anti-FOUC) |
| `frontend/src/contexts/ThemeContext.tsx` | Coloca ou tira a classe `dark` do `<html>` |
| `frontend/src/components/ui/` | Componentes que consomem os tokens (veja [COMPONENTS.md](COMPONENTS.md)) |

## Tailwind no projeto

O **Tailwind CSS** é um framework de classes utilitárias: em vez de escrever CSS em arquivos separados, você aplica classes prontas direto no JSX (`flex`, `p-md`, `bg-surface`). O projeto usa a versão 3. Não há outros frameworks de CSS nem CSS Modules.

### `tailwind.config.ts`

`frontend/tailwind.config.ts`

```ts
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // Standard Tailwind breakpoints (documented for reference).
    // sm: 640, md: 768, lg: 1024, xl: 1280, 2xl: 1536.
    extend: {
```

- **`darkMode: "class"`:** as classes `dark:` e as variáveis do tema escuro valem quando o `<html>` tem a classe `dark`.
- **`content`:** arquivos que o Tailwind lê para descobrir quais classes gerar. Uma classe montada dinamicamente (por exemplo, `"bg-" + cor`) **não** é encontrada e não entra no CSS final.
- **`theme.extend`:** acrescenta (ou substitui) valores do tema padrão: cores, fontes, tamanhos de texto, espaçamentos, larguras máximas, raios, sombras, `z-index`, durações, curvas de animação e animações.
- **Plugins:** `@tailwindcss/forms` (estilo base para campos de formulário) e `@tailwindcss/typography` (classes `prose`). O plugin de tipografia está instalado e configurado, mas nenhuma classe `prose` é usada no código.

### Organização do `globals.css`

Na ordem do arquivo:

1. **Diretivas do Tailwind:** `@tailwind base;`, `@tailwind components;` e `@tailwind utilities;`. Elas são substituídas pelo CSS gerado.
2. **Tokens:** variáveis CSS em `:root` (tema claro) e em `.dark` (tema escuro).
3. **Estilos base:** cores de fundo e texto do `body`, fonte padrão, fonte dos títulos `h1`–`h6`, links sem sublinhado, campos com fonte de 16 px (evita o zoom automático do Safari no iPhone) e margens para áreas seguras de telas com entalhe.
4. **Tema do SweetAlert2.**
5. **Movimento reduzido:** se o sistema pedir menos movimento (`prefers-reduced-motion`), animações e transições ficam praticamente instantâneas.

O arquivo **não** usa `@layer`: os estilos base e do SweetAlert2 vêm depois das utilidades, como CSS comum.

## Tokens semânticos

Um **token** é um nome que representa um valor de design. O projeto usa tokens **semânticos**: o nome diz para que a cor serve (`--danger`, `--surface`), não qual é a cor (`--vermelho`).

Cada token é uma variável CSS com um **trio HSL** (matiz, saturação, luminosidade) **sem** a função `hsl()`:

`frontend/src/styles/globals.css`

```css
:root {
  color-scheme: light; /* controles nativos (select, scrollbar, autofill) seguem o tema */

  /* Surfaces */
  --background: 210 40% 98%;
  --foreground: 222 47% 11%;
```

O `tailwind.config.ts` transforma cada token numa cor do Tailwind:

`frontend/tailwind.config.ts`

```ts
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        "foreground-muted": "hsl(var(--foreground-muted) / <alpha-value>)",
```

O `<alpha-value>` é preenchido pelo Tailwind. É isso que permite usar transparência com qualquer token: `bg-primary/10` vira `hsl(var(--primary) / 0.1)`. Com a cor guardada já dentro de `hsl()`, isso não seria possível.

### Tabela de tokens

Valores em HSL (matiz, saturação, luminosidade). "Igual" significa que o tema escuro não redefine o token e usa o valor do claro.

| Token | Classe Tailwind | Uso | Claro | Escuro |
| --- | --- | --- | --- | --- |
| `--background` | `bg-background` | Fundo da página | `210 40% 98%` | `222 47% 6%` |
| `--foreground` | `text-foreground` | Texto principal | `222 47% 11%` | `210 40% 98%` |
| `--foreground-muted` | `text-foreground-muted` | Texto secundário | `215 16% 47%` | `215 20% 65%` |
| `--surface` | `bg-surface` | Superfícies (barra lateral, cabeçalhos) | `0 0% 100%` | `222 47% 9%` |
| `--surface-hover` | `bg-surface-hover` | Superfície ao passar o mouse; fundos suaves | `210 40% 96%` | `222 47% 12%` |
| `--card` | `bg-card` | Fundo de cards e diálogos | `0 0% 100%` | `222 47% 9%` |
| `--card-foreground` | `text-card-foreground` | Texto dentro de cards | `222 47% 11%` | `210 40% 98%` |
| `--brand` | `bg-brand` | Barra superior (`Navbar`) | `214 51% 25%` | Igual |
| `--brand-hover` | `bg-brand-hover` | Variação da barra superior | `214 51% 20%` | Igual |
| `--brand-foreground` | `text-brand-foreground` | Texto sobre a barra superior | `0 0% 100%` | Igual |
| `--primary` | `bg-primary`, `text-primary` | Ação principal (botões, links ativos, preço) | `214 51% 25%` | `221 83% 64%` |
| `--primary-hover` | `bg-primary-hover` | Ação principal ao passar o mouse | `214 51% 20%` | `221 83% 70%` |
| `--primary-foreground` | `text-primary-foreground` | Texto sobre `primary` (e sobre `danger`) | `0 0% 100%` | `222 47% 6%` |
| `--secondary` | `bg-secondary` | Elementos secundários | `215 16% 47%` | `215 20% 65%` |
| `--secondary-foreground` | `text-secondary-foreground` | Texto sobre `secondary` | `0 0% 100%` | `222 47% 6%` |
| `--accent` | `text-accent` | Destaques e links de texto | `221 83% 53%` | `221 83% 64%` |
| `--accent-foreground` | `text-accent-foreground` | Texto sobre `accent` | `0 0% 100%` | `222 47% 6%` |
| `--success` | `text-success`, `bg-success` | Sucesso | `142 71% 36%` | Igual |
| `--warning` | `text-warning`, `bg-warning` | Atenção | `38 92% 50%` | Igual |
| `--danger` | `text-danger`, `bg-danger` | Erro e ações destrutivas | `0 74% 51%` | `0 84% 62%` |
| `--border` | `border-border` | Bordas e divisórias | `214 32% 91%` | `222 47% 18%` |
| `--ring` | `ring-ring` | Anel de foco | `221 83% 53%` | `221 83% 64%` |
| `--overlay` | `bg-overlay` | Fundo escurecido atrás de diálogos e do menu mobile | `222 47% 11%` | `0 0% 0%` |
| `--input` | `bg-input` | Fundo dos campos | `0 0% 100%` | `222 47% 9%` |
| `--input-border` | `border-input-border` | Borda dos campos | `214 32% 91%` | `222 47% 18%` |

Notas do próprio código:

- `--brand` é igual nos dois temas "para preservar identidade/logo". Já `--primary` é cor de ação e texto, e por isso clareia no tema escuro.
- No tema escuro, `--primary` e `--danger` foram ajustados para atingir o contraste mínimo do **WCAG AA** (*Web Content Accessibility Guidelines*, nível AA: pelo menos 4,5:1 para texto normal), segundo os comentários no `globals.css`.

### Por que tokens em vez de cores fixas

- **Tema escuro sem retrabalho:** o componente usa `bg-card`; só o valor de `--card` muda entre os temas. Nenhum componente precisa de `dark:` para cores.
- **Consistência:** todas as telas usam o mesmo conjunto de cores.
- **Mudança em um lugar só:** trocar a cor de erro é editar `--danger`, não procurar `#e11d48` pelo código.

Nenhum componente em `src/` usa cor fixa (hexadecimal ou `rgb()`); as cores vêm sempre dos tokens. As exceções estão fora dos componentes (veja [Cuidados e limitações](#cuidados-e-limitações)).

## Modo escuro

A estratégia é **por classe**:

1. O `ThemeProvider` decide o tema efetivo (claro ou escuro) a partir da preferência do usuário ou do sistema operacional e coloca ou tira a classe `dark` do `<html>`. Os detalhes estão em [CONTEXTS.md](CONTEXTS.md#themecontext).
2. Com a classe `dark`, o bloco `.dark` do `globals.css` redefine os tokens.
3. Todas as classes que usam tokens (`bg-background`, `text-foreground`…) mudam de cor sozinhas.

Os blocos também definem `color-scheme` (`light` ou `dark`). Assim, os controles nativos do navegador (barras de rolagem, listas de seleção, preenchimento automático) acompanham o tema.

### Script anti-FOUC

O React só aplica o tema depois de carregar. Para a página não aparecer clara por um instante antes de escurecer (o **FOUC**, *Flash of Unstyled Content*), o `index.html` aplica a classe antes da primeira pintura:

`frontend/index.html`

```html
    <script>
      // Tema antes da primeira pintura (evita FOUC). Regras idênticas ao ThemeProvider:
      // "dark" => escuro; "light" => claro; "system"/ausente/inválido => prefers-color-scheme.
      (function () {
        try {
          var t = localStorage.getItem("asj.theme");
          var dark =
            t === "dark" ||
            (t !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
          if (dark) document.documentElement.classList.add("dark");
        } catch (e) {}
      })();
    </script>
```

A chave `asj.theme` e as regras precisam ser as mesmas do `ThemeProvider`.

## Tipografia

As fontes vêm do **Google Fonts**, carregadas no `index.html`: **DM Sans** (texto), **Space Grotesk** (títulos) e **Inter** (reserva).

| Classe | Fontes | Uso |
| --- | --- | --- |
| `font-body` e `font-sans` (padrão) | DM Sans → Inter → fontes do sistema | Texto corrido |
| `font-heading` | Space Grotesk → Inter → fontes do sistema | Títulos, botões, menus |

O `globals.css` também aplica Space Grotesk, em negrito, a todos os `h1`–`h6`.

Escala de tamanhos (classes `text-*`, criadas pelo projeto):

| Classe | Tamanho | Uso típico |
| --- | --- | --- |
| `text-display` | 3.5rem (56 px), negrito | Destaques grandes (404, título da autenticação) |
| `text-h1` | 2.5rem (40 px), negrito | Título principal |
| `text-h2` | 2rem (32 px), negrito | Título de página |
| `text-h3` | 1.5rem (24 px), seminegrito | Seções |
| `text-title` | 1.25rem (20 px), seminegrito | Títulos de cards e estados |
| `text-subtitle` | 1.125rem (18 px) | Subtítulos |
| `text-body-lg` | 1.0625rem (17 px) | Texto de destaque |
| `text-body` | 1rem (16 px) | Texto normal |
| `text-small` | 0.875rem (14 px) | Rótulos, botões, mensagens |
| `text-caption` | 0.75rem (12 px) | Legendas e etiquetas |

Cada tamanho já define a altura da linha e, nos títulos, o espaçamento entre letras e o peso.

## Espaçamentos, larguras, raios e sombras

**Espaçamento** (aliases semânticos, somados à escala numérica padrão do Tailwind):

| Nome | Valor | Exemplo |
| --- | --- | --- |
| `xs` | 0.25rem (4 px) | `gap-xs` |
| `sm` | 0.5rem (8 px) | `p-sm` |
| `md` | 1rem (16 px) | `px-md` |
| `lg` | 1.5rem (24 px) | `mb-lg` |
| `xl` | 2rem (32 px) | `py-xl` |
| `2xl` | 3rem (48 px) | `lg:py-2xl` |
| `3xl` | 4rem (64 px) | `py-3xl` |

O código usa principalmente esses nomes, mas também a escala numérica padrão (`gap-1.5`, `px-4`, `h-10`).

**Larguras máximas:** `max-w-page` (1400 px, usada pela `Navbar` e pelo contêiner de todas as páginas) e `max-w-form` (440 px, cartões de autenticação).

**Raios de borda** (substituem os valores padrão do Tailwind): `rounded-sm` 4 px, `rounded-md` 8 px, `rounded-lg` 12 px, `rounded-xl` 16 px, `rounded-2xl` 24 px, `rounded-full`.

**Sombras** (também substituem as padrão): `shadow-sm`, `shadow-md` (cards), `shadow-lg` (menus), `shadow-xl` (destaques). São cinza-azuladas e iguais nos dois temas.

**Camadas (`z-index`):** `z-dropdown` (1000), `z-sticky` (1020), `z-overlay` (1040), `z-modal` (1050), `z-toast` (1080), `z-tooltip` (1090).

**Movimento:**

- durações `duration-fast` (120 ms), padrão (180 ms) e `duration-slow` (280 ms);
- curvas `ease-standard`, `ease-entrance` e `ease-exit`;
- animações `animate-fade-in` (surge subindo levemente) e `animate-overlay-in` (só opacidade, para fundos de tela cheia).

**Breakpoints:** o projeto usa os padrões do Tailwind, sem personalização: `sm` 640 px, `md` 768 px, `lg` 1024 px, `xl` 1280 px e `2xl` 1536 px. Um **breakpoint** é a largura de tela a partir da qual uma classe com prefixo passa a valer (por exemplo, `lg:flex` só a partir de 1024 px). O layout é **mobile-first**: as classes sem prefixo valem para telas pequenas, e os prefixos ajustam as maiores.

## O utilitário `cn`

`cn` junta classes, ignorando valores falsos, e é usado em todos os componentes para combinar classes base, condicionais e o `className` recebido. Ele não resolve conflitos entre classes do Tailwind. Veja [COMPONENTS.md](COMPONENTS.md#convenções).

## Tema do SweetAlert2

Os alertas do **SweetAlert2** (veja [ERROR-HANDLING.md](ERROR-HANDLING.md#quando-o-sweetalert2-é-usado)) foram adaptados ao design system em duas partes:

**1. CSS no `globals.css`,** sobrescrevendo as classes da biblioteca com os tokens:

`frontend/src/styles/globals.css`

```css
.swal2-popup {
  background-color: hsl(var(--card)) !important;
  color: hsl(var(--card-foreground)) !important;
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem !important;
  padding: 1.5rem !important;
  box-shadow: 0 24px 48px -12px rgb(15 23 42 / 0.18) !important;
  font-family: "DM Sans", "Inter", system-ui, sans-serif !important;
}
```

- Janela, título, texto, botões (confirmar, cancelar, negar), anel de foco e ícones (sucesso, erro, aviso, informação) usam os tokens.
- Como os tokens mudam com a classe `dark`, os alertas acompanham o **tema escuro automaticamente**.
- O `!important` é necessário porque o SweetAlert2 aplica estilos próprios com prioridade alta.
- Também há regras para telas baixas (celular deitado) e para as áreas seguras de telas com entalhe.

**2. Opções em `utils/alerts.ts`:** os alertas usam a animação de entrada `animate-fade-in` do Tailwind (a mesma do `ConfirmDialog`), `heightAuto: false` (evita travar a rolagem da página depois de navegar) e **não** definem cores de botão, que vêm só do CSS.

## Como adicionar ou alterar um token

**Alterar a cor de um token existente:** edite o valor HSL em `:root` (claro) e, se o tema escuro precisar de outro valor, em `.dark`. Confira o contraste do texto nos dois temas.

**Criar um token novo** (exemplo hipotético: `--info`):

1. Em `globals.css`, declare o trio HSL em `:root` e em `.dark`:
   ```css
   --info: 199 89% 48%;
   ```
2. Em `tailwind.config.ts`, dentro de `theme.extend.colors`, ligue o token a uma cor:
   ```ts
   info: "hsl(var(--info) / <alpha-value>)",
   ```
3. Use as classes geradas: `text-info`, `bg-info/10`, `border-info`.
4. Se o token também valer para os alertas, acrescente a regra correspondente na seção do SweetAlert2 do `globals.css`.

## Como estilizar um componente novo

- Use **apenas classes com tokens** (`bg-surface`, `text-foreground-muted`, `border-border`). Não use cores do Tailwind como `bg-blue-600` nem valores hexadecimais.
- Não use `dark:` para cores: os tokens já trocam sozinhos.
- Use as escalas do projeto: `text-small`, `font-heading`, `p-md`, `rounded-lg`, `shadow-md`.
- Para foco visível, siga o padrão dos componentes existentes: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`.
- Para transições, combine `transition-colors` com `ease-standard`. A redução de movimento global já desativa os efeitos quando o usuário pede.
- Escreva as classes **inteiras** no código (`"bg-danger"`, não `"bg-" + tipo`), para o Tailwind encontrá-las.
- Prefira as classes do Tailwind aos valores arbitrários (`max-w-[720px]`), que o projeto usa em alguns casos, mas que não seguem as escalas.

## Cuidados e limitações

- **Cor do navegador diferente da marca:** a `theme-color` do `index.html` e o `theme_color` do manifesto usam `#1F6FEB`, que não corresponde a nenhum token (a cor da marca, `--brand`, é aproximadamente `#1F3B60`). O `background_color` do manifesto (`#f5f8fc`) também é um valor fixo, próximo mas diferente de `--background`. ([#23](https://github.com/Albertinesilva/asjcatalog-frontend/issues/23))
- **Fontes declaradas em três lugares:** `tailwind.config.ts`, `globals.css` (`body` e `h1`–`h6`) e o tema do SweetAlert2.
- **Valores fixos no tema do SweetAlert2:** sombra, raio, tamanhos de fonte e curva de transição repetem os valores do Tailwind em vez de usar os tokens.
- **Plugin `@tailwindcss/typography` sem uso:** está instalado e configurado, mas nenhuma classe `prose` é usada. ([#23](https://github.com/Albertinesilva/asjcatalog-frontend/issues/23))
- **Sem `@layer`:** os estilos base ficam fora das camadas do Tailwind. Hoje isso não causa conflito, porque as utilidades (classes) têm mais prioridade que os seletores de elemento, mas pode surpreender quem acrescentar regras com classes no `globals.css`.
- **Valores arbitrários:** vários componentes usam tamanhos fixos entre colchetes (`min-h-[320px]`, `max-w-[160px]`), fora das escalas do design system.
- **Regras de tema duplicadas** no `index.html` e no `ThemeProvider` (veja [CONTEXTS.md](CONTEXTS.md#cuidados-e-limitações)). ([#23](https://github.com/Albertinesilva/asjcatalog-frontend/issues/23))

## Veja também

- [COMPONENTS.md](COMPONENTS.md): componentes que consomem os tokens.
- [CONTEXTS.md](CONTEXTS.md#themecontext): como o tema é escolhido e salvo.
- [ENVIRONMENT-AND-SETUP.md](ENVIRONMENT-AND-SETUP.md): build e configuração do projeto.
- [GLOSSARY.md](GLOSSARY.md): significado dos termos técnicos usados aqui.
