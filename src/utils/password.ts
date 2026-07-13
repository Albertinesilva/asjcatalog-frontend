/**
 * Password evaluation utility — shared source of truth for the
 * interactive password experience.
 *
 * Presentation components (strength meter, requirements checklist,
 * match indicator) all read from this helper so the rules stay in a
 * single place. Form-level validation (react-hook-form registers) is
 * still owned by each form and is deliberately NOT coupled to this
 * utility — it only powers the real-time UX feedback.
 */

export type PasswordCriterion =
  | "length"
  | "uppercase"
  | "lowercase"
  | "number"
  | "special";

export type PasswordStrength =
  | "Muito fraca"
  | "Fraca"
  | "Regular"
  | "Boa"
  | "Forte";

export type PasswordEvaluation = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  score: number;
  strength: PasswordStrength;
};

const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;

export function evaluatePassword(password: string | null | undefined): PasswordEvaluation {
  const value = password ?? "";

  const checks = {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: SPECIAL_CHAR_REGEX.test(value),
  };

  const score = (Object.values(checks) as boolean[]).filter(Boolean).length;

  let strength: PasswordStrength = "Muito fraca";
  if (value.length === 0) strength = "Muito fraca";
  else if (score <= 1) strength = "Muito fraca";
  else if (score === 2) strength = "Fraca";
  else if (score === 3) strength = "Regular";
  else if (score === 4) strength = "Boa";
  else strength = "Forte";

  return { ...checks, score, strength };
}

export const PASSWORD_CRITERIA: { key: PasswordCriterion; label: string }[] = [
  { key: "length", label: "Pelo menos 8 caracteres" },
  { key: "uppercase", label: "Pelo menos uma letra maiúscula" },
  { key: "lowercase", label: "Pelo menos uma letra minúscula" },
  { key: "number", label: "Pelo menos um número" },
  { key: "special", label: "Pelo menos um símbolo especial" },
];

/**
 * Mensagem inline exibida no PasswordRequirements quando o backend
 * rejeita a senha por conter um padrão muito comum / inseguro.
 *
 * A partir da V2.5.1, este feedback é a ÚNICA fonte de informação
 * para esse tipo de erro — não deve ser complementado por modais
 * (SweetAlert) para não interromper o fluxo do usuário.
 */
export const COMMON_PASSWORD_INLINE_MESSAGE =
  "Sua senha atende aos requisitos mínimos, mas utiliza uma combinação muito conhecida. Escolha uma senha mais exclusiva para aumentar sua segurança.";

/**
 * Heurística para reconhecer o erro "senha contém padrão comum/inseguro"
 * retornado pelo backend em qualquer formato (message raiz ou lista de
 * field errors). Mantém-se propositalmente frouxa para tolerar variações
 * de texto sem depender de códigos de erro dedicados.
 */
const COMMON_PASSWORD_REGEX =
  /(padr[aã]o.*(comum|insegur)|(comum|insegur).*padr[aã]o|senha.*(comum|insegur)|(comum|insegur).*senha|common.*password|weak.*password|password.*common|too.*common)/i;

export function isCommonPasswordError(err: unknown): boolean {
  const candidates: string[] = [];
  const e = err as {
    message?: string;
    response?: {
      data?: {
        message?: string;
        error?: string;
        errors?: { fieldName?: string; message?: string }[];
      };
    };
  };
  if (typeof e?.message === "string") candidates.push(e.message);
  const data = e?.response?.data;
  if (data?.message) candidates.push(data.message);
  if (data?.error) candidates.push(data.error);
  if (Array.isArray(data?.errors)) {
    for (const fe of data.errors) {
      if (fe?.message && (!fe.fieldName || /password|senha/i.test(fe.fieldName))) {
        candidates.push(fe.message);
      }
    }
  }
  return candidates.some((s) => COMMON_PASSWORD_REGEX.test(s));
}