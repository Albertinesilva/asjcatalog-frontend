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
  | "special";

export type PasswordStrengthKey =
  | "veryWeak"
  | "weak"
  | "regular"
  | "good"
  | "strong";

export type PasswordEvaluation = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  score: number;
  strength: PasswordStrengthKey;
};

const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;

/** Fonte única de verdade para os limites de senha. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export function evaluatePassword(password: string | null | undefined): PasswordEvaluation {
  const value = password ?? "";
  const checks = {
    length: value.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: SPECIAL_CHAR_REGEX.test(value),
  };
  const score = (Object.values(checks) as boolean[]).filter(Boolean).length;
  let strength: PasswordStrengthKey = "veryWeak";
  if (value.length === 0) strength = "veryWeak";
  else if (score <= 1) strength = "veryWeak";
  else if (score === 2) strength = "weak";
  else if (score === 3) strength = "regular";
  else if (score === 4) strength = "good";
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
];

type Translator = (key: string, options?: Record<string, unknown>) => string;

/**
 * Regras RHF para o campo de senha — fonte única alinhada com
 * `evaluatePassword` e `PasswordRequirements`. Todas as telas de
 * criação/alteração de senha DEVEM consumir este helper para garantir
 * consistência visual e de validação.
 */
export function buildPasswordValidation(t: Translator) {
  return {
    required: t("validation:password.requiredShort"),
    maxLength: {
      value: PASSWORD_MAX_LENGTH,
      message: t("validation:password.maxLength"),
    },
    validate: (value: string) => {
      const ev = evaluatePassword(value);
      if (!ev.length) return t("validation:password.criteria.length");
      if (!ev.uppercase) return t("validation:password.criteria.uppercase");
      if (!ev.lowercase) return t("validation:password.criteria.lowercase");
      if (!ev.number) return t("validation:password.criteria.number");
      if (!ev.special) return t("validation:password.criteria.special");
      return true;
    },
  };
}
