[← README](../README.md) · [Anterior](COMPONENTS.md) · [Próximo](STYLING-AND-THEMING.md)

# Formulários e senha

Este documento mostra como os formulários do ASJCatalog funcionam. Você vai ver o padrão de uso do React Hook Form, a lista de formulários e suas regras, a validação de senha (critérios, medidor de força e componentes), a validação de e-mail e seus limites, outros comportamentos (como o tempo de espera para reenviar e-mail) e como criar um formulário novo.

## Onde fica no código

| Arquivo | Papel |
| --- | --- |
| `frontend/src/pages/**` | Os formulários (cada tela declara o próprio `useForm` e as regras dos campos) |
| `frontend/src/utils/password.ts` | Regras de senha: `evaluatePassword`, `buildPasswordValidation`, `PASSWORD_CRITERIA`, limites de tamanho |
| `frontend/src/components/forms/password/` | `PasswordField`, `PasswordRequirements`, `PasswordStrength`, `PasswordMatch` |
| `frontend/src/components/ui/` | `Input`, `Select`, `Textarea`, `Button` (veja [COMPONENTS.md](COMPONENTS.md#design-system-ui)) |
| `frontend/src/utils/storage.ts`, `frontend/src/utils/constants.ts` | E-mail pendente de ativação e tempo de espera de reenvio |
| `frontend/src/i18n/locales/*/validation.json` | Mensagens de validação traduzidas |

## React Hook Form no projeto

O **React Hook Form** (RHF) controla os valores, a validação e os erros dos formulários. O projeto **não** usa bibliotecas de esquema como Zod ou Yup: as regras são escritas direto no `register` de cada campo, com as opções do próprio RHF (`required`, `pattern`, `maxLength`, `min`, `validate`).

### Exemplo completo: formulário de categoria

O `CategoryForm` é o formulário mais simples e mostra todas as partes do padrão.

**1. Criar o formulário com `useForm`**, tipando os campos e definindo valores iniciais:

`frontend/src/pages/dashboard/categories/CategoryForm.tsx`

```tsx
type FormFields = { name: string };
type Props = { mode: "create" | "edit" };

export default function CategoryForm({ mode }: Props) {
  const { t } = useTranslation(["categories", "validation"]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ defaultValues: { name: "" } });
```

**2. No modo de edição, carregar o registro e preencher o formulário** com `reset`:

```tsx
  const { state, reload } = useResource(mode === "edit" && !invalidEditId ? fetchCategory : null);

  useEffect(() => {
    if (state.status === "success") reset({ name: state.data.name });
  }, [state, reset]);
```

**3. Registrar os campos e mostrar os erros.** O `register` liga o campo ao RHF e recebe as regras; `errors.<campo>.message` é passado ao `Input`, que exibe a mensagem abaixo do campo:

```tsx
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
        <Input
          label={t("categories:form.name")}
          required
          error={errors.name?.message}
          {...register("name", { required: t("validation:nameRequired") })}
        />
```

**4. Enviar.** O `handleSubmit` valida tudo e só chama `onSubmit` se não houver erro. Em caso de falha da API, os erros vão para `handleApiError`:

```tsx
  const onSubmit = async (data: FormFields) => {
    setSaveError(null);
    try {
      if (mode === "create") {
        await categoryService.create({ name: data.name });
        ...
      }
      navigate("/dashboard/categories");
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof FormFields, error),
        fallbackTitle: t("categories:form.failTitle"),
      });
      if (!handled) setSaveError(getUiErrorMessage(err));
    }
  };
```

*(Trecho resumido: os `...` indicam linhas omitidas.)*

**5. Estado de envio.** `isSubmitting` fica `true` enquanto o `onSubmit` está rodando. O botão usa isso para mostrar o carregamento e trocar o texto:

```tsx
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? t("categories:form.submitting") : t("categories:form.submit")}
          </Button>
```

### Padrões que se repetem

- **`noValidate` em todos os `<form>`:** desliga a validação nativa do navegador (balões de "preencha este campo"). Toda a validação vem do RHF, então atributos como `required` e `type="email"` no `Input` servem só para a aparência e a acessibilidade, não para bloquear o envio.
- **Mensagens traduzidas:** as regras recebem textos de `t("validation:...")`, do namespace `validation`.
- **`watch`** lê o valor atual de um campo enquanto o usuário digita. É usado para comparar senha e confirmação e para alimentar os indicadores de senha.
- **Erros gerais** (que não são de um campo) usam `setError("root", ...)` e são exibidos acima do botão, como no login.
- **Botão desabilitado durante o envio:** o `Button` com `loading` fica desabilitado, o que evita envio duplo.

## Formulários do projeto

| Tela | Campos | Regras (todas no próprio arquivo, exceto as de senha) |
| --- | --- | --- |
| `LoginPage` | `username` (e-mail), `password` | E-mail obrigatório e com formato; senha obrigatória |
| `RegisterPage` | `firstName`, `lastName`, `email`, `password`, `passwordConfirm` | Nome e sobrenome obrigatórios, até 80 caracteres; e-mail obrigatório e com formato; senha com `buildPasswordValidation` (com dados pessoais); confirmação obrigatória e igual à senha |
| `RecoverPage` | `email`, `emailConfirm` | E-mail obrigatório e com formato; confirmação obrigatória e igual |
| `ResetPasswordPage` | `password`, `confirmPassword` | Senha com `buildPasswordValidation` (sem dados pessoais); confirmação obrigatória e igual. O token vem da URL |
| `ActivationPendingPage` | `email` | Obrigatório e com formato (mensagens escolhidas pelo tipo do erro) |
| `PersonalProfilePage` | `firstName`, `lastName`, `email` | Nome e sobrenome obrigatórios, até 100 caracteres; e-mail obrigatório, com formato (regex diferente) e até 255 caracteres. Os valores são enviados sem espaços nas pontas (`trim`) |
| `SecurityProfilePage` | `currentPassword`, `password`, `confirmPassword` | Senha atual obrigatória; nova senha com `buildPasswordValidation` (com dados do usuário logado); confirmação obrigatória e igual. O envio confere de novo se as senhas coincidem |
| `ProductForm` | `name`, `price`, `imgUrl`, `categoryIds`, `description` | Todos obrigatórios; preço numérico (`valueAsNumber`) e maior ou igual a 0; pelo menos uma categoria |
| `CategoryForm` | `name` | Obrigatório |
| `UserForm` | `firstName`, `lastName`, `email`, `password` (só na criação), `roleIds` | Nome, sobrenome e e-mail obrigatórios (sem verificação de formato do e-mail); senha com `buildPasswordValidation` (com dados pessoais); pelo menos um perfil |

Os campos de busca (`SearchInput`) não usam o RHF: são estados simples (`useState`) das telas de lista.

## Validação de senha

As regras ficam em `frontend/src/utils/password.ts`, a fonte única usada pelas telas e pelos componentes.

### Critérios

| Critério | Regra no código | Obrigatório para enviar? |
| --- | --- | --- |
| `length` | Pelo menos 10 caracteres (`PASSWORD_MIN_LENGTH`) | Sim |
| `uppercase` | Pelo menos uma letra maiúscula (`A-Z`) | Sim |
| `lowercase` | Pelo menos uma letra minúscula (`a-z`) | Sim |
| `number` | Pelo menos um dígito | Sim |
| `special` | Pelo menos um caractere que não seja letra sem acento nem número | Sim |
| `noSpaces` | Nenhum espaço | Sim |
| `noSequence` | Nenhuma sequência de 6 ou mais dígitos consecutivos, crescente ou decrescente (`123456`, `987654`) | Sim |
| `noCommon` | Não ser uma senha da lista local de senhas comuns (`senha123`, `admin`, `qwerty`…), sem diferenciar maiúsculas | Sim |
| `noPersonalData` | Não conter nome, sobrenome ou a parte antes do `@` do e-mail (partes com 3 letras ou mais) | Só quando a tela informa os dados pessoais |

Além disso, a senha tem **no máximo 72 caracteres** (`PASSWORD_MAX_LENGTH`). Letras acentuadas e o `ç` não contam como maiúscula nem minúscula (as regras olham só `A-Z` e `a-z`), mas contam como caractere especial.

A lista de senhas comuns é pequena e local. O comentário no código lembra que **o backend continua sendo a autoridade final**.

### Como as regras viram validação do formulário

`buildPasswordValidation(t, getContext?)` devolve as regras do RHF para o campo de senha:

`frontend/src/utils/password.ts`

```ts
    validate: (value: string) => {
      const ctx = getContext?.();
      const ev = evaluatePassword(value, ctx);
      if (!ev.length) return t("validation:password.criteria.length");
      if (!ev.uppercase) return t("validation:password.criteria.uppercase");
      if (!ev.lowercase) return t("validation:password.criteria.lowercase");
      if (!ev.number) return t("validation:password.criteria.number");
      if (!ev.special) return t("validation:password.criteria.special");
      if (!ev.noSpaces) return t("validation:password.criteria.noSpaces");
      if (!ev.noSequence) return t("validation:password.criteria.noSequence");
      if (!ev.noCommon) return t("validation:password.criteria.noCommon");
      if (ctx && !ev.noPersonalData) return t("validation:password.criteria.noPersonalData");
      return true;
    },
```

- A mensagem exibida é a do **primeiro** critério não atendido, na ordem acima.
- `getContext` é uma função que devolve `{ firstName, lastName, email }`. Ela é chamada a cada validação, então usa os valores mais recentes do formulário (cadastro e usuário) ou do usuário logado (segurança). Sem ela, como na redefinição de senha, o critério de dados pessoais é ignorado.

### Medidor de força

`evaluatePassword` devolve, além de cada critério, um nível de força calculado só pelos **cinco critérios principais** (tamanho, maiúscula, minúscula, número e especial):

| Critérios principais atendidos | Nível (`strength`) | Texto exibido |
| --- | --- | --- |
| 0 ou 1 (ou senha vazia) | `veryWeak` | Muito fraca |
| 2 | `weak` | Fraca |
| 3 | `regular` | Regular |
| 4 | `good` | Boa |
| 5 | `strong` | Forte |

O componente `PasswordStrength` mostra esse texto, uma barra de 5 segmentos e uma porcentagem.

> [!WARNING]
> A **barra e a porcentagem** não usam o mesmo cálculo do texto. Elas usam o campo `score`, que conta os **nove** critérios, dividido por 5. Na prática, a senha `abc` aparece com 100% e as cinco barras cheias (com o texto "Muito fraca"), e uma senha forte aparece com 180%. O texto do nível está correto; a barra e a porcentagem não. Esse comportamento foi registrado para correção. ([#5](https://github.com/Albertinesilva/asjcatalog-frontend/issues/5))

### Componentes

| Componente | O que faz | Onde é usado |
| --- | --- | --- |
| `PasswordField` | Campo de senha com botão para mostrar e ocultar (`aria-pressed`), com a mesma estrutura do `Input` (rótulo, ajuda, erro) | `LoginPage`, `RegisterPage`, `ResetPasswordPage`, `SecurityProfilePage`, `UserForm` |
| `PasswordRequirements` | Lista dos critérios com indicação de atendido ou pendente (também para leitores de tela) e contador `x/y`. Inclui o `PasswordStrength` por padrão. Pode ser recolhível (`collapsible`) | `RegisterPage` (recolhível, abre ao focar a senha), `ResetPasswordPage`, `SecurityProfilePage`, `UserForm` |
| `PasswordStrength` | Nível de força, barra e porcentagem (veja o aviso acima) | Dentro do `PasswordRequirements` |
| `PasswordMatch` | Mensagem em tempo real "as senhas coincidem" ou "não coincidem". Só aparece depois que a confirmação começa a ser digitada | `RegisterPage`, `ResetPasswordPage`, `SecurityProfilePage` |

Detalhe das telas com confirmação de senha: a mensagem de erro do campo de confirmação só aparece quando ele está **vazio** (ou quando o erro vem do servidor, no cadastro). A divergência entre as senhas é comunicada pelo `PasswordMatch`, para não mostrar a mesma informação duas vezes.

### Onde cada parte aparece

| Tela | Requisitos e força | Confirmação | Dados pessoais na validação |
| --- | --- | --- | --- |
| Cadastro (`RegisterPage`) | Sim (recolhível) | Sim | Sim (nome, sobrenome e e-mail digitados) |
| Redefinição (`ResetPasswordPage`) | Sim | Sim | Não |
| Troca de senha (`SecurityProfilePage`) | Sim | Sim | Sim (dados do usuário logado) |
| Novo usuário (`UserForm`, criação) | Sim | Não | Sim (dados digitados) |
| Login | Não | Não | Não |

## Validação de e-mail

Há duas expressões regulares (**regex**, padrões de texto) diferentes no projeto:

| Onde | Regex |
| --- | --- |
| `LoginPage`, `RegisterPage`, `RecoverPage`, `ActivationPendingPage` | `/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/` |
| `PersonalProfilePage` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `UserForm` | Nenhuma: o e-mail só é obrigatório |

Resultado das duas regex em alguns endereços válidos e inválidos:

| E-mail | Login, cadastro, recuperação | Perfil |
| --- | --- | --- |
| `ana@exemplo.com` | Aceita | Aceita |
| `ana.silva@exemplo.com.br` | Aceita | Aceita |
| `ana+loja@gmail.com` | **Recusa** | Aceita |
| `o'neil@exemplo.com` | **Recusa** | Aceita |
| `ana@empresa.online` | **Recusa** (domínio final com mais de 4 letras) | Aceita |
| `.ana@exemplo.com` e `ana..silva@exemplo.com` | Aceita (embora sejam inválidos) | Aceita |
| `ana@exemplo` | Recusa | Recusa |

Limites da regex principal:

- `\w` não inclui `+` nem `'`, que são válidos em e-mails. Quem usa o recurso de "apelido" do Gmail (`nome+algo@gmail.com`) não consegue se cadastrar nem entrar.
- `{2,4}` limita a parte final do domínio a 4 letras, recusando domínios como `.online`, `.store` ou `.photography`.
- Pontos no começo ou repetidos não são barrados.
- **Inconsistência:** o perfil aceita endereços que o login recusa. Um usuário pode trocar o e-mail no perfil para `ana+loja@gmail.com` e depois não conseguir digitá-lo no login.

Em todos os casos, a API continua validando o e-mail.

## Erros da API nos formulários

Quando a API recusa o envio, `handleApiError` marca os campos indicados pela API (com `setError`) ou mostra um alerta; quando devolve `false`, a tela mostra a mensagem por conta própria. O padrão completo, inclusive o cuidado com nomes de campo diferentes entre a tela e a API, está em [ERROR-HANDLING.md](ERROR-HANDLING.md#formulários-handleapierror-e-react-hook-form).

## Outros comportamentos de formulário

### Tempo de espera para reenviar o e-mail de ativação

Para evitar cliques repetidos, o reenvio do e-mail de ativação tem um tempo de espera de **60 segundos** (`RESEND_COOLDOWN_MS`).

- O momento em que o reenvio volta a ser permitido fica no `localStorage`, na chave `activationResendAvailableAt`. Assim, a espera vale mesmo depois de recarregar a página ou em outra aba.
- A espera começa ao **criar a conta** (`RegisterPage`) e a cada reenvio bem-sucedido na `ActivationPendingPage`. Uma resposta **429** (muitas requisições) também a reinicia.
- Na `ActivationPendingPage`, um contador atualizado a cada segundo desabilita o botão e mostra o tempo restante. A mensagem usa plural (`cooldownHint_one` e `cooldownHint_other`) e fica em vermelho nos últimos 10 segundos.

`frontend/src/utils/storage.ts`

```ts
export function startResendCooldown(ms: number = RESEND_COOLDOWN_MS): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESEND_COOLDOWN_KEY, String(Date.now() + ms));
}
```

O botão de reenvio da `ActivateAccountPage` (link expirado ou inválido) **não** consulta nem inicia essa espera; ela só trata a resposta 429 da API.

### E-mail pendente de ativação

Depois do cadastro, o e-mail é guardado em `localStorage` (`pendingActivationEmail`) para a tela de ativação pendente já vir preenchida. Se o usuário informar outro e-mail nessa tela e o reenvio der certo, o e-mail guardado é trocado. O valor é apagado quando a conta é ativada, quando alguém faz login ou no logout.

### Outros detalhes

- **Login com conta inativa:** aparece um cartão com o botão de reenviar a ativação (veja [ERROR-HANDLING.md](ERROR-HANDLING.md#erros-no-login)).
- **Recuperação de senha:** pede o e-mail duas vezes e confere se são iguais.
- **Sair da ativação pendente:** o botão "ir para o login" abre um `ConfirmDialog` antes de sair.
- **Perfil:** ao trocar o e-mail, a mensagem de sucesso inclui um aviso extra (`profile:emailChangeNotice`), e os dados do usuário são recarregados (`refreshUser`).
- **Troca de senha:** depois do sucesso, os três campos são limpos.
- **Produto:** o formulário só aparece depois que as categorias (e, na edição, o produto) carregam. Sem as opções, a lista de categorias perderia a seleção feita pelo `reset`.

## Como criar um novo formulário

1. **Tipos:** declare um `type FormFields` com os campos. Use, sempre que possível, os **mesmos nomes** que a API usa, para os erros por campo funcionarem.
2. **`useForm<FormFields>`** com `defaultValues` para todos os campos.
3. **Campos:** use `Input`, `Select`, `Textarea` ou `PasswordField` com `label`, `required` (visual) e `error={errors.campo?.message}`, espalhando `{...register("campo", regras)}`.
4. **Regras:** escreva-as no `register`, com mensagens de `t("validation:...")`. Para senha, use `buildPasswordValidation(t, getContext)` e mostre `PasswordRequirements`. Se precisar de uma mensagem nova, crie a chave em `validation.json` nos três idiomas (veja [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#como-adicionar-uma-chave)).
5. **`<form onSubmit={handleSubmit(onSubmit)} noValidate>`** e um `Button type="submit"` com `loading={isSubmitting}`.
6. **Envio:** chame o service dentro de `try/catch` e trate o erro com `handleApiError` (veja [ERROR-HANDLING.md](ERROR-HANDLING.md#como-tratar-erros-numa-tela-nova)).
7. **Edição:** carregue o registro com `useResource` e preencha o formulário com `reset` num `useEffect`.

## Cuidados e limitações

- **Medidor de força errado:** a barra e a porcentagem usam os nove critérios divididos por cinco (até 180%), embora o texto do nível esteja certo. ([#5](https://github.com/Albertinesilva/asjcatalog-frontend/issues/5))
- **Regex de e-mail restritiva e inconsistente:** recusa `+`, `'` e domínios com mais de 4 letras no login e no cadastro, mas o perfil aceita esses e-mails. ([#1](https://github.com/Albertinesilva/asjcatalog-frontend/issues/1))
- **E-mail sem formato no cadastro de usuário (admin):** o `UserForm` só exige o campo. ([#22](https://github.com/Albertinesilva/asjcatalog-frontend/issues/22))
- **Regras espalhadas:** cada tela escreve suas regras (por exemplo, limite de 80 caracteres no cadastro e de 100 no perfil para o mesmo campo "nome"). ([#22](https://github.com/Albertinesilva/asjcatalog-frontend/issues/22))
- **Validação nativa desligada:** com `noValidate`, os atributos `required` e `type="email"` não bloqueiam o envio; tudo depende das regras do RHF.
- **Tempo de espera não usado na tela de ativação:** o reenvio na `ActivateAccountPage` ignora o tempo de espera local. ([#22](https://github.com/Albertinesilva/asjcatalog-frontend/issues/22))
- **Regex com a flag `g`** na `ActivationPendingPage` (`/.../g`): é diferente das outras telas e pode confundir quem reaproveitar o padrão, já que regex globais guardam estado entre usos de `test()`.

## Veja também

- [ERROR-HANDLING.md](ERROR-HANDLING.md): erros da API nos formulários.
- [COMPONENTS.md](COMPONENTS.md): `Input`, `Select`, `Button` e demais componentes.
- [HOOKS.md](HOOKS.md#useresource): `useResource`, usado no modo de edição.
- [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md): onde ficam as mensagens de validação.
- [CONVENTIONS.md](CONVENTIONS.md#guia-como-criar-uma-nova-tela-crud): o formulário dentro do passo a passo de uma tela CRUD.
- [TESTING.md](TESTING.md#exemplo-primeiro-teste-de-uma-função-pura): exemplo de teste das regras de senha.
- [GLOSSARY.md](GLOSSARY.md): significado dos termos técnicos usados aqui.
