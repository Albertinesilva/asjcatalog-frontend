# CLAUDE.md — ASJCatalog (frontend)

Este arquivo dá ao Claude Code o contexto e as regras do projeto. Ele é versionado e vale para qualquer pessoa que use a ferramenta neste repositório. Leia-o inteiro antes de qualquer tarefa e siga as regras mesmo que o pedido não as repita.

Ele é um **mapa**: traz só as regras e os fatos que valem para toda tarefa. Os detalhes ficam nos documentos listados na [seção 13](#13-índice-da-documentação). Quando houver itens marcados com **(a confirmar)**, eles ainda precisam ser conferidos no código.

---

## 1. O projeto

- **ASJCatalog (frontend)**: catálogo público de produtos e painel administrativo que consomem a API do backend. O nome vem das iniciais de **Albert Silva de Jesus**.
- O ASJCatalog nasceu da base do **DSCatalog**, do curso DevSuperior, e evoluiu de forma independente.
- **Open source e sem fins comerciais**: laboratório de aprendizado, fonte de consulta futura e material para ajudar desenvolvedores júnior.
- A base da interface foi gerada com o **Lovable** e depois ajustada, integrada ao backend, auditada e documentada manualmente.
- Site publicado pelo Lovable: https://asjcatalog.lovable.app (sem dados enquanto o backend não estiver em produção).
- Backend independente, em outro repositório: https://github.com/Albertinesilva/backend-engineering-journey-java-springboot (código atual na branch `develop`; regras próprias no `CLAUDE.md` de lá).
- O projeto pode receber **contribuições externas por Pull Request**, sempre para a `develop` (seção 9.1).
- Grafia oficial: **ASJCatalog** (sem espaço), em código, textos, traduções e documentação.

## 2. Repositório e pastas

- GitHub: `Albertinesilva/asjcatalog-frontend`
- Os caminhos deste arquivo partem da **raiz do repositório clonado**: a pasta criada pelo `git clone` (por exemplo, `asjcatalog-frontend/`).

```
<raiz do repositório>/          ← comandos Git aqui
├── README.md                   ← porta de entrada e menu da documentação
├── CLAUDE.md
├── CONTRIBUTING.md, CODE_OF_CONDUCT.md, LICENSE (MIT)
├── .github/                    ← modelos de issue e de PR
├── package.json                ← usado SÓ pelo Lovable (seção 9.2)
├── .gitignore                  ← protege a raiz (node_modules/, lockfiles, dist/)
├── docs/                       ← documentação técnica (seção 13)
└── frontend/                   ← projeto Vite: comandos npm aqui
    ├── package.json, package-lock.json, bun.lock
    ├── .env.example, .npmrc, vite.config.ts, tailwind.config.ts
    └── src/
```

| Pasta de `frontend/src` | Responsabilidade |
|---|---|
| `api/` | Cliente HTTP (Axios), interceptors, `base-url.ts`, normalização das páginas (`SpringPage`) e uma função por endpoint |
| `services/` | Camada entre as telas e `api/`; hoje, na maior parte, só reexporta as funções de `api/` |
| `pages/` | Telas: `auth`, `catalog`, `dashboard/{products,categories,users}`, `account` |
| `layouts/` | `Auth`, `Catalog` e `Dashboard` |
| `routes/` | `AppRoutes`, `PrivateRoute`, `RoleRoute`, `route-access` |
| `contexts/` | `AuthContext` e `ThemeContext` |
| `hooks/` | `useAuth`, `useRoles`, `useTheme`, `useDebouncedValue`, `usePagination`, `usePagedQuery`, `useResource` |
| `components/` | `ui/` (design system), `shared/`, `forms/password`, navegação e produto |
| `i18n/` | i18next, `locales/{pt-BR,en,es}` e `hooks/useLanguage` |
| `utils/` | `constants`, `storage`, `permissions`, `alerts`, `password`, `api-error`, `api-error-handler` e `ui-error` |
| `types/` | Tipos de domínio e contratos com a API |
| `styles/` e `assets/` | `globals.css`, tokens, tema e arquivos estáticos |

- **Comandos npm**: sempre dentro de `frontend/`, com Node 20.x.
- **Comandos Git**: sempre na raiz. `git add .` dentro de `frontend/` deixa de fora `docs/`, o `README.md` e este arquivo.

## 3. Stack

- React 19.2, TypeScript 5.8 (`strict`) e Vite 5.4.
- React Router 6.30, Axios 1, React Hook Form 7 (sem Zod/Yup), jwt-decode 4 e SweetAlert2 11.
- i18next 26 com react-i18next 17.
- Tailwind CSS 3.4, com tokens semânticos em HSL e modo escuro por classe.
- i18next: pt-BR (padrão), en e es, em 11 namespaces com as mesmas chaves nos três idiomas.
- Fontes do Google Fonts: DM Sans (texto), Space Grotesk (títulos) e Inter (reserva).
- Node `^20.10.0` com `engine-strict` no `.npmrc`: só o Node 20.x instala (issue #3).
- Alias de import `@/` para `frontend/src`.
- As versões exatas estão no `frontend/package.json`.

## 4. Ambiente e configuração

- Variáveis em `frontend/.env.local`, criado a partir do `frontend/.env.example`:
  - `VITE_API_BASE_URL`: endereço da API (padrão no código: `http://localhost:8080`);
  - `VITE_CLIENT_ID` e `VITE_CLIENT_SECRET`: client OAuth2 do frontend.
- Os valores padrão ficam em `frontend/src/utils/constants.ts` (issue #13 propõe removê-los).
- Variáveis `VITE_*` vão para o bundle: **nunca** são segredos de verdade.
- O `.gitignore` de `frontend/` ignora `.env` e `.env.*`, exceto o `.env.example`.
- `api/base-url.ts` desvia as chamadas para `/api/proxy` quando o host contém `lovable.app`; esse proxy existe só no `npm run dev` e no `npm run preview` do Vite, e não no site estático publicado (issue #17).
- Usuários e client de exemplo para testar localmente: ver a seção 4 do `CLAUDE.md` do backend.
- Detalhes: [ENVIRONMENT-AND-SETUP.md](docs/ENVIRONMENT-AND-SETUP.md).

## 5. Comandos, verificação e testes

| Ação (dentro de `frontend/`) | Comando |
|---|---|
| Instalar dependências | `npm install` |
| Desenvolvimento | `npm run dev` (porta padrão 5173) |
| Build / build de desenvolvimento | `npm run build` / `npm run build:dev` |
| Pré-visualizar o build | `npm run preview` (porta padrão 4173) |
| Lint / formatação | `npm run lint` / `npm run format` |
| Checagem de tipos | `npx tsc --noEmit` (o build não verifica tipos; issue #15) |

- **Sempre** rode `npx tsc --noEmit`, `npm run build` e `npm run lint` em `frontend/` depois de alterar código.
- O lint acusa erros de fim de linha (CRLF) no Windows enquanto não houver `.gitattributes` (issue #14): separe esses avisos dos erros reais. O repositório guarda os arquivos em LF; o CRLF aparece só na cópia de trabalho do Windows (`core.autocrlf=true`).
- **Testes:** ainda não existem (issue #4; proposta em [TESTING.md](docs/TESTING.md)).
- **CI:** `.github/workflows/ci.yml` roda em `pull_request` e `push` na `develop` (nunca `pull_request_target`): Node do `frontend/.nvmrc`, `npm ci`, `npx tsc --noEmit`, `npm run build` e `npm run lint`. Os quatro passos bloqueiam: se um falhar, o CI falha.
- **Nunca** rode `npm install` nem os scripts do `package.json` da **raiz**.

## 6. Princípios de arquitetura (não quebrar)

- **Camadas:** `pages` → `services` → `api`. Telas não chamam o cliente HTTP diretamente.
- **Tipos** de domínio e contratos ficam em `types/`, alinhados ao contrato do backend.
- **Textos:** todo texto visível passa pelo i18n e existe nos **três idiomas**, com as mesmas chaves.
- **Estilo:** cores e estilos usam os **tokens semânticos** do design system, nunca cores fixas; tudo funciona nos temas claro e escuro.
- **Erros da API:** caminho `parseApiError` → `handleApiError` → `getUiErrorMessage`. O backend devolve as mensagens já traduzidas conforme o `Accept-Language`; o campo `code` (`ApiErrorCode`) é estável.
- **Permissões:** o frontend esconde o que o perfil não pode usar, mas quem garante a permissão é o backend.
- **Componentes:** `export default`, reexportados por `index.ts`; imports com o alias `@/`.
- Detalhes: [ARCHITECTURE.md](docs/ARCHITECTURE.md) e [CONVENTIONS.md](docs/CONVENTIONS.md).

## 7. Integração com o backend e autenticação

- **Fonte da verdade do contrato:** a documentação do backend, na branch `develop` ([docs/guides](https://github.com/Albertinesilva/backend-engineering-journey-java-springboot/tree/develop/docs/guides)):

| Assunto | Guia do backend |
|---|---|
| Rotas, verbos, permissões, corpos e respostas | `API-ENDPOINTS.md` |
| Login, JWT, refresh token, roles, 401 e 403 | `AUTHENTICATION.md` |
| Formato de erro (`ProblemDetails`, `ValidationError`) e status | `ERROR-HANDLING.md` |
| Idiomas e `Accept-Language` | `INTERNATIONALIZATION.md` |
| Cadastro, ativação, recuperação de senha e e-mails | `ACCOUNT-FLOWS.md` |
| Regras de validação, senha forte e e-mail | `VALIDATION.md` |

- **Regra:** antes de criar ou alterar qualquer chamada à API, confira no contrato do backend o verbo, a rota, o corpo, os status e o formato de erro. Não deduza o contrato pelo código do frontend.
- **Issues do backend com a label `frontend`** listam o que precisa ser alterado ou verificado aqui (`gh issue list --repo Albertinesilva/backend-engineering-journey-java-springboot --label frontend`).
- **Autenticação** (detalhe em [AUTHENTICATION.md](docs/AUTHENTICATION.md)):
  - OAuth2 `grant_type=password`, pedido de token com `Authorization: Basic` e corpo `x-www-form-urlencoded`;
  - tokens em `localStorage["authData"]`, claims lidas com `jwt-decode`;
  - renovação proativa (60 s antes do `exp`) e reativa (no 401), uma por vez (*single-flight*);
  - logout só no navegador (issue #11);
  - perfis `ROLE_OPERATOR` e `ROLE_ADMIN`: `/dashboard/users/*` e exclusões são só ADMIN; usuário recém-cadastrado é OPERATOR.
- **Links dos e-mails do backend** (montados com `FRONTEND_URL`): `/activate-account?token=...` e `/reset-password?token=...`. **Não remova nem renomeie essas rotas** sem alterar o backend antes (issue #26).

## 8. Armadilhas conhecidas

- **Atualização de categoria é `PATCH`**, e não é parcial: exige `name`. Produto e usuário usam `PUT` (#28 do backend).
- **Verbo errado vira 500**: o backend ainda não trata verbo HTTP não suportado (#36 do backend).
- **`POST /oauth2/token`** responde no formato do OAuth2, com mensagens em inglês, e não com `ProblemDetails` (#32 do backend); o 401 do Resource Server vem sem corpo (#22 do backend).
- **Tokens somem quando o backend reinicia** (inclusive pelo DevTools): a renovação falha e é preciso entrar de novo.
- **Validação de e-mail** do login e do cadastro recusa e-mails válidos (`+`, apóstrofo, domínio com mais de 4 letras), enquanto o perfil aceita; o usuário pode perder o acesso (issue #1, reproduzida manualmente).
- **Medidor de força da senha** mostra porcentagem e barras erradas (issue #5).
- **Node 22 ou superior** não instala (issue #3).
- `state.from` perde a query string após o login; caminho inválido em `/dashboard` mostra a 404 sem exigir login (issue #19).
- A camada `api/` importa de `routes/`, invertendo as camadas (issue #24).
- O pedido de token não envia `Accept-Language` (issue #20).
- **PowerShell:** aspas duplas dentro de argumentos passados ao `git` ou ao `gh` quebram o comando; use aspas simples por fora e evite aspas internas, ou passe o texto por arquivo.

## 9. Branches, Pull Requests e Lovable

### 9.1 Branches e Pull Requests

| Branch | Papel | Regra |
|---|---|---|
| `main` | Branch padrão e **versão publicada**: é a que o Lovable lê e publica | Recebe só o que veio da `develop`, para publicar o site. Não recebe trabalho direto |
| `develop` | Projeto em desenvolvimento | Destino de todos os Pull Requests e do trabalho do dia a dia |

- Diferente do backend, a `main` do frontend tem o **código completo**, porque é dela que o Lovable publica o site.
- **Pull Requests de contribuição:** partem da `develop`, voltam para ela e entram por **squash**. Se resolvem uma issue, o número vai no nome da branch (por exemplo, `fix/1-validacao-de-email`).
- **Publicar:** a `develop` entra na `main` por Pull Request, com **merge commit** (`gh pr merge --merge`), nunca squash nem rebase. Depois, **Publish → Update** no Lovable.
- Só o mantenedor do projeto atualiza a `main`.
- **Exclusão de branches:**
  - toda correção ou funcionalidade é feita numa branch própria, criada a partir da `develop`, e entra na `develop` por Pull Request;
  - essa branch é apagada no merge para a `develop`, com `gh pr merge <n> --squash --delete-branch`;
  - o merge da `develop` para a `main` é feito só quando o mantenedor decidir, com `gh pr merge <n> --merge`, sem `--delete-branch`: a `develop` nunca é apagada;
  - a exclusão automática de branches do GitHub (*Automatically delete head branches*) fica desligada, porque ela apagou a `develop` no merge para a `main` (PR #32).
- **Pull Requests externos:** nunca baixe um PR externo para a máquina local antes de revisar o diff no GitHub. Teste PRs externos só em ambiente isolado ou com `npm ci --ignore-scripts`.

### 9.2 Lovable

- O Lovable **não é mais usado para editar** o código. Ele só **publica** o site, lendo a `main` a partir da **raiz** e usando o **Bun**.
- A integração com o GitHub continua ligada: os commits na `main` chegam ao Lovable, e uma edição feita lá viraria um commit do bot `gpt-engineer-app[bot]` na `main` (os últimos são de 02/10/2026).
- **Se aparecer um commit novo do bot do Lovable na `main`, avise antes de qualquer outra coisa.** Não o traga para a `develop` sem combinar.
- O site publicado só muda com **Publish → Update** no Lovable.
- Existem **só para o Lovable** (não são sobras do template; não remover): o `package.json` e o `.gitignore` da raiz, a pasta `dist/` da raiz (ignorada) e o `frontend/bun.lock`.
- **`bun.lock`:** o Lovable resolve as dependências na hora do build (`bun install` sem `--frozen-lockfile`), então as versões publicadas podem divergir das do `package-lock.json`. A decisão definitiva fica para a issue #16.
- Para manter a compatibilidade:
  - não mova o projeto para fora de `frontend/` nem altere o `package.json` da raiz sem combinar antes;
  - ao mudar dependências, avise sobre o risco de divergência do `bun.lock` (issue #16);
  - não dependa de recursos que só existem no servidor do Vite (`dev` e `preview`);
  - antes de começar, rode `git fetch` e confira no `git log origin/main` se há commits novos do bot.
- Detalhes: [ENVIRONMENT-AND-SETUP.md](docs/ENVIRONMENT-AND-SETUP.md#arquivos-usados-pela-publicação-no-lovable).

## 10. Regras de trabalho (obrigatórias)

1. **O Claude Code não faz commit nem push**: quem usa a ferramenta faz. Ao fim de cada etapa, pare e sugira a mensagem de commit.
2. **Plano antes de agir.** Em tarefas com várias mudanças, mostre o plano e espere o "ok". Em auditorias e investigações, não altere nada.
3. **Escopo fechado:** corrija só o que foi pedido. Outros problemas encontrados são listados (e podem virar issue), não corrigidos.
4. **Não invente.** Toda afirmação sobre o código precisa ser conferida no código. Cite arquivo e linha. Se não conseguir confirmar, diga que é dúvida.
5. **Preserve os finais de linha.** Não há `.gitattributes`; a cópia de trabalho do Windows mistura CRLF e LF, e ferramentas como `sed` convertem para LF. Confira com `git ls-files --eol`.
6. **Renomeações e movimentações com `git mv`**, para preservar o histórico. O `git mv` já coloca a renomeação na área de commit, mas as edições não: avise para usar `git add .` na raiz.
7. **Ao subir o servidor de desenvolvimento**, encerre apenas os processos que você iniciou, conferindo a porta antes.
8. **Arquivos temporários** (corpos de issue, scripts, relatórios) ficam fora do repositório e são apagados ao final. Se um relatório local precisar ficar na raiz, ignore-o pelo `.git/info/exclude`, nunca pelo `.gitignore` do projeto.
9. **Nunca exponha segredos**: valores de tokens, `client_id`, `client_secret`, senhas ou o conteúdo do `.env.local`, em arquivos, issues ou respostas.
10. **Não edite pelo Lovable** nem altere os arquivos da seção 9.2 sem combinar antes.
11. **Trabalhe na `develop`** (ou numa branch criada a partir dela), nunca direto na `main` (seção 9.1).
12. **PRs externos:** revise o diff no GitHub antes de baixar qualquer coisa; teste só em ambiente isolado ou com `npm ci --ignore-scripts` (seção 9.1).

## 11. Commits (para sugerir)

- Formato: `tipo(escopo): descrição`, em português, minúsculas, verbo no presente da 3ª pessoa, sem ponto final.
- Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `build` e `ci`.
- Exemplos: `fix(categories): usa patch na edição de categoria`, `docs(readme): atualiza a seção de execução`.
- **Sem linha `Co-Authored-By` (nem outra atribuição) de ferramentas de IA.**
- Ao resolver uma issue, cite o número (`Refs #1`). O fechamento automático só acontece na branch padrão (`main`), então as issues resolvidas na `develop` são fechadas manualmente.
- Atenção: os commits antigos e o [CONVENTIONS.md](docs/CONVENTIONS.md) usam inglês no imperativo; o padrão acima vale daqui em diante e é o mesmo descrito no `CONVENTIONS.md`.

## 12. Issues

- Sempre use `--repo Albertinesilva/asjcatalog-frontend` nos comandos `gh`.
- Antes de criar, confira se já existe uma issue igual (`gh issue list --state all`).
- Corpo em português, com as seções: Contexto, Problema, Proposta, Critérios de aceitação, Documentação relacionada e Envolve o backend.
- Labels de tipo: `bug`, `security`, `enhancement`, `tech-debt` (antes `refactor`), `accessibility`, `i18n`, `tests`, `documentation`; de prioridade: `priority: high`, `priority: medium`, `priority: low`; **`backend`** quando a mudança exigir alteração no backend; `production-readiness` para o necessário à produção; e `good first issue` para quem está começando.
- Milestone **Pronto para produção**, como no backend, para o que precisa estar resolvido antes do deploy.
- Links para o código em issues usam *permalink* com o SHA do commit, para não apontarem para linhas que mudaram.
- Ao citar issues do outro repositório, use a referência completa (`Albertinesilva/<repositório>#N`).
- Passe o corpo por arquivo (`--body-file`), com o arquivo temporário fora do repositório.
- Mostre a proposta da issue antes de criar.
- Use os modelos de `.github/ISSUE_TEMPLATE/` (`bug.md` e `melhoria.md`), que já trazem essas seções. O fluxo de contribuição está no [CONTRIBUTING.md](CONTRIBUTING.md).

## 13. Índice da documentação

| Assunto | Onde |
|---|---|
| Visão geral, como executar e menu | [README.md](README.md) |
| Como contribuir, labels, PRs e revisão de PRs externos | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Camadas, fluxo de uma requisição e dependências | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Node, `.env.local`, scripts, proxy, CORS e Lovable | [docs/ENVIRONMENT-AND-SETUP.md](docs/ENVIRONMENT-AND-SETUP.md) |
| Rotas, layouts, guards e rotas usadas por e-mail | [docs/ROUTES-AND-PAGES.md](docs/ROUTES-AND-PAGES.md) |
| Cliente HTTP, interceptors e endpoints | [docs/API-AND-SERVICES.md](docs/API-AND-SERVICES.md) |
| Login, armazenamento, renovação e perfis | [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) |
| Contrato de erro e tratamento por tela | [docs/ERROR-HANDLING.md](docs/ERROR-HANDLING.md) |
| `AuthContext` e `ThemeContext` | [docs/CONTEXTS.md](docs/CONTEXTS.md) |
| Hooks customizados | [docs/HOOKS.md](docs/HOOKS.md) |
| Design system e acessibilidade | [docs/COMPONENTS.md](docs/COMPONENTS.md) |
| Formulários, validações e senha | [docs/FORMS-AND-PASSWORD.md](docs/FORMS-AND-PASSWORD.md) |
| Tailwind, tokens e tema | [docs/STYLING-AND-THEMING.md](docs/STYLING-AND-THEMING.md) |
| i18next e como adicionar textos | [docs/INTERNATIONALIZATION.md](docs/INTERNATIONALIZATION.md) |
| Utilitários e tipos | [docs/UTILS-AND-TYPES.md](docs/UTILS-AND-TYPES.md) |
| Convenções e guia de tela CRUD | [docs/CONVENTIONS.md](docs/CONVENTIONS.md) |
| Testes (estado atual e proposta) | [docs/TESTING.md](docs/TESTING.md) |
| Glossário para iniciantes | [docs/GLOSSARY.md](docs/GLOSSARY.md) |
| Documentação do backend | [backend/docs](https://github.com/Albertinesilva/backend-engineering-journey-java-springboot/tree/develop/docs) |

## 14. Escrita da documentação

- Público: desenvolvedor júnior. Explique cada termo técnico na primeira vez que aparecer e acrescente-o ao `GLOSSARY.md`.
- Conteúdo em português; nomes de arquivos de `docs/` em inglês e maiúsculas.
- Cada documento tem a navegação no topo (`[← README] · [Anterior] · [Próximo]`) na ordem da seção 13. Documento novo exige atualizar os vizinhos e o menu do README.
- Os documentos terminam com **"Cuidados e limitações"**, cada item ligado à issue correspondente (`([#N](URL))`). Ao resolver uma issue, retire ou ajuste esses itens.
- Trechos de código reais e curtos, com o caminho do arquivo antes do bloco. Diagramas em Mermaid quando ajudarem.
- Links relativos dentro de `docs/`. Confira que todos os links e âncoras resolvem antes de concluir.

## 15. Comunicação

- Responda em português do Brasil, de forma clara e didática.
- Ao terminar uma etapa, mostre: o que mudou, o resultado do `tsc`, do build e do lint (quando aplicável), o `git status` e a sugestão de commit.

## 16. Estado atual (atualizar a cada etapa)

Atualizado em 17/10/2026.

- Branch `develop` criada a partir da `main` e já publicada no GitHub; o trabalho acontece nela (seção 9.1).
- Repositório público. Nenhum commit novo do bot do Lovable na `main` desde 02/10/2026.
- Documentação completa em `docs/` e 32 issues abertas (#1 a #31 e #34; #32 e #33 são Pull Requests).
- Padrão de trabalho do backend aplicado: este arquivo, guia de contribuição, Código de Conduta, licença MIT, modelos de issue e de PR, CI (com o lint bloqueando) e ajustes em `docs/`.
- Issues ligadas entre os dois repositórios, com comentários de referência cruzada:
  - novas no frontend: #27 (respostas de erro do backend), #28 (dono dos produtos e categorias), #29 (desativação e reativação de conta), #30 (confirmação da troca de e-mail) e #31 (itens inativos);
  - novas no backend: #46 (link de recuperação com `/auth/reset-password`, par da #26), #47 (revogação do refresh token, par da #11) e #48 (dono dos produtos e categorias, par da #28);
  - issues do backend com a label `frontend`: #2 a #6, #8 a #15, #18, #22, #28, #30, #32, #36, #37, #39, #44, #46, #47 e #48.
- Milestone **Pronto para produção** criado com #1, #11, #13, #28 e #30. As #2, #7 e #18 ficam fora por enquanto.
- **Regra de negócio decidida e ainda não implementada** (#28 aqui e #48 no backend): cada produto e categoria registra quem o cadastrou; o OPERATOR só altera o que cadastrou, e os registros do banco populado, só o ADMIN; categoria associada a produto não pode ser excluída nem desativada por ninguém.
- **Bug corrigido sem issue, na branch `fix/categoria-patch`:** ao salvar uma categoria editada pelo dashboard, `/api/v1/categories/{id}` respondia **500**.
  - Causa: o frontend usava `http.put` (`frontend/src/api/category-api.ts:65`), mas a API só aceita **PATCH** (`@PatchMapping` em `CategoryController.java:216`, no backend).
  - O 500 vem do 405 sem handler no backend (#36 do backend).
  - Correção: `categoryApi.update` usa `http.patch` com `CategoryRequest`, e o `CategoryForm` envia sempre o `name` (`@NotBlank` no `CategoryUpdateRequest` do backend), sem o `id` no corpo.
  - O frontend não tem campo de descrição da categoria; editar o nome mantém a descrição gravada (`description` ausente mantém a atual). O campo será acrescentado na #34.
- Chamadas à API comparadas com a tabela de endpoints do backend: fora a categoria, verbos, rotas e corpos batem. Ficam listados `userApi.register` (rota `/api/v1/users/register` inexistente, sem uso) e `userApi.activate`/`deactivate` tipados como `User`, embora a API responda 204 (#24).
- Próximos passos: abrir o PR da `fix/categoria-patch` para a `develop`; conferir as opções de segurança restantes no GitHub (labels e rulesets já configurados).
- Backend ainda sem deploy; o site do Lovable não exibe dados até isso acontecer.
