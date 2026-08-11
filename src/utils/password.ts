/**
 * Password evaluation utility — single source of truth for the
 * interactive password experience. Presentation components read from
 * this helper and translate labels via the `validation` namespace.
 */

export type PasswordCriterion =
  | "length"
  | "uppercase"
  | "lowercase"
  | "number"
  | "special"
  | "noSpaces"
  | "noSequence"
  | "noCommon"
  | "noPersonalData";

export type PasswordStrengthKey = "veryWeak" | "weak" | "regular" | "good" | "strong";

export type PasswordEvaluation = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  noSpaces: boolean;
  noSequence: boolean;
  noCommon: boolean;
  noPersonalData: boolean;
  score: number;
  strength: PasswordStrengthKey;
};

const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;

/** Fonte única de verdade para os limites de senha. */
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 72;

/** Lista mínima de senhas notoriamente fracas usada como pré-validação
 *  no cliente. O backend continua sendo a autoridade final. */
const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  "password",
  "password1",
  "passw0rd",
  "senha",
  "senha123",
  "admin",
  "admin123",
  "root",
  "toor",
  "user",
  "login",
  "welcome",
  "qwerty",
  "qwerty123",
  "asdfgh",
  "zxcvbn",
  "abc123",
  "123abc",
  "111111",
  "000000",
  "123123",
  "654321",
  "iloveyou",
  "letmein",
  "monkey",
  "dragon",
  "master",
  "sunshine",
  "princess",
  "football",
  "baseball",
]);

/** Detecta sequências numéricas ascendentes ou descendentes com
 *  6 ou mais dígitos consecutivos (ex.: 123456, 987654). */
export function hasNumericSequence(value: string): boolean {
  if (value.length < 6) return false;
  let run = 1;
  let dir: 0 | 1 | -1 = 0;
  for (let i = 1; i < value.length; i++) {
    const a = value.charCodeAt(i - 1);
    const b = value.charCodeAt(i);
    const isDigitA = a >= 48 && a <= 57;
    const isDigitB = b >= 48 && b <= 57;
    const step = b - a;
    if (isDigitA && isDigitB && (step === 1 || step === -1)) {
      const nd = step === 1 ? 1 : -1;
      if (nd === dir) run += 1;
      else {
        dir = nd;
        run = 2;
      }
      if (run >= 6) return true;
    } else {
      run = 1;
      dir = 0;
    }
  }
  return false;
}

export type PersonalDataContext = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

function containsPersonalData(value: string, ctx?: PersonalDataContext): boolean {
  if (!ctx) return false;
  const lower = value.toLowerCase();
  const parts: string[] = [];
  if (ctx.firstName?.trim()) parts.push(ctx.firstName.trim().toLowerCase());
  if (ctx.lastName?.trim()) parts.push(ctx.lastName.trim().toLowerCase());
  const email = ctx.email?.trim().toLowerCase();
  if (email) {
    const local = email.split("@")[0];
    if (local) parts.push(local);
  }
  return parts.filter((p) => p.length >= 3).some((p) => lower.includes(p));
}

function isCommonPassword(value: string): boolean {
  return COMMON_PASSWORDS.has(value.toLowerCase());
}

export function evaluatePassword(
  password: string | null | undefined,
  context?: PersonalDataContext,
): PasswordEvaluation {
  const value = password ?? "";
  const checks = {
    length: value.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: SPECIAL_CHAR_REGEX.test(value),
    noSpaces: value.length > 0 && !/\s/.test(value),
    noSequence: value.length > 0 && !hasNumericSequence(value),
    noCommon: value.length > 0 && !isCommonPassword(value),
    noPersonalData: value.length > 0 && !containsPersonalData(value, context),
  };
  const coreChecks = [
    checks.length,
    checks.uppercase,
    checks.lowercase,
    checks.number,
    checks.special,
  ];
  const coreScore = coreChecks.filter(Boolean).length;
  const score = (Object.values(checks) as boolean[]).filter(Boolean).length;
  let strength: PasswordStrengthKey = "veryWeak";
  if (value.length === 0) strength = "veryWeak";
  else if (coreScore <= 1) strength = "veryWeak";
  else if (coreScore === 2) strength = "weak";
  else if (coreScore === 3) strength = "regular";
  else if (coreScore === 4) strength = "good";
  else strength = "strong";
  return { ...checks, score, strength };
}

/** i18n keys for each criterion (namespace: validation). */
export const PASSWORD_CRITERIA: { key: PasswordCriterion; labelKey: string }[] = [
  { key: "length", labelKey: "validation:password.criteria.length" },
  { key: "uppercase", labelKey: "validation:password.criteria.uppercase" },
  { key: "lowercase", labelKey: "validation:password.criteria.lowercase" },
  { key: "number", labelKey: "validation:password.criteria.number" },
  { key: "special", labelKey: "validation:password.criteria.special" },
  { key: "noSpaces", labelKey: "validation:password.criteria.noSpaces" },
  { key: "noSequence", labelKey: "validation:password.criteria.noSequence" },
  { key: "noCommon", labelKey: "validation:password.criteria.noCommon" },
  { key: "noPersonalData", labelKey: "validation:password.criteria.noPersonalData" },
];

type Translator = (key: string, options?: Record<string, unknown>) => string;

/**
 * Regras RHF para o campo de senha — fonte única alinhada com
 * `evaluatePassword` e `PasswordRequirements`. Todas as telas de
 * criação/alteração de senha DEVEM consumir este helper para garantir
 * consistência visual e de validação.
 */
export function buildPasswordValidation(
  t: Translator,
  getContext?: () => PersonalDataContext | undefined,
) {
  return {
    required: t("validation:password.requiredShort"),
    maxLength: {
      value: PASSWORD_MAX_LENGTH,
      message: t("validation:password.maxLength"),
    },
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
  };
}
