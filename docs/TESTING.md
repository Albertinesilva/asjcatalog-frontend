[← README](../README.md) · [Anterior](CONVENTIONS.md) · [Próximo](GLOSSARY.md)

# Testes

Este documento descreve o estado dos testes automatizados do frontend e propõe uma estratégia para começar. Você vai ver o que existe hoje, as ferramentas sugeridas, os tipos de teste e o que cada um cobriria, as áreas que devem ser testadas primeiro (com base nos riscos encontrados durante a documentação) e um exemplo de como seria um primeiro teste.

## Onde fica no código

Não há arquivos de teste, configuração de testes nem script de testes no projeto.

## Estado atual

**O projeto não tem testes automatizados.**

- Não há arquivos `*.test.ts`, `*.test.tsx`, `*.spec.*` nem pastas `__tests__`.
- Não há ferramenta de teste instalada no `package.json` (nenhum Vitest, Jest, Testing Library, Playwright ou Cypress).
- Não há script `test` em `package.json` nem integração contínua (CI) que rode verificações.
- As verificações disponíveis são o lint (`npm run lint`) e a checagem de tipos (`npx tsc --noEmit`), descritas em [CONVENTIONS.md](CONVENTIONS.md#lint-e-formatação). Elas encontram erros de tipo e de padrão, mas não verificam o **comportamento** do sistema.

Hoje, qualquer mudança só é verificada manualmente, no navegador.

## Proposta de estratégia

> [!NOTE]
> **Proposta, ainda não implementada.** Nada desta seção existe no projeto. Antes de adotar, é preciso escolher versões compatíveis com o Vite 5 e o Node 20 do projeto e registrar as dependências no `package.json`. ([#4](https://github.com/Albertinesilva/asjcatalog-frontend/issues/4))

### Ferramentas sugeridas

| Ferramenta | Papel | Por que combina com o projeto |
| --- | --- | --- |
| **Vitest** | Executa os testes e faz as verificações (`expect`) | Usa a mesma configuração do Vite, inclusive o alias `@/`, e entende TypeScript sem passo extra |
| **jsdom** | Simula o navegador (DOM, `localStorage`, `window`) dentro do Node | O código depende de `window`, `localStorage` e `document` |
| **React Testing Library** (com `user-event` e `jest-dom`) | Renderiza componentes e interage como um usuário (clicar, digitar) | Incentiva testes pelo que o usuário vê, aproveitando os rótulos e atributos ARIA que o projeto já usa |
| **MSW** (*Mock Service Worker*) | Simula a API, respondendo às requisições do Axios | Permite testar telas e o interceptador sem backend, inclusive respostas 401, 404, 409 e 429 |

Mais adiante, um teste de ponta a ponta (*end-to-end*) com um navegador real, como o Playwright, poderia cobrir o login completo contra a API.

### Tipos de teste

| Tipo | O que é | O que cobriria no projeto |
| --- | --- | --- |
| **Unitário** | Testa uma função isolada, sem React | `utils/password.ts`, `utils/api-error.ts`, `utils/ui-error.ts`, `utils/permissions.ts`, `utils/storage.ts`, `routes/route-access.ts`, `i18n/http.ts` |
| **De hook** | Testa um hook com `renderHook` | `useDebouncedValue` (com relógio simulado), `usePagination`, `usePagedQuery`, `useResource` |
| **De componente** | Renderiza um componente e verifica o resultado e as interações | `PasswordStrength`, `PasswordRequirements`, `Input`, `ConfirmDialog` (foco e Escape), `Pagination`, `Authorization`, `ErrorState` |
| **De integração** | Junta várias peças, com a API simulada pelo MSW | Login com redirecionamento, renovação de sessão no interceptador, lista com busca e paginação, guardas de rota |

### Áreas prioritárias

A ordem abaixo segue os riscos encontrados durante a documentação. Cada item cita o documento onde o risco foi descrito.

| Prioridade | Área | O que testar | Por quê |
| --- | --- | --- | --- |
| 1 | **Renovação de sessão com chamadas concorrentes** (`api/auth-api.ts`, `contexts/AuthContext.tsx`) | Várias chamadas a `refreshSession()` ao mesmo tempo geram **uma** requisição; resultado descartado quando o refresh token muda no meio (`STALE_REFRESH_DISCARDED`); resposta sem `access_token`; renovação agendada pelo `AuthContext` | Lógica delicada, com rotação de token, e um possível problema com várias abas ([AUTHENTICATION.md](AUTHENTICATION.md#cuidados-e-limitações)) |
| 2 | **Tratamento de 401** (`api/axios.ts`) | Repete a requisição uma única vez após renovar; não renova sem refresh token; encerra a sessão só se ela não mudou; redireciona ao login só em rota privada | Um erro aqui desloga o usuário sem motivo ou cria repetições infinitas ([API-AND-SERVICES.md](API-AND-SERVICES.md#resposta-trata-o-401)) |
| 3 | **Validação de senha e medidor de força** (`utils/password.ts`, `PasswordStrength`) | Cada um dos 9 critérios, níveis de força, mensagens de `buildPasswordValidation` e a porcentagem do medidor | O medidor já mostra valores errados (até 180%) ([FORMS-AND-PASSWORD.md](FORMS-AND-PASSWORD.md#medidor-de-força)) |
| 4 | **Regex de e-mail** | Endereços válidos (`+`, apóstrofo, domínios longos) e inválidos, nas telas de login, cadastro e perfil | A regex atual impede usuários válidos de se cadastrar e de entrar ([FORMS-AND-PASSWORD.md](FORMS-AND-PASSWORD.md#validação-de-e-mail)). Hoje ela está escrita dentro das páginas; extraí-la para uma função facilitaria o teste |
| 5 | **`parseApiError` e `handleApiError`** (`utils/`) | Normalização de cada formato de erro; erros por campo chegando ao formulário; retorno `false` em falha de rede; campo inexistente no formulário | Todas as telas dependem desse caminho, e há casos em que o erro some ([ERROR-HANDLING.md](ERROR-HANDLING.md#cuidados-e-limitações)) |
| 6 | **Guardas de rota** (`PrivateRoute`, `RoleRoute`) | Tela de carregamento enquanto `loading`; redirecionamento para o login com `state.from`; redirecionamento sem o perfil exigido | Controlam o acesso às áreas privadas ([ROUTES-AND-PAGES.md](ROUTES-AND-PAGES.md#proteções-de-rota)) |

Depois dessas, valem: `usePagedQuery` (filtros, página além do fim, requisição extra), a paginação do catálogo e uma verificação automática de chaves de tradução nos três idiomas ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#mantendo-os-três-idiomas-consistentes)).

### Exemplo: primeiro teste de uma função pura

> [!NOTE]
> **Exemplo ilustrativo.** Este arquivo **não existe** no projeto. Ele mostra como seria um primeiro teste, com Vitest, da função `evaluatePassword` de `frontend/src/utils/password.ts`. Uma **função pura** é o melhor ponto de partida: não precisa de React, de navegador nem de API.

Arquivo sugerido: `frontend/src/utils/password.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { evaluatePassword, hasNumericSequence } from "@/utils/password";

describe("hasNumericSequence", () => {
  it("detecta 6 dígitos consecutivos, crescentes ou decrescentes", () => {
    expect(hasNumericSequence("abc123456")).toBe(true);
    expect(hasNumericSequence("987654")).toBe(true);
  });

  it("ignora sequências menores que 6", () => {
    expect(hasNumericSequence("12345x")).toBe(false);
  });
});

describe("evaluatePassword", () => {
  it("classifica como forte uma senha que atende os 5 critérios principais", () => {
    const result = evaluatePassword("Xy7#mQ2!pLz");
    expect(result.strength).toBe("strong");
    expect(result.length && result.uppercase && result.number && result.special).toBe(true);
  });

  it("recusa senha comum, sem diferenciar maiúsculas", () => {
    expect(evaluatePassword("Admin123").noCommon).toBe(false);
  });

  it("recusa senha com o nome da pessoa quando há contexto", () => {
    const result = evaluatePassword("Mariana#2024x", { firstName: "Mariana" });
    expect(result.noPersonalData).toBe(false);
  });
});
```

Como ler o exemplo:

- `describe` agrupa os testes de uma função, e `it` descreve **um** comportamento esperado.
- `expect(valor).toBe(esperado)` falha o teste se o valor for diferente.
- Cada teste usa um dado de entrada simples e verifica **uma** regra. Quando um teste falha, fica claro qual regra quebrou.

Para rodar um arquivo assim, seria preciso instalar o Vitest, acrescentar um script `"test": "vitest"` ao `package.json` e executar `npm test` dentro de `frontend/`.

## Cuidados e limitações

- **Tudo nesta página, exceto "Estado atual", é proposta.** Nenhuma ferramenta, configuração ou arquivo de teste foi criado. ([#4](https://github.com/Albertinesilva/asjcatalog-frontend/issues/4))
- **Dependências novas exigem atenção:** o projeto exige Node 20 (`engine-strict`) e tem dois lockfiles (veja [ENVIRONMENT-AND-SETUP.md](ENVIRONMENT-AND-SETUP.md#instalação)). Instale com o gerenciador adotado pelo projeto (npm) e confira a compatibilidade das versões. ([#3](https://github.com/Albertinesilva/asjcatalog-frontend/issues/3), [#16](https://github.com/Albertinesilva/asjcatalog-frontend/issues/16))
- **Código que depende do navegador:** `storage.ts`, `permissions.ts`, o interceptador e o `AuthContext` usam `window`, `localStorage` e eventos. Os testes precisam de um ambiente que simule o navegador (como o jsdom) e de limpar o `localStorage` entre os testes.
- **Redirecionamento com recarga:** o interceptador usa `window.location.assign("/auth/login")`, que precisa ser simulado nos testes.
- **Timers:** a renovação agendada, o debounce e o tempo de espera de reenvio dependem do relógio. Os testes devem usar relógio simulado (*fake timers*).
- **i18n nos testes de componente:** os componentes usam `useTranslation`. Importar `@/i18n/config` no arquivo de preparação dos testes deixa os textos disponíveis; o detector de idioma, no jsdom, pode escolher um idioma diferente de `pt-BR`.

## Veja também

- [CONVENTIONS.md](CONVENTIONS.md): lint, checagem de tipos e o checklist de uma tela nova.
- [AUTHENTICATION.md](AUTHENTICATION.md), [ERROR-HANDLING.md](ERROR-HANDLING.md) e [FORMS-AND-PASSWORD.md](FORMS-AND-PASSWORD.md): onde os riscos prioritários estão descritos.
- [GLOSSARY.md](GLOSSARY.md): significado dos termos técnicos usados aqui.
