[← README](../README.md) · [Arquitetura](ARCHITECTURE.md)

# Glossário

Termos técnicos usados na documentação do frontend do ASJCatalog, em ordem alfabética. Cada documento de `docs/` linka para cá. Novos termos são acrescentados conforme a documentação cresce.

---

**Accept-Language**
Cabeçalho HTTP que informa ao servidor o idioma preferido. O frontend envia o idioma ativo em toda requisição, e a API devolve as mensagens nesse idioma.

**Access token**
Nome em inglês do token de acesso. Veja **Token de acesso**.

**Acessibilidade**
Fazer a interface funcionar para todas as pessoas, inclusive quem navega só pelo teclado ou usa leitor de tela.

**Alias de import**
Atalho para um caminho de pasta. No projeto, `@/` significa `frontend/src/`, então `@/hooks/useAuth` é o mesmo que `frontend/src/hooks/useAuth`.

**API**
*Application Programming Interface*: um conjunto de endereços e regras que um programa oferece para outro usar. Aqui, é o backend ASJCatalog, que o frontend chama para ler e gravar dados.

**API REST**
Estilo de API em que cada recurso (produto, categoria, usuário) tem um endereço, e as ações usam os métodos HTTP: `GET` lê, `POST` cria, `PUT`/`PATCH` alteram, `DELETE` remove.

**ARIA**
*Accessible Rich Internet Applications*: atributos HTML (`role`, `aria-label`, `aria-expanded`, `aria-live`…) que informam às tecnologias assistivas o papel e o estado de um elemento.

**Authorization (cabeçalho)**
Cabeçalho HTTP que leva a credencial da requisição. Nas chamadas comuns, contém `Bearer <token de acesso>`; no pedido de token, contém as credenciais do cliente no formato Basic.

**Barrel**
Arquivo `index.ts` que reexporta vários módulos de uma pasta, para importar tudo de um só lugar. Exemplo: `import { ErrorState, Pagination } from "@/components"`.

**Base64**
Forma de representar qualquer texto usando só letras, números e alguns símbolos. É uma codificação, não criptografia: qualquer um consegue decodificar.

**Basic auth (autenticação Basic)**
Formato de credencial em que usuário e senha são unidos por `:` e codificados em Base64, enviado como `Authorization: Basic …`. O frontend usa esse formato para enviar `client_id` e `client_secret` ao pedir o token.

**Bearer**
Tipo de credencial do cabeçalho `Authorization: Bearer <token>`. Significa "portador": quem apresenta o token é tratado como o dono dele. Por isso, um token copiado pode ser usado por outra pessoa.

**Breadcrumb**
"Trilha de navegação" exibida acima do título, como `Dashboard / Produtos / Editar`. Mostra onde o usuário está e permite voltar aos níveis anteriores.

**Breakpoint**
Largura de tela a partir da qual um estilo com prefixo passa a valer. No Tailwind, `lg:flex` só vale a partir de 1024 px. O projeto usa os breakpoints padrão (`sm`, `md`, `lg`, `xl`, `2xl`).

**Build**
Processo que transforma o código-fonte (TypeScript, JSX, CSS) em arquivos otimizados que o navegador entende. No projeto, `npm run build` gera a pasta `frontend/dist/`.

**Bundle**
O conjunto de arquivos JavaScript e CSS gerado pelo build e enviado ao navegador. Tudo o que está no bundle pode ser lido por quem acessa o site.

**camelCase, PascalCase e kebab-case**
Formas de escrever nomes compostos. camelCase: `usePagedQuery`. PascalCase: `ProductForm`. kebab-case: `api-error-handler.ts`. Há ainda o UPPER_SNAKE_CASE, usado em constantes como `TOKEN_KEY`.

**Chave de tradução**
Identificador de um texto traduzido, no formato `namespace:caminho`, como `auth:login.title`. O código usa a chave, e o arquivo de cada idioma traz o texto.

**Chunk**
Um pedaço do bundle gerado separadamente. Telas carregadas com lazy loading viram chunks próprios, baixados só quando necessários.

**Claim**
Cada informação dentro do payload de um JWT, como `exp` (expiração), `userId` ou `authorities` (perfis).

**Classe utilitária**
Classe CSS que faz uma única coisa, como `flex`, `p-md` ou `text-danger`. O Tailwind é formado por classes utilitárias combinadas no JSX.

**Cliente público (OAuth2)**
Aplicação que não consegue guardar um segredo, porque o código dela fica acessível ao usuário. SPAs que rodam no navegador são clientes públicos.

**Código de status HTTP**
Número que a API devolve para indicar o resultado: `200` (sucesso), `401` (não autenticado ou sessão inválida), `403` (sem permissão), `404` (não encontrado), `500` (erro no servidor).

**Compare-and-swap**
Técnica de "só gravar se o valor ainda for o esperado". Na renovação de sessão, o novo token só é salvo se o refresh token guardado ainda for o mesmo que originou o pedido.

**Context API (Context do React)**
Recurso do React para compartilhar dados com muitos componentes sem passá-los de um em um. O projeto tem `AuthContext` (sessão) e `ThemeContext` (tema).

**Contrato de erro**
Formato combinado entre API e frontend para as respostas de erro: campos como `code`, `message` e `fieldErrors`. O frontend o interpreta em `utils/api-error.ts`.

**Conventional Commits**
Padrão de mensagem de commit no formato `tipo(escopo): descrição`, como `fix(auth): handle invalid credentials on login`. É o padrão dos commits recentes do projeto.

**Cookie**
Pequeno dado que o servidor pede ao navegador para guardar e reenviar nas próximas requisições. O frontend do ASJCatalog não usa cookies para a sessão: ele envia o token no cabeçalho `Authorization`.

**CORS**
*Cross-Origin Resource Sharing*. Regra do navegador que bloqueia chamadas de uma página para outro endereço (outro domínio ou outra porta), a menos que o servidor de destino autorize. A API precisa liberar a origem do frontend.

**CRLF e LF**
Os caracteres que marcam o fim de uma linha de texto. O Windows costuma usar CRLF (`\r\n`); Linux e macOS usam LF (`\n`). A diferença causa os erros `Delete ␍` do lint no Windows.

**CRUD**
*Create, Read, Update, Delete*: as quatro operações básicas sobre um tipo de registro (criar, ler, alterar e excluir). As telas de produtos, categorias e usuários do dashboard são CRUDs.

**Debounce**
Técnica de esperar um tempo sem novas mudanças antes de agir. Na busca, a requisição só sai depois que o usuário para de digitar por 400 ms.

**Deploy**
Publicar a aplicação em um servidor para que outras pessoas possam acessá-la.

**Design system**
Conjunto padronizado de componentes visuais (botões, campos, cards) e regras de estilo (cores, espaçamentos, fontes). No projeto, fica em `frontend/src/components/ui/`.

**Endpoint**
Um endereço específico da API que responde a uma ação. Exemplo: `GET /api/v1/products/7` busca o produto 7.

**engines e engine-strict**
`engines` é o campo do `package.json` que declara as versões de Node aceitas. `engine-strict=true`, no `.npmrc`, faz o npm recusar a instalação quando a versão não combina.

**ESLint**
Ferramenta que analisa o código em busca de erros e de padrões fora das regras do projeto. Roda com `npm run lint`.

**Fallback de idioma**
Idioma usado quando o idioma do usuário não é suportado ou quando falta uma tradução. No projeto, é o `pt-BR`.

**Fallback de SPA**
Configuração do servidor que devolve o `index.html` para qualquer caminho que não seja um arquivo real. Sem ela, abrir diretamente uma URL como `/catalog/7` resulta em 404.

**Fast Refresh**
Recurso do ambiente de desenvolvimento que atualiza a tela ao salvar um arquivo, sem recarregar a página e mantendo o estado dos componentes.

**Focus trap (foco preso)**
Técnica que mantém o foco do teclado dentro de um diálogo enquanto ele está aberto: a tecla Tab circula só entre os elementos do diálogo.

**forwardRef**
Função do React que permite a um componente repassar uma referência (`ref`) para o elemento HTML interno. É o que deixa o React Hook Form acessar o `<input>` dentro do componente `Input`.

**FOUC**
*Flash of Unstyled Content*: um "piscar" da página com o estilo errado antes de o estilo certo ser aplicado. O script de tema do `index.html` evita isso.

**Função pura**
Função que, para a mesma entrada, sempre devolve o mesmo resultado e não causa efeitos fora dela (não mostra alertas, não grava dados). `parseApiError` é um exemplo.

**Genérico (TypeScript)**
Tipo com "parâmetro", escrito como `<T>`, que permite à mesma função ou tipo trabalhar com dados diferentes. Exemplo: `useDebouncedValue<T>` funciona com texto, número ou objeto.

**Grant type**
No OAuth2, a forma de pedir um token. O frontend usa `password` (login com usuário e senha) e `refresh_token` (renovação).

**Guard (proteção de rota)**
Componente que decide se uma rota pode ser exibida. No projeto, `PrivateRoute` exige login e `RoleRoute` exige um perfil.

**Hook**
Função do React que começa com `use` e dá acesso a recursos como estado e contexto. O projeto tem hooks próprios, como `useAuth` e `usePagedQuery`.

**Hook customizado (custom hook)**
Hook escrito pelo próprio projeto, que junta lógica de estado e efeitos reaproveitada por várias telas. Exemplos: `usePagedQuery`, `useResource`.

**HSL**
Forma de descrever uma cor por matiz (*hue*, de 0 a 360), saturação e luminosidade (*lightness*), como `214 51% 25%`. Os tokens de cor do projeto usam esse formato.

**HTTP**
*HyperText Transfer Protocol*: o protocolo usado pelo navegador para conversar com servidores. Cada requisição tem um método (`GET`, `POST`…), um endereço, cabeçalhos e, às vezes, um corpo.

**HttpOnly (cookie)**
Marca de um cookie que impede o JavaScript da página de lê-lo. É uma alternativa mais protegida contra XSS para guardar a sessão, mas exige suporte da API.

**i18n**
Abreviação de *internationalization* (internacionalização): o "i", 18 letras no meio e o "n". É o suporte a vários idiomas. O projeto usa a biblioteca i18next.

**Integração contínua (CI)**
Execução automática de verificações (lint, tipos, testes) a cada envio de código ao repositório. O projeto ainda não tem CI.

**Interceptador**
Função do Axios que roda automaticamente antes de cada requisição ou depois de cada resposta. No projeto, adiciona cabeçalhos e tenta renovar a sessão quando a API responde 401.

**Interceptor**
Nome em inglês do interceptador. Veja **Interceptador**.

**Interpolação**
Substituição de variáveis dentro de um texto traduzido. Em `"Olá, {{name}}"`, o `{{name}}` é trocado pelo valor passado a `t`.

**jsdom**
Biblioteca que simula o navegador (DOM, `window`, `localStorage`) dentro do Node.js, para rodar testes de componentes sem abrir um navegador.

**JSON**
*JavaScript Object Notation*: formato de texto para representar dados, como `{ "id": 7, "name": "Notebook" }`. É o formato usado pela API.

**JWT**
*JSON Web Token*: token em três partes separadas por pontos (cabeçalho, payload e assinatura), cada uma codificada em Base64. O access token da API é um JWT. O frontend lê o payload, mas não verifica a assinatura.

**Layout**
Componente que desenha a "moldura" comum a várias telas (barra de navegação, menu lateral, rodapé) e mostra a tela atual no lugar do `<Outlet />`.

**Lazy loading**
Carregamento sob demanda: o código de uma tela só é baixado quando ela é aberta. Deixa a primeira carga do site mais leve.

**Leitor de tela**
Programa que lê em voz alta o conteúdo da tela para pessoas cegas ou com baixa visão. Depende de rótulos e atributos ARIA para descrever a interface.

**Lint**
Análise automática do código para encontrar erros e inconsistências de estilo, sem executar o programa.

**localStorage**
Armazenamento do navegador que guarda textos por site e não se apaga ao fechar a aba. O projeto guarda nele a sessão, o idioma e o tema.

**Lockfile**
Arquivo que registra as versões exatas de cada dependência instalada, para que todos instalem as mesmas versões. O do npm é o `package-lock.json`.

**Media query**
Condição do CSS (ou do JavaScript, via `matchMedia`) sobre o ambiente, como a largura da tela ou a preferência do sistema por tema escuro (`prefers-color-scheme: dark`).

**Mobile-first**
Forma de escrever estilos começando pelas telas pequenas: as classes sem prefixo valem para o celular, e os prefixos (`md:`, `lg:`) ajustam telas maiores.

**MSW**
*Mock Service Worker*: biblioteca que intercepta requisições e devolve respostas simuladas. Permite testar telas sem a API real.

**Namespace (i18n)**
Grupo de textos de um mesmo assunto, guardado num arquivo próprio por idioma, como `auth.json` ou `products.json`.

**Node.js**
Ambiente que executa JavaScript fora do navegador. É necessário para instalar as dependências e rodar o Vite.

**npm**
Gerenciador de pacotes que vem com o Node.js. Instala as dependências (`npm install`) e roda os scripts (`npm run dev`).

**nvm**
*Node Version Manager*: ferramenta para instalar e alternar entre versões do Node.js. Lê a versão do projeto no arquivo `.nvmrc`.

**OAuth2**
Protocolo de autorização usado pela API para emitir tokens de acesso. O frontend pede o token enviando usuário, senha e as credenciais do cliente.

**Operador `??` (coalescência nula)**
Operador do JavaScript que devolve o valor da esquerda quando ele existe (não é `null` nem `undefined`) e, caso contrário, o da direita. Exemplo: `variavel ?? "padrão"`.

**Origem**
Combinação de protocolo, domínio e porta de um endereço, como `http://localhost:5173`. Para o CORS, mudar qualquer uma dessas partes significa outra origem.

**Outlet**
Componente do React Router que marca onde a rota filha deve aparecer dentro de um layout ou de uma proteção de rota.

**Parâmetro de rota**
Parte variável de uma URL, declarada com `:` na rota. Em `/catalog/:productId`, o valor `7` de `/catalog/7` é o parâmetro `productId`.

**Password grant**
*Grant type* do OAuth2 em que a aplicação envia diretamente o usuário e a senha para obter o token. É o usado pelo ASJCatalog, e as recomendações atuais de segurança (RFC 9700) dizem que ele não deve ser usado.

**Payload**
O "conteúdo" de uma mensagem. Num JWT, é a parte do meio, com os claims. Numa requisição, é o corpo enviado.

**Perfil (role)**
Papel do usuário que define o que ele pode fazer. O frontend conhece `ROLE_ADMIN` (administrador) e `ROLE_OPERATOR` (operador).

**PKCE**
*Proof Key for Code Exchange*: extensão do OAuth2 que protege o fluxo *Authorization Code* em clientes públicos, como SPAs. É o fluxo recomendado hoje para aplicações que rodam no navegador.

**Plural (i18n)**
Escolha automática da forma singular ou plural de um texto conforme a quantidade. No i18next, usa as chaves com sufixo `_one` e `_other` e o valor `count`.

**Pre-commit hook**
Script executado automaticamente antes de cada commit, por exemplo para rodar o lint. O projeto não tem.

**Preflight**
Requisição automática (`OPTIONS`) que o navegador faz antes de certas chamadas para outro endereço, perguntando à API se ela aceita a chamada. Faz parte do CORS.

**Prettier**
Ferramenta que formata o código automaticamente (aspas, espaços, quebras de linha). Roda com `npm run format` e também pelo ESLint.

**Promise**
Objeto do JavaScript que representa um resultado que ainda vai chegar, como a resposta de uma requisição. Usa-se `await` ou `.then()` para obter o valor e `try/catch` ou `.catch()` para tratar o erro.

**Prop drilling**
Passar uma prop por vários níveis de componentes só para que um componente lá embaixo a receba. A Context API evita isso.

**Props**
As "propriedades" passadas a um componente, como os atributos de uma tag HTML. Exemplo: em `<Button variant="danger">`, `variant` é uma prop.

**Provider**
Componente que disponibiliza dados de um Context para todos os componentes dentro dele. Exemplo: `AuthProvider`.

**Proxy**
Servidor intermediário que recebe uma requisição e a repassa para outro destino. O Vite tem um proxy de desenvolvimento para caminhos que começam com `/api/proxy`.

**Query string**
Parte da URL depois do `?`, com pares `chave=valor`. Exemplo: em `/activate-account?token=abc`, a query string é `token=abc`.

**React Hook Form**
Biblioteca de formulários usada no projeto. Registra os campos (`register`), valida os valores e permite marcar erros vindos da API (`setError`).

**React Router**
Biblioteca que liga URLs a componentes React e permite navegar sem recarregar a página.

**React Testing Library**
Biblioteca para testar componentes React do jeito que o usuário os usa: procurando elementos por texto e rótulo, clicando e digitando.

**Refresh token**
Token de longa duração usado para pedir um novo token de acesso quando o atual expira, sem precisar fazer login de novo.

**Regex (expressão regular)**
Padrão de texto usado para verificar ou encontrar trechos, como o formato de um e-mail. Exemplo: `/^\d+$/` aceita só dígitos.

**Relógio simulado (fake timers)**
Recurso das ferramentas de teste que controla `setTimeout` e o tempo atual, permitindo "avançar o relógio" sem esperar de verdade. Útil para testar debounce e renovação agendada.

**RFC**
*Request for Comments*: documentos que definem os padrões da internet. O OAuth2 e suas recomendações de segurança (como a RFC 9700) são publicados como RFCs.

**Rota**
Ligação entre um caminho de URL (por exemplo, `/catalog`) e o componente que deve aparecer.

**Rotação de refresh token**
Regra da API em que cada renovação devolve um refresh token novo e invalida o anterior. Um refresh token só pode ser usado uma vez.

**Service**
No projeto, módulo da pasta `services/` que as telas usam para obter dados. Fica entre as telas (`pages/`) e as chamadas HTTP (`api/`).

**Single-flight**
Padrão que garante uma única execução de uma operação por vez: quem chega enquanto ela está em andamento recebe o mesmo resultado, em vez de disparar outra. É usado na renovação de sessão.

**Skeleton (esqueleto de carregamento)**
Blocos cinzas com o formato aproximado do conteúdo, exibidos enquanto os dados carregam.

**SPA**
*Single Page Application* (aplicação de página única). O navegador carrega uma única página HTML, e a troca de telas é feita pelo JavaScript, sem recarregar.

**SpringPage**
Tipo do frontend (`SpringPage<T>`) que descreve uma página de resultados no formato do Spring, o framework Java do backend: `content`, `totalElements`, `totalPages`, `number` e `size`. `Paginated<T>` é um apelido para ele.

**Suspense**
Componente do React que mostra um conteúdo provisório (o `fallback`) enquanto algo ainda está carregando, como o código de uma tela com lazy loading.

**SweetAlert2**
Biblioteca de janelas de alerta usada no projeto, sempre por meio de `utils/alerts.ts`.

**Tailwind CSS**
Framework de CSS baseado em classes utilitárias, como `flex`, `p-md` e `text-foreground`, aplicadas diretamente no JSX.

**Teste automatizado**
Código que verifica outro código. Os tipos mais comuns: **unitário** (uma função isolada), **de componente** (um componente renderizado), **de integração** (várias partes juntas) e **de ponta a ponta** (*end-to-end*, o sistema inteiro num navegador).

**Timeout**
Tempo máximo de espera por uma resposta. Passado esse tempo, a requisição é cancelada com erro. A instância `http` do projeto não define timeout.

**Token de acesso**
Credencial temporária devolvida pela API no login. É enviada no cabeçalho `Authorization` para provar quem está fazendo a requisição.

**Token de design**
Nome que representa um valor de design, como uma cor ou um espaçamento. No projeto, os tokens de cor são semânticos (`--primary`, `--danger`) e mudam de valor entre os temas claro e escuro.

**TypeScript**
Linguagem que adiciona tipos ao JavaScript. Os tipos são verificados antes da execução (`npx tsc --noEmit`), o que ajuda a achar erros cedo.

**useCallback**
Hook do React que mantém a mesma função entre renderizações enquanto as dependências não mudam. É necessário nos `fetcher`s de `usePagedQuery` e `useResource`, para não disparar buscas a cada renderização.

**useTranslation**
Hook da biblioteca react-i18next que devolve a função `t`, usada para obter os textos traduzidos no idioma ativo.

**Variante**
Versão pré-definida de um componente, escolhida por uma prop. Exemplo: `variant="danger"` no `Button` gera o botão vermelho de ações destrutivas.

**Variável de ambiente**
Valor de configuração definido fora do código, por exemplo em `.env.local`. No Vite, só as variáveis com prefixo `VITE_` chegam ao código do frontend.

**Vite**
Ferramenta de desenvolvimento e build do projeto. Sobe o servidor local (`npm run dev`) e gera os arquivos de produção (`npm run build`).

**Vitest**
Ferramenta de testes feita para projetos com Vite. Reaproveita a configuração do Vite, como o alias `@/`. É a ferramenta sugerida na proposta de testes.

**WCAG**
*Web Content Accessibility Guidelines*: diretrizes de acessibilidade para a web. O nível AA exige, por exemplo, contraste de pelo menos 4,5:1 entre texto normal e fundo.

**x-www-form-urlencoded**
Formato de corpo de requisição com pares `chave=valor` separados por `&`, como nos formulários HTML. É o formato exigido pelo endpoint `/oauth2/token`.

**XSS**
*Cross-Site Scripting*: ataque em que um script malicioso é injetado e executado na página. Esse script consegue ler o que está no `localStorage`, inclusive os tokens.
