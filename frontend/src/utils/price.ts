/**
 * Regras do campo de preço do formulário de produto.
 *
 * O backend guarda o preço em `NUMERIC(10,2)` e valida com `@Positive` e
 * `@Digits(integer = 8, fraction = 2)`: maior que zero, até 8 dígitos
 * inteiros e até 2 casas decimais (de 0,01 a 99.999.999,99).
 *
 * O campo é um texto: aceita vírgula ou ponto como separador decimal (um só)
 * e recusa separador de milhar. Funções puras, sem React e sem i18n.
 */

/** Maior preço aceito pela API (8 dígitos inteiros e 2 casas decimais). */
export const PRICE_MAX = 99_999_999.99;

/** Número de casas decimais aceitas pela API. */
export const PRICE_DECIMALS = 2;

/** Motivo da recusa; cada um tem uma mensagem em `validation.json`. */
export type PriceInputError = "required" | "invalid" | "thousands" | "decimals" | "min" | "max";

/** Dígitos, com sinal opcional e no máximo um separador decimal seguido de dígitos. */
const PRICE_PATTERN = /^-?\d+(?:[.,](\d+))?$/;
/** Só dígitos e separadores, com sinal opcional: usado para reconhecer o separador de milhar. */
const DIGITS_AND_SEPARATORS = /^-?[\d.,]+$/;

/**
 * Confere o texto digitado no campo de preço.
 * Devolve `null` quando o valor é válido, ou o motivo da recusa.
 */
export function getPriceInputError(raw: string): PriceInputError | null {
  const value = raw.trim();
  if (value === "") return "required";

  const match = PRICE_PATTERN.exec(value);
  if (!match) {
    const separators = value.match(/[.,]/g)?.length ?? 0;
    if (separators > 1 && DIGITS_AND_SEPARATORS.test(value)) return "thousands";
    return "invalid";
  }

  const decimals = match[1] ?? "";
  if (decimals.length > PRICE_DECIMALS) return "decimals";

  const amount = Number(value.replace(",", "."));
  if (amount <= 0) return "min";
  if (amount > PRICE_MAX) return "max";
  return null;
}

/**
 * Converte o texto do campo (já validado) no número enviado à API,
 * arredondado para 2 casas decimais. Ex.: "10,5" → 10.5.
 */
export function parsePriceInput(raw: string): number {
  const amount = Number(raw.trim().replace(",", "."));
  return roundPrice(amount);
}

/**
 * Arredonda para 2 casas decimais, para que o valor não chegue à API com
 * casas a mais (por exemplo, uma soma como 0.1 + 0.2 = 0.30000000000000004).
 */
export function roundPrice(value: number): number {
  return Number(value.toFixed(PRICE_DECIMALS));
}

/** Texto inicial do campo na edição: o preço da API com 2 casas. Ex.: 2190 → "2190.00". */
export function formatPriceInput(value: number | string): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(PRICE_DECIMALS) : "";
}
