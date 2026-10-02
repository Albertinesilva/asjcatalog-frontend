[← README](../README.md) · [Anterior](ARCHITECTURE.md) · [Próximo](ROUTES-AND-PAGES.md)

# Ambiente e configuração

Este documento detalha o que o [README](../README.md#como-executar) resume. Aqui você vai ver por que o projeto exige Node 20.x, como as variáveis de ambiente são lidas e usadas, o que cada script faz, como o frontend fala com a API (proxy e CORS), como gerar e publicar o build e quais cuidados tomar no Windows.

## Onde fica no código

| Arquivo | Papel |
| --- | --- |
| `frontend/package.json` | Dependências, scripts e versão de Node aceita (`engines`) |
| `frontend/.npmrc` | Ativa `engine-strict=true` |
| `frontend/.nvmrc` | Versão de Node usada no projeto (para o nvm) |
| `frontend/package-lock.json` | Versões exatas instaladas pelo npm |
| `frontend/.env.example` | Modelo das variáveis de ambiente |
| `frontend/.gitignore` | Arquivos que o Git ignora (inclui `.env`, `.env.*` e `*.local`; o `.env.example` continua versionado) |
| `frontend/src/utils/constants.ts` | Lê as variáveis de ambiente |
| `frontend/src/api/base-url.ts` | Decide o endereço base das requisições |
| `frontend/vite.config.ts` | Alias `@`, plugin do React e proxy de desenvolvimento |
| `frontend/tsconfig.json` | Regras do TypeScript (modo estrito) e alias `@/*` |
| `frontend/eslint.config.js` e `frontend/.prettierrc` | Regras de lint e de formatação |
| `package.json` (raiz) | Scripts usados pelo Lovable para publicar o site; repassam os comandos para `frontend/` (veja [Arquivos usados pela publicação no Lovable](#arquivos-usados-pela-publicação-no-lovable)) |
| `.gitignore` (raiz) | Ignora `node_modules/`, lockfiles e `dist/` criados na raiz pelos scripts do Lovable ou por engano |

## Node.js 20.x

O projeto só instala com **Node.js 20.x**. Dois arquivos garantem isso:

`frontend/package.json`

```json
  "engines": {
    "node": "^20.10.0"
  },
```

`frontend/.npmrc`

```ini
engine-strict=true
```

- `^20.10.0` significa "versão 20.10.0 ou maior, **mas menor que 21**".
- O campo `engines` sozinho só gera um aviso. Com `engine-strict=true`, o npm **recusa** a instalação quando a versão do Node não combina.
- Com Node 22 ou 24, o `npm install` para com um erro de engine incompatível.

O arquivo `frontend/.nvmrc` contém `20.10.0`. Se você usa o **nvm** (gerenciador de versões do Node), basta rodar dentro de `frontend/`:

```bash
nvm install   # instala a versão do .nvmrc, se ainda não tiver
nvm use       # ativa essa versão no terminal atual
```

> No Windows, o nvm-windows pode não ler o `.nvmrc`. Nesse caso, informe a versão: `nvm install 20.10.0` e `nvm use 20.10.0`.

## Instalação

O passo a passo está no [README](../README.md#como-executar). Alguns detalhes:

- O gerenciador de pacotes adotado no README é o **npm**. O lockfile dele é o `package-lock.json`.
- A pasta `frontend/` também contém um `bun.lock` (lockfile do gerenciador Bun). Ele é usado pelo Lovable para publicar o site e não faz parte do passo a passo do README (veja [Arquivos usados pela publicação no Lovable](#arquivos-usados-pela-publicação-no-lovable)).
- Todos os comandos rodam **dentro de `frontend/`**, onde ficam as dependências e os scripts do projeto.

### Arquivos usados pela publicação no Lovable

O site do ASJCatalog é publicado pelo **Lovable**. Ele lê o repositório a partir da **raiz** e instala e gera o build com o **Bun** (outro gerenciador de pacotes). Como o código fica em `frontend/`, alguns arquivos existem só para o Lovable e não fazem parte do desenvolvimento local, que continua sendo feito dentro de `frontend/`, com o npm.

| Arquivo ou pasta | Para que serve | Usado localmente? |
| --- | --- | --- |
| `package.json` (raiz) | Scripts que o Lovable executa: repassam os comandos para `frontend/`, instalando e gerando o build com o Bun | Não. Use os scripts de `frontend/package.json` (detalhes na tabela abaixo) |
| `.gitignore` (raiz) | Impede que `node_modules/`, lockfiles e `dist/` criados na raiz entrem em commits | Só como proteção: evita versionar algo criado na raiz por engano |
| `dist/` (raiz) | Saída do build gerado pelos scripts da raiz (`--outDir ../dist`). Não fica no repositório | Não. O build local fica em `frontend/dist/` |
| `frontend/bun.lock` | Lockfile do Bun, com as versões que o Lovable instala | Não. Localmente, o lockfile usado é o `frontend/package-lock.json`, do npm |

> [!IMPORTANT]
> Esses arquivos **não são sobras do template** do projeto. Não os remova enquanto o site for publicado pelo Lovable: sem eles, a pré-visualização e a publicação param de funcionar.
>
> - A issue [#17](https://github.com/Albertinesilva/asjcatalog-frontend/issues/17) (remover sobras do template) **não se aplica** a eles.
> - A issue [#16](https://github.com/Albertinesilva/asjcatalog-frontend/issues/16) (manter um único lockfile) precisa levar em conta que o Lovable usa o Bun e depende do `frontend/bun.lock`.

Scripts do `package.json` da raiz:

| Script da raiz | Comando real | O que faz | Funciona localmente? |
| --- | --- | --- | --- |
| `dev` | `cd frontend && (test -f node_modules/vite/bin/vite.js \|\| bun install) && node node_modules/vite/bin/vite.js` | Se o Vite já estiver instalado em `frontend/`, só inicia o servidor. Se não estiver, instala as dependências com o Bun antes | **Windows:** não. O npm executa o script no `cmd.exe`, que não tem o comando `test`; o script então tenta `bun install` e, sem o Bun, para antes de iniciar o Vite. **Linux e macOS:** sim, se as dependências já estiverem instaladas em `frontend/`; caso contrário, precisa do Bun |
| `build` | `cd frontend && bun install && bun run build -- --outDir ../dist --emptyOutDir` | Instala as dependências com o Bun e gera o build em `dist/` **na raiz** (não em `frontend/dist/`) | Só com o Bun instalado |
| `build:dev` | `cd frontend && bun install && bun run build:dev -- --outDir ../dist --emptyOutDir` | Igual ao `build`, no modo `development` | Só com o Bun instalado |
| `preview` | `cd frontend && bun run preview` | Serve o build de `frontend/dist/`, e não o `dist/` da raiz gerado pelos dois scripts acima | Só com o Bun instalado |

Em Linux e macOS, `npm run dev` na raiz ainda funciona como alternativa quando `npm install` já foi feito em `frontend/`. No Windows, use `npm run dev` dentro de `frontend/`.

Cuidados:

- **Não rode `npm install` na raiz.** O `package.json` da raiz não tem dependências, então isso não instala o projeto e pode criar um lockfile na raiz. O `.gitignore` da raiz impede que `node_modules/` e lockfiles criados ali sejam versionados.
- **Os scripts da raiz podem alterar `frontend/bun.lock`.** Com o Bun instalado, `build` e `build:dev` sempre rodam `bun install` em `frontend/`. O `dev` também roda quando o Vite não está instalado, ou sempre no Windows, porque o `test` falha no `cmd.exe`. O `bun install` cria ou atualiza o `frontend/bun.lock`, que é versionado, e instala `frontend/node_modules` pelo Bun. O `package-lock.json` não é alterado. Depois de usar esses scripts, confira o `git status` antes de commitar.
- **O Bun não aplica `engines` nem `engine-strict`.** Essas regras são do npm; uma instalação feita pelos scripts da raiz não verifica a versão do Node. Rodar o `dev` pela raiz também não refaz essa verificação.
- **Build na raiz:** `build` e `build:dev` gravam o resultado em `dist/` na raiz do repositório. Essa pasta é ignorada pelo `.gitignore` da raiz (regra `/dist/`), então não entra em commits.

## Variáveis de ambiente

O Vite lê variáveis de arquivos `.env*` que ficam na pasta do projeto (`frontend/`). Só as variáveis com prefixo `VITE_` ficam disponíveis no código, em `import.meta.env`. O projeto não muda essa configuração: tudo o que esta seção descreve sobre a leitura dos arquivos é **comportamento padrão do Vite**.

### Qual arquivo usar: `.env.local`

Copie o modelo:

```bash
cd frontend
cp .env.example .env.local
```

Por que `.env.local`?

- O `frontend/.gitignore` ignora o `.env` e todos os `.env.*`, inclusive o `.env.local`. A única exceção é o `.env.example`, que é o modelo versionado. Assim, nenhum arquivo com valores reais entra em commits.
- Entre os arquivos lidos pelo Vite, o `.env.local` tem prioridade sobre o `.env`, o que o torna o lugar indicado para os valores da sua máquina.

Por padrão, o Vite carrega os arquivos nesta ordem, e os mais específicos têm prioridade:

| Arquivo | Quando é lido |
| --- | --- |
| `.env` | Sempre (ignorado pelo Git) |
| `.env.local` | Sempre (ignorado pelo Git) |
| `.env.[modo]` | Só no modo indicado (`development` no `dev`, `production` no `build`) (ignorado pelo Git) |
| `.env.[modo].local` | Só no modo indicado (ignorado pelo Git) |

> Depois de alterar um arquivo `.env*`, **reinicie** o `npm run dev`. Esse é um comportamento padrão do Vite: ele só lê esses arquivos ao iniciar.

### As três variáveis

| Variável | Para que serve | Onde é usada |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Endereço base da API ASJCatalog, sem barra no final (os caminhos dos endpoints já começam com `/`) | Base da instância `http` e da URL do login (`api/base-url.ts`) |
| `VITE_CLIENT_ID` | Identificador do cliente OAuth2 cadastrado na API | Cabeçalho `Authorization: Basic …` do pedido de token (`api/auth-api.ts`) |
| `VITE_CLIENT_SECRET` | Senha do cliente OAuth2 | Mesmo cabeçalho do item anterior |

**OAuth2** é o protocolo de autorização usado pela API para emitir os tokens de acesso. O login envia o par cliente e senha no formato **Basic** (os dois valores juntos, codificados em Base64):

`frontend/src/api/auth-api.ts`

```ts
function basicAuthHeader(): string {
  const encoder =
    typeof btoa === "function" ? btoa : (s: string) => Buffer.from(s).toString("base64");
  return `Basic ${encoder(`${CLIENT_ID}:${CLIENT_SECRET}`)}`;
}
```

As três variáveis são lidas em `frontend/src/utils/constants.ts`. Se alguma não estiver definida, o código usa um **valor padrão** escrito no próprio arquivo, sem nenhum aviso.

Para o endereço da API, o padrão é `http://localhost:8080`:

`frontend/src/utils/constants.ts`

```ts
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080";
```

O operador `??` usa o valor da esquerda quando ele existe. Assim, se `VITE_API_BASE_URL` estiver definida, ela **sobrescreve** o padrão; se não estiver, vale `http://localhost:8080`.

`VITE_CLIENT_ID` e `VITE_CLIENT_SECRET` também têm valores padrão no mesmo arquivo. Eles não são reproduzidos aqui por serem credenciais. Defina sempre as três variáveis, principalmente antes de gerar o build de produção.

> **Atenção:** toda variável `VITE_*` é copiada para o JavaScript enviado ao navegador. Qualquer pessoa pode abrir as ferramentas do navegador e ler esses valores. Não use segredos de verdade nelas.

## Scripts do `package.json`

Rode dentro de `frontend/` com `npm run <script>`.

| Script | Comando real | Quando usar |
| --- | --- | --- |
| `dev` | `vite` | No dia a dia. Sobe o servidor de desenvolvimento e recarrega a tela a cada alteração. Endereço: `http://localhost:5173` (porta padrão do Vite; o projeto não define outra) |
| `build` | `vite build` | Para gerar a versão de produção na pasta `frontend/dist/` |
| `build:dev` | `vite build --mode development` | Para gerar um build usando o modo `development` (lê `.env.development`, se existir) |
| `preview` | `vite preview` | Para testar o conteúdo de `dist/` localmente. Endereço: `http://localhost:4173` (porta padrão do Vite para o preview; o projeto não define outra) |
| `lint` | `eslint .` | Para procurar problemas no código. As regras do Prettier entram como erros do ESLint |
| `format` | `prettier --write .` | Para formatar o código. **Altera os arquivos em disco** |

Não há script de testes nem de checagem de tipos. Para checar os tipos do TypeScript, rode:

```bash
npx tsc --noEmit
```

`--noEmit` faz o TypeScript só verificar os tipos, sem gerar arquivos.

## Como o frontend chega à API

### Endereço base

O arquivo `frontend/src/api/base-url.ts` decide para onde as requisições vão:

- **Caso normal** (desenvolvimento local, `preview` e produção): as requisições vão **direto** para `VITE_API_BASE_URL`.
- **Caso especial:** quando a aplicação roda no domínio do Lovable (nome do host com `lovable.app`, verificado em `base-url.ts`), as requisições usam o caminho relativo `/api/proxy`.

O login (`/oauth2/token`) segue a mesma regra, pela função `buildAuthUrl`.

### Proxy do Vite

Um **proxy** é um intermediário: o navegador chama o próprio servidor do Vite, e o Vite repassa a chamada para a API. O `frontend/vite.config.ts` declara um proxy para caminhos que começam com `/api/proxy`:

`frontend/vite.config.ts`

```ts
  server: {
    proxy: {
      "/api/proxy": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (proxyPath) => proxyPath.replace(/^\/api\/proxy/, ""),
      },
    },
  },
```

- `rewrite` remove o prefixo `/api/proxy` antes de repassar. Por exemplo, `/api/proxy/api/v1/products` chega à API como `/api/v1/products`.
- O destino (`target`) é `http://localhost:8080`, **fixo** no `vite.config.ts`. Ele não lê `VITE_API_BASE_URL`: mudar a variável não muda o destino do proxy.
- `changeOrigin: true` faz o Vite trocar o cabeçalho `Host` da requisição pelo endereço do destino.
- O proxy só existe enquanto o servidor do Vite está rodando. Num build publicado em outro servidor, ele não existe.

Na prática, **no desenvolvimento local o proxy não é usado**: como a aplicação roda em `localhost`, o `base-url.ts` escolhe o endereço direto da API. ([#17](https://github.com/Albertinesilva/asjcatalog-frontend/issues/17))

### CORS

**CORS** (*Cross-Origin Resource Sharing*) é a regra do navegador que bloqueia chamadas de uma página para outro endereço (outra porta já conta como outro endereço), a menos que o servidor de destino autorize.

No desenvolvimento local, o frontend roda em `http://localhost:5173` (porta padrão do Vite) e chama a API direto no endereço de `VITE_API_BASE_URL`. São endereços diferentes, então cada chamada passa pelas regras de CORS do navegador.

**O que o frontend envia** (confirmado no código):

| Requisição | Métodos | Cabeçalhos definidos pelo frontend | Onde |
| --- | --- | --- | --- |
| Chamadas comuns à API (instância `http`) | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | `Authorization: Bearer <token>` (quando há sessão), `Accept-Language` (sempre) e `Content-Type: application/json` (posto automaticamente pelo Axios quando há corpo) | `api/axios.ts` e `api/*-api.ts` |
| Pedido de token (login e renovação) | `POST` | `Authorization: Basic …` e `Content-Type: application/x-www-form-urlencoded`. Não envia `Accept-Language`, porque usa o Axios global, sem os interceptadores | `api/auth-api.ts` |

Nas telas, o `PATCH` só é usado na troca de senha do perfil. Nenhuma requisição usa `withCredentials`, então o frontend não envia cookies.

**O que isso exige da API:**

- O navegador tem uma lista de cabeçalhos "simples", que não exigem autorização prévia. `Accept-Language` está nela, com os valores usados pelo projeto (como `pt-BR,pt;q=0.9`), e `Content-Type: application/x-www-form-urlencoded` também. Já `Authorization` e `Content-Type: application/json` não estão.
- Por isso, antes das chamadas com esses cabeçalhos (todas as chamadas autenticadas, os envios em JSON e o pedido de token), o navegador faz uma verificação automática chamada **preflight**: uma requisição `OPTIONS` perguntando se a chamada é permitida. `PUT`, `PATCH` e `DELETE` também sempre passam por preflight.
- Para as chamadas funcionarem, a resposta da API (inclusive ao preflight) precisa permitir:
  - a **origem** do frontend (por exemplo, `http://localhost:5173`, e `http://localhost:4173` se você testar com `npm run preview`);
  - os **métodos** `GET`, `POST`, `PUT`, `PATCH` e `DELETE`;
  - os **cabeçalhos** `Authorization` e `Content-Type`. Liberar também `Accept-Language` não é obrigatório, mas não atrapalha.
- Como o frontend não envia cookies, a liberação de credenciais do CORS (`Access-Control-Allow-Credentials`) não é necessária para ele.

Como a API está configurada não faz parte deste repositório.

Sinal de CORS mal configurado: no console do navegador aparece um erro mencionando `CORS` ou `Access-Control-Allow-Origin`, e a tela mostra uma mensagem de falha de conexão.

## Build e preview

```bash
cd frontend
npm run build     # gera frontend/dist/
npm run preview   # serve frontend/dist/ em http://localhost:4173 (porta padrão do Vite)
```

- O `build` **não verifica tipos**: o Vite só converte TypeScript em JavaScript. Rode `npx tsc --noEmit` antes, para não publicar código com erro de tipo.
- As variáveis `VITE_*` são fixadas **no momento do build**. Para mudar o endereço da API de um build já pronto, é preciso gerar o build de novo.
- As páginas de autenticação, dashboard e perfil viram arquivos JavaScript separados (*chunks*), baixados só quando o usuário entra nelas. Veja [ROUTES-AND-PAGES.md](ROUTES-AND-PAGES.md#carregamento-sob-demanda-lazy-loading).

## Deploy de SPA: fallback para `index.html`

O app usa `BrowserRouter`, que trabalha com URLs "limpas", como `/catalog/7`. Esses caminhos **não existem como arquivos** em `dist/`: quem os entende é o JavaScript da aplicação.

Ao abrir `/catalog/7` diretamente, ou ao recarregar a página, o servidor procura um arquivo com esse nome. Se não estiver configurado, responde com 404. A solução é configurar um **fallback**: qualquer caminho que não seja um arquivo existente deve devolver o `index.html`. Depois disso, o React Router mostra a tela certa.

O repositório **não traz** configuração de deploy (nenhum arquivo de servidor, hospedagem ou CI foi encontrado). Ao publicar, configure esse fallback no serviço escolhido.

Também revise os arquivos `frontend/public/robots.txt` e `frontend/public/sitemap.xml`. Eles apontam para o endereço do site no Lovable e precisam ser atualizados se o site passar a ser publicado em outro endereço.

## Observações para Windows

### Erros `Delete ␍` no lint

No Windows, é comum o `npm run lint` mostrar milhares de erros como este:

```text
  12:48  error  Delete `␍`  prettier/prettier
```

Esses erros **não** indicam problema no código. Eles vêm do **fim de linha**:

- No Windows, as linhas de texto costumam terminar em **CRLF** (dois caracteres: `\r\n`). No Linux e no macOS, em **LF** (`\n`).
- Com a opção `core.autocrlf=true` (comum no Git para Windows), o Git converte os arquivos para CRLF ao baixá-los.
- O Prettier espera LF (o `.prettierrc` não muda o padrão), então reclama de cada `\r` (o `␍` da mensagem).
- O repositório não tem um arquivo `.gitattributes` para fixar o fim de linha.

Cuidado com `npm run format` e `npm run lint -- --fix`: eles reescrevem os arquivos com LF. O conteúdo não muda, mas o editor e o Git podem mostrar muitos arquivos alterados.

### Copiar o modelo de variáveis

No PowerShell, `cp` e `copy` são apelidos do comando `Copy-Item`, então `cp .env.example .env.local` funciona. No Prompt de Comando (`cmd`), use:

```bat
copy .env.example .env.local
```

## Cuidados e limitações

- **Só Node 20.x:** com `engines` + `engine-strict`, versões mais novas do Node não instalam o projeto. ([#3](https://github.com/Albertinesilva/asjcatalog-frontend/issues/3))
- **Variáveis no bundle:** `VITE_CLIENT_SECRET` fica visível para qualquer pessoa que abrir o JavaScript do site. ([#2](https://github.com/Albertinesilva/asjcatalog-frontend/issues/2))
- **Valores padrão silenciosos:** se uma variável faltar, o código usa o padrão de `constants.ts` sem avisar. Um build de produção sem `VITE_API_BASE_URL` aponta para `http://localhost:8080`. ([#13](https://github.com/Albertinesilva/asjcatalog-frontend/issues/13))
- **Build sem checagem de tipos** e **nenhum script de testes**. ([#15](https://github.com/Albertinesilva/asjcatalog-frontend/issues/15), [#4](https://github.com/Albertinesilva/asjcatalog-frontend/issues/4))
- **Lint falha no Windows** por causa do fim de linha, sem `.gitattributes` no repositório. ([#14](https://github.com/Albertinesilva/asjcatalog-frontend/issues/14))
- **Dois lockfiles** (`package-lock.json` e `bun.lock`) convivem na pasta. ([#16](https://github.com/Albertinesilva/asjcatalog-frontend/issues/16))
- **Sem configuração de deploy:** o fallback para `index.html` precisa ser configurado à parte. ([#18](https://github.com/Albertinesilva/asjcatalog-frontend/issues/18))

## Veja também

- [ARCHITECTURE.md](ARCHITECTURE.md): camadas e fluxo de uma requisição.
- [ROUTES-AND-PAGES.md](ROUTES-AND-PAGES.md): mapa de rotas e carregamento sob demanda.
- [API-AND-SERVICES.md](API-AND-SERVICES.md): instância `http` e cabeçalhos enviados à API.
- [AUTHENTICATION.md](AUTHENTICATION.md): como `VITE_CLIENT_ID` e `VITE_CLIENT_SECRET` são usados no login.
- [CONVENTIONS.md](CONVENTIONS.md): regras de lint e formatação.
- [TESTING.md](TESTING.md): estado dos testes (não há script de testes).
- [GLOSSARY.md](GLOSSARY.md): significado dos termos técnicos usados aqui.
