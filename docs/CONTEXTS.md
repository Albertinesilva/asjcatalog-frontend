[← README](../README.md) · [Anterior](ERROR-HANDLING.md) · [Próximo](HOOKS.md)

# Contexts

Este documento explica os dois contextos do projeto: `AuthContext` (sessão do usuário) e `ThemeContext` (tema claro, escuro ou do sistema). Você vai entender o que é a Context API do React, que estado cada contexto guarda, como ele é inicializado, quem o consome e o que fica fora de contexto.

## Onde fica no código

| Arquivo | Papel |
| --- | --- |
| `frontend/src/contexts/auth-context.ts` | Cria o objeto `AuthContext` (`createContext`) |
| `frontend/src/contexts/AuthContext.tsx` | `AuthProvider`: estado da sessão, renovação agendada e carregamento do usuário |
| `frontend/src/contexts/theme-context.ts` | Cria o `ThemeContext`, os tipos `Theme`/`ResolvedTheme` e as constantes do tema |
| `frontend/src/contexts/ThemeContext.tsx` | `ThemeProvider`: preferência de tema, tema aplicado e persistência |
| `frontend/src/hooks/useAuth.ts`, `frontend/src/hooks/useTheme.ts` | Hooks de leitura dos contextos |
| `frontend/src/types/auth.ts` | Tipo `AuthContextData` (o que o `AuthContext` expõe) |
| `frontend/src/App.tsx` | Onde os providers são montados |
| `frontend/index.html` | Script que aplica o tema antes de o React carregar |

## O que é a Context API

Em React, os dados normalmente descem de um componente pai para o filho por **props** (as "propriedades" passadas ao componente). Quando muitos componentes, em níveis diferentes, precisam do mesmo dado (por exemplo, "quem está logado"), passar props de um em um fica trabalhoso. Esse problema tem até nome: *prop drilling*.

A **Context API** resolve isso em três peças:

1. **Contexto:** criado com `createContext`. É o "canal" por onde o dado passa.
2. **Provider:** componente que coloca um valor nesse canal. Tudo o que estiver **dentro** dele pode ler esse valor.
3. **Consumidor:** qualquer componente dentro do provider que lê o valor com `useContext` ou, neste projeto, com um hook próprio (`useAuth`, `useTheme`).

Quando o valor do provider muda, todos os componentes que o consomem são redesenhados.

O projeto usa contexto só para o que é realmente **global**: a sessão e o tema. O resto fica fora (veja [O que fica fora de contexto](#o-que-fica-fora-de-contexto)).

## Ordem dos providers

Os providers são montados em `App.tsx`, nesta ordem: `ThemeProvider` → `I18nProvider` → `BrowserRouter` → `AuthProvider` → rotas. O código e a explicação da ordem estão em [ARCHITECTURE.md](ARCHITECTURE.md#visão-geral).

O `I18nProvider` não é um contexto do projeto: ele repassa a instância do i18next usada pela biblioteca de tradução e mantém o atributo `lang` do `<html>` atualizado. Os detalhes estão em [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md).

## AuthContext

Guarda **quem está logado**, com quais perfis, e oferece as ações de login e logout. O fluxo de login, o armazenamento dos tokens e a renovação da sessão estão em [AUTHENTICATION.md](AUTHENTICATION.md). Aqui o foco é o contexto em si.

### Contexto e provider em arquivos separados

`frontend/src/contexts/auth-context.ts`

```ts
/**
 * O objeto de contexto vive num módulo separado (sem componentes) para que o
 * Fast Refresh não recrie a instância do contexto ao editar o AuthProvider,
 * o que quebraria o useAuth em tempo de execução.
 */
export const AuthContext = createContext<AuthContextData | null>(null);
```

O **Fast Refresh** é o recurso do Vite que atualiza a tela sem recarregar quando você salva um arquivo. Se o `createContext` estivesse no mesmo arquivo do provider, cada edição criaria um contexto novo, e os componentes ainda ligados ao antigo deixariam de funcionar. O `ThemeContext` segue o mesmo padrão.

O valor inicial é `null`. É assim que o hook `useAuth` percebe que está sendo usado fora do provider (veja [Consumindo um contexto](#consumindo-um-contexto)).

### Estado interno

O `AuthProvider` guarda um único objeto de estado:

`frontend/src/contexts/AuthContext.tsx`

```tsx
type State = {
  authenticated: boolean;
  token: AccessToken | null;
  user: User | null;
  loading: boolean;
};
```

| Campo | Conteúdo |
| --- | --- |
| `authenticated` | Se há sessão ativa |
| `token` | O payload decodificado do access token (perfis, `userId`, `username`, expiração), não o token em texto |
| `user` | Os dados do usuário vindos de `GET /api/v1/accounts/me` (nome, e-mail…) |
| `loading` | `true` enquanto a sessão existe mas o usuário ainda não foi carregado |

### Inicialização a partir do armazenamento

O estado inicial vem da função `readState`, que lê o `localStorage`:

`frontend/src/contexts/AuthContext.tsx`

```tsx
function readState(): State {
  const payload = decodeToken();
  const accessValid = !!payload?.exp && Date.now() < payload.exp * 1000;
  const authenticated = !!payload && (accessValid || hasRefreshToken());
  return {
    authenticated,
    token: authenticated ? payload : null,
    user: null,
    loading: authenticated,
  };
}
```

- Ao abrir o app com uma sessão salva, o usuário já começa autenticado, sem passar pelo login.
- `loading` começa `true` quando há sessão. Por isso, as rotas protegidas mostram a tela de carregamento até `/accounts/me` responder.
- A regra de "sessão ativa" está explicada em [AUTHENTICATION.md](AUTHENTICATION.md#quando-a-sessão-é-considerada-ativa).

Depois de montado, o provider se mantém atualizado assim:

| Efeito | O que faz |
| --- | --- |
| Escuta `auth-change` e `storage` | Chama `readState` de novo quando a sessão muda nesta aba (`auth-change`) ou em outra (`storage`). Se a sessão continua a mesma, preserva o usuário já carregado |
| Agenda a renovação | Programa a renovação do token para pouco antes de expirar (detalhes em [AUTHENTICATION.md](AUTHENTICATION.md#renovação-da-sessão-refresh)) |
| Carrega o usuário | Quando `authenticated` vira `true`, busca `/accounts/me` e preenche `user`. Se a busca falhar, mantém o último usuário conhecido (guardado num `useRef`) em vez de apagá-lo |

### O que o contexto expõe

O valor entregue aos consumidores segue o tipo `AuthContextData`:

| Campo ou ação | Tipo | Descrição |
| --- | --- | --- |
| `authenticated` | `boolean` | Se há sessão ativa |
| `loading` | `boolean` | Se o usuário ainda está sendo carregado |
| `user` | `User \| null` | Dados do usuário (`firstName`, `lastName`, `email`…) |
| `userId` | `number \| null` | Vem do claim `userId` do token |
| `username` | `string \| null` | Vem do claim `username` do token (e-mail de login) |
| `roles` | `Role[]` | Vem do claim `authorities` do token |
| `login(credentials)` | `Promise<void>` | Pede o token, grava a sessão e atualiza o estado |
| `logout()` | `void` | Apaga a sessão e atualiza o estado |
| `refreshUser()` | `Promise<void>` | Busca `/accounts/me` de novo. Usado depois de editar o perfil e no "tentar novamente" das telas de perfil |
| `isAuthenticated()` | `boolean` | Mesmo valor de `authenticated`, em forma de função |
| `hasRole(role)` | `boolean` | Verifica um perfil |

O valor é montado com `useMemo` e só muda quando o estado ou as ações mudam.

### Quem consome

| Consumidor | Usa |
| --- | --- |
| `PrivateRoute`, `RoleRoute` | `authenticated`, `loading` |
| `Navbar` | `authenticated`, `user`, `logout` |
| `LoginPage` | `authenticated`, `login` |
| `DashboardPage` | `user` (saudação) |
| `PersonalProfilePage`, `SecurityProfilePage` | `user`, `loading`, `refreshUser` |
| Hook `useRoles` (e, por meio dele, `Authorization`, `Sidebar`, `Navbar`, `RoleRoute`, `DashboardPage`) | `roles` |

`isAuthenticated()` e `hasRole()` do contexto não são usados por nenhum componente. As verificações de perfil passam pelo `useRoles`.

## ThemeContext

Guarda a **preferência de tema** do usuário e aplica o tema na página.

### Estado

| Valor | Tipo | Significado |
| --- | --- | --- |
| `theme` | `"light" \| "dark" \| "system"` | A **preferência** escolhida. `system` = seguir o sistema operacional |
| `resolvedTheme` | `"light" \| "dark"` | O tema **aplicado de fato**. Se a preferência for `system`, depende do sistema |
| `setTheme(theme)` | função | Troca a preferência e a salva |

### Como o tema é aplicado

`frontend/src/contexts/ThemeContext.tsx`

```tsx
  const resolvedTheme: ResolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);
```

O provider só coloca ou tira a classe **`dark`** do elemento `<html>`. As cores mudam porque o CSS global define variáveis diferentes quando essa classe está presente. As cores e os tokens estão em [STYLING-AND-THEMING.md](STYLING-AND-THEMING.md#modo-escuro).

### Persistência (`asj.theme`)

- A preferência fica no `localStorage`, na chave **`asj.theme`** (constante `THEME_STORAGE_KEY`).
- Ela só é gravada quando o usuário **escolhe** um tema. Sem escolha salva, ou com um valor inválido, vale `system`.
- Se o `localStorage` estiver indisponível (por exemplo, bloqueado pelo navegador), a escolha vale só até a página ser fechada.

### Reação ao sistema operacional

O provider escuta a *media query* `(prefers-color-scheme: dark)`, que diz se o sistema está em modo escuro. Quando o usuário muda o tema do sistema, `systemDark` é atualizado. Isso só altera a tela se a preferência for `system`: uma escolha explícita (`light` ou `dark`) nunca é sobrescrita pelo sistema.

### Aplicação antes do React (sem "piscar")

O React só começa a rodar depois que o JavaScript carrega. Para a página não aparecer clara por um instante e depois ficar escura (o chamado FOUC, *Flash of Unstyled Content*), o `index.html` tem um pequeno script que lê `asj.theme` e aplica a classe `dark` antes da primeira pintura. As regras desse script repetem as do `ThemeProvider`, e a chave precisa ser a mesma nos dois lugares.

### Quem consome

Só o componente **`ThemeToggle`** (na `Navbar`), por meio do hook `useTheme`. Ele alterna a preferência em ciclo: claro → escuro → sistema. O `ThemeToggle` também importa diretamente a constante `THEME_OPTIONS` de `contexts/theme-context.ts`.

## Por que dois contextos separados

O código não registra o motivo da separação, mas ela traz estas vantagens:

- **Mudam por motivos diferentes:** o tema muda quando o usuário clica no botão; a sessão, no login, no logout ou na renovação do token. Juntos num único contexto, qualquer mudança faria todos os consumidores dos dois assuntos redesenharem.
- **Têm consumidores diferentes:** só o `ThemeToggle` precisa do tema; várias telas precisam da sessão.
- **Ficam em posições diferentes da árvore:** o tema vale para tudo, inclusive antes do roteador; a sessão fica dentro do `BrowserRouter`.

## O que fica fora de contexto

| Tipo de estado | Onde fica | Exemplo |
| --- | --- | --- |
| Estado de uma tela (dados carregados, carregando, erro) | Na própria página, com `useState` ou com os hooks `useResource` e `usePagedQuery` | Lista de produtos, produto em edição |
| Estado de formulário | React Hook Form, dentro da página | Campos do cadastro |
| Estado de interface local | No componente | Menu mobile aberto, diálogo de confirmação aberto, slide atual do carrossel |
| Idioma | Biblioteca i18next (`useTranslation`, `useLanguage`) | Idioma ativo |
| Preferências e dados persistidos | `localStorage`, por meio de `utils/storage.ts` | E-mail pendente de ativação, tempo de espera do reenvio |

O padrão que se observa no código: um dado só está em contexto quando muitas partes distantes da árvore precisam dele **e** ele muda durante o uso do app. Vale seguir esse critério ao criar estado novo.

## Consumindo um contexto

Os componentes não usam `useContext` diretamente. Eles usam os hooks `useAuth` e `useTheme`, que também verificam se o provider existe:

`frontend/src/hooks/useAuth.ts`

```ts
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}
```

**Fora do provider**, `useContext` devolve o valor inicial `null`, e o hook **lança um erro** com uma mensagem clara (`useTheme` faz o mesmo com `<ThemeProvider>`). O erro interrompe a renderização e aparece no console do navegador. Na prática, isso acontece se um componente que usa `useAuth` for renderizado fora de `App.tsx`, por exemplo, num teste sem o provider.

Os detalhes de `useAuth`, `useRoles` e `useTheme` estão em [HOOKS.md](HOOKS.md).

## Cuidados e limitações

- **`isAuthenticated()` e `hasRole()` sem uso:** fazem parte de `AuthContextData`, mas nenhum componente os chama.
- **Tema com regras duplicadas:** o script do `index.html` e o `ThemeProvider` repetem a mesma lógica e a mesma chave `asj.theme`. Mudar um sem o outro faz a tela "piscar" ou mostrar o tema errado ao carregar.
- **Renovação proativa no contexto:** o `AuthContext` encerra a sessão em qualquer falha da renovação agendada, sem a checagem extra feita pelo interceptador. Veja [AUTHENTICATION.md](AUTHENTICATION.md#cuidados-e-limitações).
- **Contexto chamando a API diretamente:** o `AuthProvider` importa `refreshSession` e `hasRefreshToken` de `api/auth-api.ts`, sem passar por `services/`.
- **Mensagens de erro dos hooks em português:** são mensagens para desenvolvedores, não aparecem para o usuário final.

## Veja também

- [AUTHENTICATION.md](AUTHENTICATION.md): login, armazenamento e renovação da sessão.
- [HOOKS.md](HOOKS.md): `useAuth`, `useRoles`, `useTheme` e os demais hooks.
- [ROUTES-AND-PAGES.md](ROUTES-AND-PAGES.md): como `PrivateRoute` e `RoleRoute` usam o `AuthContext`.
- [ARCHITECTURE.md](ARCHITECTURE.md): ordem dos providers e camadas.
- [STYLING-AND-THEMING.md](STYLING-AND-THEMING.md): tokens de cor e modo escuro.
- [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md): o `I18nProvider` e o idioma.
- [GLOSSARY.md](GLOSSARY.md): significado dos termos técnicos usados aqui.
