# ASJCatalog — Frontend

O **ASJCatalog** é uma plataforma para gestão e organização de catálogos de produtos.

Este repositório contém o **frontend**: uma SPA (*Single Page Application*, aplicação de página única) que consome a **API ASJCatalog** e oferece duas áreas:

- **Catálogo público**: qualquer visitante navega pelos produtos, busca e vê detalhes.
- **Painel administrativo**: usuários autenticados gerenciam produtos, categorias e usuários.

Repositório: <https://github.com/Albertinesilva/asjcatalog-frontend>

---

## Sumário

1. [Funcionalidades](#funcionalidades)
2. [Stack](#stack)
3. [Pré-requisitos](#pré-requisitos)
4. [Como executar](#como-executar)
5. [Variáveis de ambiente](#variáveis-de-ambiente)
6. [Estrutura de pastas](#estrutura-de-pastas)
7. [Arquitetura em resumo](#arquitetura-em-resumo)
8. [Limitações conhecidas e próximos passos](#limitações-conhecidas-e-próximos-passos)
9. [Documentação](#documentação)
10. [Autor](#autor)

---

## Funcionalidades

- **Página inicial** com apresentação da plataforma e carrossel de categorias.
- **Catálogo público** com busca por nome, filtro por categoria, paginação e página de detalhes do produto.
- **Autenticação**: login, renovação automática da sessão e logout.
- **Cadastro e ativação de conta** por e-mail, com reenvio do link de ativação (intervalo mínimo de 60 segundos entre reenvios).
- **Recuperação e redefinição de senha**, com lista de requisitos e medidor de força da senha.
- **Painel administrativo (dashboard)**:
  - visão geral com totais e atalhos;
  - cadastro, edição, listagem e exclusão de **produtos** e **categorias**;
  - gestão de **usuários** (somente administradores).
- **Perfil do usuário**: edição de dados pessoais e troca de senha.
- **Controle de acesso por perfil**: telas e botões aparecem conforme o papel do usuário.
- **Três idiomas**: português (pt-BR, padrão), inglês (en) e espanhol (es).
- **Tema claro, escuro ou do sistema**, com a preferência salva no navegador.

---

## Stack

| Camada | Tecnologia | Versão |
| --- | --- | --- |
| Linguagem | TypeScript | 5.8 |
| Interface | React | 19.2 |
| Build e servidor de desenvolvimento | Vite | 5.4 |
| Rotas | React Router | 6.30 |
| Requisições HTTP | Axios | 1.16 |
| Formulários | React Hook Form | 7.77 |
| Estilo | Tailwind CSS | 3.4 |
| Tradução (i18n) | i18next / react-i18next | 26 / 17 |
| Alertas | SweetAlert2 | 11 |
| Leitura do token JWT | jwt-decode | 4 |

> **i18n** = internacionalização (suporte a vários idiomas).
> **JWT** = *JSON Web Token*, o token de acesso devolvido pela API no login.

---

## Pré-requisitos

- **Node.js 20.x** (testado com 20.10.0; o arquivo `frontend/.nvmrc` indica a versão).
  O projeto aceita **somente** a série 20: o `package.json` define `"engines": { "node": "^20.10.0" }` e o `.npmrc` ativa `engine-strict=true`. Com Node 22 ou superior, o `npm install` é recusado.
  Se você usa o [nvm](https://github.com/nvm-sh/nvm), rode `nvm use` dentro de `frontend/`.
- **npm** (instalado junto com o Node).
- **API ASJCatalog rodando** e acessível pelo navegador. Sem ela, o catálogo fica vazio e o login não funciona.
  O frontend chama a API diretamente, então a API precisa permitir **CORS** (*Cross-Origin Resource Sharing*, a liberação de chamadas vindas de outro endereço) para o endereço do frontend, por exemplo `http://localhost:5173`.

---

## Como executar

Todo o código do frontend fica na pasta `frontend/`. Os comandos abaixo partem da **raiz do repositório**.

```bash
# 1. Clonar o repositório
git clone https://github.com/Albertinesilva/asjcatalog-frontend.git
cd asjcatalog-frontend

# 2. Entrar na pasta do projeto
cd frontend

# 3. Criar seu arquivo de ambiente a partir do exemplo
cp .env.example .env.local
#    (no PowerShell do Windows: copy .env.example .env.local)
#    Depois, abra .env.local e preencha os valores.

# 4. Instalar as dependências
npm install

# 5. Subir o servidor de desenvolvimento
npm run dev
```

Abra no navegador o endereço exibido no terminal (por padrão, `http://localhost:5173`).

> Por que `.env.local` e não `.env`? O `frontend/.gitignore` ignora o `.env` e todos os `.env.*`, inclusive o `.env.local`. A única exceção é o `.env.example`, que é o modelo versionado. Assim, nenhum arquivo com valores reais entra em commits. Entre os arquivos lidos pelo Vite, o `.env.local` tem prioridade sobre o `.env`, o que o torna o lugar indicado para os valores da sua máquina.

### Scripts disponíveis

Execute dentro de `frontend/` com `npm run <script>`.

| Script | O que faz |
| --- | --- |
| `dev` | Sobe o servidor de desenvolvimento do Vite, com recarregamento automático. |
| `build` | Gera a versão de produção na pasta `dist/`. |
| `build:dev` | Gera o build em modo *development*. |
| `preview` | Serve localmente o conteúdo de `dist/` para conferir o build. |
| `lint` | Analisa o código com ESLint (inclui as regras do Prettier). |
| `format` | Formata todos os arquivos com Prettier (altera os arquivos). |

> O `build` não verifica os tipos do TypeScript. Para isso, rode `npx tsc --noEmit` dentro de `frontend/`.
> No Windows, o `lint` pode acusar erros `Delete ␍`. Eles vêm só da conversão de fim de linha (CRLF) feita pelo Git, não de problemas no código.

---

## Variáveis de ambiente

Os nomes e um exemplo de preenchimento estão em [`frontend/.env.example`](frontend/.env.example).

| Variável | Para que serve |
| --- | --- |
| `VITE_API_BASE_URL` | Endereço base da API ASJCatalog (sem barra no final). |
| `VITE_CLIENT_ID` | Identificador do cliente OAuth2 cadastrado na API, usado no login. |
| `VITE_CLIENT_SECRET` | Senha do cliente OAuth2 correspondente, usada no login. |

> **Atenção:** toda variável com prefixo `VITE_` é embutida no JavaScript enviado ao navegador, e qualquer pessoa pode lê-la.
> Não coloque segredos de verdade nessas variáveis. Defina sempre as três, inclusive no build de produção.
>
> **OAuth2** é o protocolo de autorização usado pela API para emitir os tokens de acesso.

---

## Estrutura de pastas

```text
asjcatalog-frontend/
├── README.md
├── package.json           # Usado só pelo Lovable para publicar o site (repassa comandos para frontend/)
├── .gitignore             # Ignora o que o Lovable ou uma instalação por engano criam na raiz
├── docs/                  # Documentação técnica (um arquivo por assunto)
└── frontend/
    ├── public/            # Arquivos servidos como estão (ícones, manifesto, robots.txt)
    ├── index.html         # Página HTML base da SPA
    ├── .env.example       # Modelo das variáveis de ambiente
    └── src/
        ├── api/           # Chamadas HTTP à API (Axios) e interceptadores de requisição
        ├── assets/        # Imagens usadas pelas telas
        ├── components/    # Componentes reutilizáveis (ui/ = design system, shared/, forms/)
        ├── contexts/      # Estado global: autenticação (AuthContext) e tema (ThemeContext)
        ├── hooks/         # Hooks customizados (auth, perfis, paginação, debounce, carga de dados)
        ├── i18n/          # Configuração de idiomas e arquivos de tradução (pt-BR, en, es)
        ├── layouts/       # Estruturas de página: pública, autenticação e dashboard
        ├── pages/         # Telas da aplicação, uma por rota
        ├── routes/        # Mapa de rotas e proteções de acesso
        ├── services/      # Camada entre as telas e a api/
        ├── styles/        # CSS global e tokens de cor (tema claro e escuro)
        ├── types/         # Tipos TypeScript dos dados trocados com a API
        ├── utils/         # Utilitários: constantes, armazenamento, senha, alertas, erros
        ├── App.tsx        # Composição dos providers e das rotas
        └── main.tsx       # Ponto de entrada da aplicação
```

> [!NOTE]
> O `package.json` e o `.gitignore` da raiz existem apenas para o **Lovable**, plataforma que publica o site a partir deste repositório. Eles não são usados no desenvolvimento local, que é feito dentro de `frontend/` com o npm. A explicação completa está em [Arquivos usados pela publicação no Lovable](docs/ENVIRONMENT-AND-SETUP.md#arquivos-usados-pela-publicação-no-lovable).

O alias `@/` aponta para `frontend/src/`. Exemplo: `import { useAuth } from "@/hooks/useAuth"`.

---

## Arquitetura em resumo

- **Fluxo de dados:** `pages → services → api`. A tela chama um *service*, que chama a função de `api/`, que faz a requisição com Axios.
- **Interceptadores do Axios:** adicionam o token (`Authorization: Bearer …`) e o idioma ativo (`Accept-Language`) em toda requisição. Quando a API responde **401** (não autorizado), tentam renovar a sessão uma vez antes de desistir.
- **Contexts:** o `AuthContext` guarda quem está logado e seus perfis e renova o token pouco antes de ele expirar; o `ThemeContext` guarda o tema escolhido. As telas acessam esses dados pelos hooks `useAuth`, `useRoles` e `useTheme`.
- **Rotas:**
  - **públicas:** `/`, `/catalog`, `/catalog/:productId` e as telas de autenticação em `/auth/*`;
  - **privadas** (exigem login): `/dashboard/*` e `/account/profile/*`.
- **Perfis de acesso:**
  - `ROLE_OPERATOR`: cria e edita produtos e categorias;
  - `ROLE_ADMIN`: tudo o que o operador faz, mais excluir registros e gerenciar usuários (`/dashboard/users`).
- O controle por perfil no frontend só esconde telas e botões. Quem garante a segurança de verdade é a API.

---

## Limitações conhecidas e próximos passos

- **Somente Node 20.x:** o `npm install` não roda em versões mais novas. Próximo passo: revisar o campo `engines`. ([#3](https://github.com/Albertinesilva/asjcatalog-frontend/issues/3))
- **Tokens no `localStorage`:** o token de acesso e o de renovação ficam no armazenamento do navegador, que fica exposto se houver uma falha de XSS (*Cross-Site Scripting*, injeção de script na página). Próximo passo: avaliar outra forma de guardar a sessão junto com a API. ([#2](https://github.com/Albertinesilva/asjcatalog-frontend/issues/2))
- **Sem testes automatizados:** ainda não há testes nem ferramenta de teste configurada. Próximo passo: começar pelos fluxos de login e renovação de sessão e pela validação de senha. ([#4](https://github.com/Albertinesilva/asjcatalog-frontend/issues/4))

A lista completa de melhorias e correções planejadas está nas [issues abertas](https://github.com/Albertinesilva/asjcatalog-frontend/issues).

---

## Documentação

A documentação técnica fica na pasta [`docs/`](docs/), com um arquivo por assunto. A ordem abaixo é a de leitura recomendada; cada documento tem links "Anterior" e "Próximo".

1. [Arquitetura](docs/ARCHITECTURE.md): camadas do projeto, caminho de uma requisição e papel de cada pasta.
2. [Ambiente e configuração](docs/ENVIRONMENT-AND-SETUP.md): Node 20, variáveis de ambiente, scripts, proxy, CORS, build e deploy.
3. [Rotas e páginas](docs/ROUTES-AND-PAGES.md): mapa de rotas, layouts, rotas protegidas e perfis exigidos.
4. [API e services](docs/API-AND-SERVICES.md): instância HTTP, interceptadores e tabela de endpoints consumidos.
5. [Autenticação](docs/AUTHENTICATION.md): login OAuth2, armazenamento e renovação da sessão, logout e perfis.
6. [Tratamento de erros](docs/ERROR-HANDLING.md): como os erros da API são interpretados e exibidos.
7. [Contexts](docs/CONTEXTS.md): `AuthContext` e `ThemeContext`.
8. [Hooks](docs/HOOKS.md): hooks customizados, com assinatura e exemplos.
9. [Componentes](docs/COMPONENTS.md): design system, componentes compartilhados e acessibilidade.
10. [Formulários e senha](docs/FORMS-AND-PASSWORD.md): React Hook Form, validação de senha e de e-mail.
11. [Estilo e tema](docs/STYLING-AND-THEMING.md): Tailwind, tokens de cor e modo escuro.
12. [Internacionalização](docs/INTERNATIONALIZATION.md): idiomas, namespaces e como manter as traduções.
13. [Utilitários e tipos](docs/UTILS-AND-TYPES.md): funções de `utils/` e tipos de `types/`.
14. [Convenções](docs/CONVENTIONS.md): nomes, lint, commits e o guia para criar uma tela CRUD.
15. [Testes](docs/TESTING.md): estado atual e proposta de estratégia de testes.

Consulta: [Glossário](docs/GLOSSARY.md), com os termos técnicos usados na documentação.

---

## Autor

Desenvolvido por **Albert Silva de Jesus**.
