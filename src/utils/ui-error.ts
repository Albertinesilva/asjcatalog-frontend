import i18n from "@/i18n";
import { parseApiError } from "@/utils/api-error";

/**
 * Texto de erro seguro para exibir na UI.
 *
 * - Erro do contrato da API (`code` conhecido): mensagem do backend, já localizada
 *   via `Accept-Language`.
 * - Falha de rede/timeout: texto i18n de conexão.
 * - Qualquer outro caso (payload fora do contrato, HTML de proxy, `Error` local):
 *   `fallback` ou o texto genérico i18n. Nunca `AxiosError.message` bruto
 *   ("Network Error", "Request failed with status code 500").
 */
export function getUiErrorMessage(err: unknown, fallback?: string): string {
  const parsed = parseApiError(err);
  if (parsed.isNetworkError) return i18n.t("common:errors.network");
  if (parsed.code) return parsed.message;
  return fallback ?? i18n.t("common:errors.generic");
}

/** `true` quando a API respondeu 404 (recurso inexistente), não falha de rede/servidor. */
export function isNotFoundError(err: unknown): boolean {
  return parseApiError(err).status === 404;
}
