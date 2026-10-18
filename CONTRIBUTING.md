# 🤝 Contribuindo para o Projeto

Antes de tudo, obrigado pelo interesse em contribuir com o **ASJCatalog** 🚀

Este repositório é o **frontend** do ASJCatalog: o catálogo público de produtos e o painel administrativo, feitos com React e TypeScript, que consomem a API do [backend](https://github.com/Albertinesilva/backend-engineering-journey-java-springboot).

O projeto é open source e sem fins comerciais. Ele nasceu da base do DSCatalog, do curso DevSuperior, e evoluiu de forma independente como um laboratório de aprendizado.

A proposta não é apenas compartilhar código, mas também incentivar aprendizado colaborativo, troca de conhecimento e construção de um ambiente saudável para desenvolvedores em evolução. **Se você está começando, este guia foi escrito pensando em você.** Os termos técnicos estão explicados no [Glossário](docs/GLOSSARY.md).

---

# 🎯 Objetivo das Contribuições

As contribuições devem ajudar a:

- Melhorar qualidade de código
- Evoluir arquitetura e organização
- Corrigir bugs
- Melhorar a acessibilidade e as traduções
- Aprimorar documentação
- Compartilhar boas práticas
- Tornar o projeto mais didático

---

# 🌿 Como as Branches Funcionam

| Branch | Para que serve | Recebe Pull Request? |
|---|---|---|
| `develop` | Projeto em desenvolvimento, com a documentação em `docs/` | ✅ **Sim, sempre** |
| `main` | Versão publicada do site. Só recebe o que vem da `develop`, pelo mantenedor | ❌ Não |

## Ciclo de vida das branches

- **Toda correção ou funcionalidade é feita numa branch própria**, criada a partir da `develop`, e entra na `develop` por Pull Request.
- **Essa branch é apagada no merge para a `develop`**, que o mantenedor faz com `gh pr merge <n> --squash --delete-branch`.
- **A `develop` nunca é apagada.** O merge da `develop` para a `main` acontece só quando o mantenedor decide publicar, com `gh pr merge <n> --merge`, sem `--delete-branch`.
- A exclusão automática de branches do GitHub (*Automatically delete head branches*) fica **desligada**: ela apagou a `develop` no merge para a `main`, porque a `develop` era a branch de origem daquele Pull Request.

O site é publicado pelo **Lovable**, que lê a `main`. Por isso, o `package.json` e o `.gitignore` da raiz e o `frontend/bun.lock` existem só para ele: **não altere esses arquivos** num Pull Request. A explicação está em [Arquivos usados pela publicação no Lovable](docs/ENVIRONMENT-AND-SETUP.md#arquivos-usados-pela-publicação-no-lovable).

---

# 🔎 Escolhendo uma Issue

As melhorias pendentes estão registradas como [issues](https://github.com/Albertinesilva/asjcatalog-frontend/issues). Cada issue traz:

- **Contexto**: onde acontece e o que existe hoje;
- **Problema**: o que está errado ou falta;
- **Proposta**: o caminho sugerido;
- **Critérios de aceitação**: o que precisa estar pronto para a issue ser considerada resolvida;
- **Documentação relacionada**: os documentos que ajudam a entender o assunto;
- **Envolve o backend**: se a mudança também exige alteração na API.

## Labels

| Label | Significado |
|---|---|
| `good first issue` | Boa para quem está começando no projeto. **Comece por aqui.** |
| `bug` | Algo não funciona como deveria |
| `security` | Vulnerabilidade ou regra de acesso |
| `tech-debt` | Dívida técnica e qualidade de código |
| `accessibility` | Acessibilidade |
| `i18n` | Internacionalização e textos nos três idiomas |
| `tests` | Testes automatizados |
| `documentation` | Melhorias ou acréscimos na documentação |
| `enhancement` | Melhoria ou funcionalidade nova |
| `production-readiness` | Necessário para rodar em produção |
| `backend` | Exige alteração ou verificação no backend |
| `priority: high`, `priority: medium`, `priority: low` | Prioridade |

## Milestones

Os [milestones](https://github.com/Albertinesilva/asjcatalog-frontend/milestones) agrupam as issues por objetivo, como as que precisam ser resolvidas antes de o site ir para produção. São as prioridades do projeto.

## Antes de começar

**Comente na issue dizendo que vai trabalhar nela.** Isso evita que duas pessoas façam a mesma coisa. Se tiver dúvida sobre o caminho, pergunte ali mesmo.

Encontrou um problema que ainda não tem issue? Abra uma nova usando os modelos de **Bug** ou **Melhoria**. Se o problema estiver na API, abra a issue no [repositório do backend](https://github.com/Albertinesilva/backend-engineering-journey-java-springboot/issues).

> [!WARNING]
> Nunca cole em issues, comentários ou Pull Requests valores de tokens, senhas, `client_id`, `client_secret` ou o conteúdo do seu `.env.local`.

---

# 🚀 Como Contribuir

## 1. Faça um Fork

Crie um fork deste repositório para sua conta GitHub.

> [!IMPORTANT]
> Na tela de criação do fork, **desmarque a opção "Copy the `main` branch only"**. A `main` é a versão publicada, e você vai precisar da `develop`.

Se o fork já foi criado só com a `main`, tudo bem: depois do clone (passo 2), traga a `develop` do repositório original:

```bash
git remote add upstream https://github.com/Albertinesilva/asjcatalog-frontend.git
git fetch upstream develop
git checkout -b develop upstream/develop
```

---

## 2. Clone o Projeto

```bash
git clone https://github.com/SEU-USUARIO/asjcatalog-frontend.git
cd asjcatalog-frontend
```

---

## 3. Crie uma Branch a partir da `develop`

Sempre parta da `develop` atualizada:

```bash
git checkout develop
git pull
git checkout -b fix/1-validacao-de-email
```

Utilize nomes claros e descritivos. Se a branch resolve uma issue, coloque o número dela no nome.

Exemplos:

```bash
feature/filtro-por-preco
fix/1-validacao-de-email
docs/atualiza-readme
test/fluxo-de-login
```

---

## 4. Rode o Projeto

Você vai precisar do **Node.js 20.x** (o projeto não instala com Node 22 ou superior) e do **backend rodando**. Todos os comandos npm rodam dentro da pasta `frontend/`:

```bash
cd frontend
cp .env.example .env.local   # no PowerShell: copy .env.example .env.local
npm install
npm run dev
```

> [!CAUTION]
> Nunca rode `npm install` nem os scripts do `package.json` da **raiz**: eles existem só para o Lovable.

O passo a passo completo, com as variáveis de ambiente e o CORS, está em [Ambiente e configuração](docs/ENVIRONMENT-AND-SETUP.md). Para subir o backend, siga o guia [Primeiros Passos](https://github.com/Albertinesilva/backend-engineering-journey-java-springboot/blob/develop/docs/guides/GETTING-STARTED.md) de lá.

---

## 5. Realize as Alterações

Boas práticas esperadas:

- Código limpo, com nomes claros e responsabilidade única
- Seguir as camadas existentes: `pages → services → api` (telas não chamam o cliente HTTP diretamente)
- Todo texto visível passa pelo i18n e existe nos **três idiomas** (pt-BR, en, es), com as mesmas chaves
- Cores e estilos usam os **tokens do design system**, nunca cores fixas, e funcionam nos temas claro e escuro
- Antes de mudar uma chamada à API, confira o contrato nos [guias do backend](https://github.com/Albertinesilva/backend-engineering-journey-java-springboot/tree/develop/docs/guides)
- Ao mudar um comportamento, atualizar o documento correspondente em `docs/`

---

# 🧪 Verificação e Testes

O projeto ainda não tem testes automatizados ([#4](https://github.com/Albertinesilva/asjcatalog-frontend/issues/4)); a proposta está em [Testes](docs/TESTING.md). Até lá, **antes de abrir o Pull Request**, rode dentro de `frontend/`:

```bash
npx tsc --noEmit   # checagem de tipos (o build não verifica tipos)
npm run build      # build de produção
npm run lint       # ESLint com as regras do Prettier
```

No Windows, o `lint` pode acusar erros `Delete ␍`. Eles vêm só da conversão de fim de linha (CRLF) feita pelo Git, não de problemas no código.

Teste também a tela no navegador, com o backend rodando, nos três idiomas e nos dois temas.

---

# 📌 Padrões Utilizados

Todas as convenções do projeto (nomes, componentes, imports, lint e o guia para criar uma tela CRUD) estão em [Convenções](docs/CONVENTIONS.md), e a organização das camadas em [Arquitetura](docs/ARCHITECTURE.md).

## Commits

Prefira commits pequenos e objetivos, no formato:

```text
tipo(escopo): descrição
```

- **tipo**: a natureza da mudança (tabela abaixo);
- **escopo**: opcional, indica a área afetada (por exemplo, `categories`, `auth`, `i18n`, `readme`);
- **descrição**: em português, em letra minúscula, no presente e na terceira pessoa (`adiciona`, `corrige`, `remove`), sem ponto final.

| Tipo | Uso | Exemplo |
|---|---|---|
| `feat` | Funcionalidade nova | `feat(catalog): adiciona filtro por faixa de preço` |
| `fix` | Correção | `fix(categories): usa patch na edição de categoria` |
| `refactor` | Mudança de código sem mudar comportamento | `refactor(api): move a normalização de páginas para um utilitário` |
| `test` | Testes | `test(auth): cobre a renovação do token` |
| `docs` | Documentação | `docs(readme): atualiza a seção de execução` |
| `build` | Build e dependências | `build: atualiza o vite` |
| `ci` | Integração contínua | `ci: adiciona o lint ao workflow` |

Os commits antigos do histórico estão em inglês; o padrão acima vale daqui em diante.

---

# 📥 Pull Requests

> [!IMPORTANT]
> **Abra o Pull Request sempre para a branch `develop`, nunca para a `main`.** Na tela do PR, confira se o campo **base** está como `develop`. A `main` só recebe o que vem da `develop`, para publicar o site.

Antes de abrir um Pull Request:

- Rode `npx tsc --noEmit`, `npm run build` e `npm run lint` em `frontend/`
- Revise o código
- Confira os critérios de aceitação da issue
- Atualize a documentação se necessário

Depois de abrir o Pull Request:

- Confira na aba **Commits** do PR se os seus commits aparecem. Se a lista estiver vazia ou só mostrar commits de outras pessoas, faltou o `git push` da sua branch.
- O CI roda a checagem de tipos, o build e o lint automaticamente no GitHub. Para colaboradores externos, o mantenedor precisa liberar a execução do CI em todo Pull Request, não só no primeiro, então pode levar um tempinho até a verificação começar.
- O merge só acontece com o CI passando e depois da revisão do mantenedor. Os Pull Requests entram na `develop` por **squash** (todos os commits viram um só).

Na descrição do PR, cite a issue com `Refs #número` (por exemplo, `Refs #1`). O modelo de PR já traz esse campo.

## Fechamento das issues

O GitHub só fecha uma issue automaticamente (com palavras como `Closes #1` ou `Fixes #1`) quando o Pull Request entra na **branch padrão** do repositório, que aqui é a `main`. Como os PRs entram na `develop`, **a issue não fecha sozinha**: ela será fechada manualmente pelo mantenedor depois que o PR for aceito na `develop`.

---

# 🔒 Revisão de Pull Requests Externos

Esta seção vale para quem revisa Pull Requests de outras pessoas. Um PR pode trazer código malicioso, inclusive em dependências ou em scripts que rodam durante o `npm install`.

- **Nunca baixe um PR externo para a sua máquina antes de revisar o diff no GitHub**, na aba **Files changed**. Dê atenção especial a mudanças no `package.json`, nos lockfiles, no `.npmrc`, no `vite.config.ts` e em `.github/`.
- **Teste PRs externos só em ambiente isolado** (por exemplo, um container ou uma máquina virtual descartável) **ou instale as dependências com `npm ci --ignore-scripts`**, que não executa os scripts de instalação dos pacotes. Se o build falhar por falta de algum desses scripts, use o ambiente isolado.
- O CI do GitHub roda num ambiente isolado e usa o evento `pull_request`, sem acesso a segredos do repositório.

---

# 💬 Discussões e Sugestões

Sugestões de melhoria são muito bem-vindas. Abra uma issue para conversar sobre:

- Organização de projeto
- Arquitetura
- Acessibilidade
- Experiência de uso
- Testes
- Performance
- Segurança
- Documentação

---

# 🎓 Filosofia do Projeto

Este repositório prioriza:

- Aprendizado contínuo
- Evolução incremental
- Clareza arquitetural
- Fundamentos sólidos
- Qualidade de código
- Engenharia de software aplicada

Mais importante do que apenas “fazer funcionar” é entender profundamente o que está sendo construído.

Ao participar, siga o [Código de Conduta](CODE_OF_CONDUCT.md). As contribuições são publicadas sob a [licença MIT](LICENSE) do projeto.

---

# 🚀 Obrigado por contribuir

Toda contribuição — seja código, documentação, correção ou sugestão — ajuda a fortalecer este projeto e a jornada de aprendizado compartilhada aqui.
