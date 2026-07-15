import { alerts } from "@/utils/alerts";
import { parseApiError, type ApiError, type ApiErrorCode } from "@/utils/api-error";

/**
 * Camada de apresentação para erros da API.
 *
 * Consome exclusivamente `parseApiError` (única fonte de interpretação
 * do contrato oficial). Este módulo é responsável apenas por:
 *   - aplicar `setError` do react-hook-form em VALIDATION_ERROR;
 *   - exibir SweetAlert para demais códigos;
 *   - retornar boolean informando se o erro foi tratado.
 *
 * Nenhuma leitura direta de `response.data.*` deve ocorrer aqui.
 */

type SetFormError = (
  fieldName: string,
  error: { type: string; message: string },
  options?: { shouldFocus?: boolean },
) => void;

export type HandleApiErrorOptions = {
  /** setError do react-hook-form; consumido em VALIDATION_ERROR. */
  setError?: SetFormError;
  /** Título do SweetAlert quando um alerta modal é exibido. */
  fallbackTitle?: string;
  /** Mensagem exibida quando o backend não retornou `message`. */
  fallbackMessage?: string;
  /** Título usado especificamente para VALIDATION_ERROR sem `setError`. */
  validationTitle?: string;
};

/** Re-exports para consumidores legados. */
export { parseApiError };
export type { ApiError, ApiErrorCode };

/** Atalho: retorna somente o `code` normalizado. */
export function getApiErrorCode(err: unknown): ApiErrorCode | null {
  return parseApiError(err).code;
}

/**
 * Tratamento centralizado de erros da API baseado em `ApiErrorCode`.
 *
 * - VALIDATION_ERROR: percorre `fieldErrors`, aplica `setError` em cada
 *   campo. Nenhum SweetAlert é exibido. Feedback ocorre inline via RHF.
 * - Demais códigos: exibe SweetAlert de erro com a `message` retornada
 *   pelo backend (já internacionalizada via `Accept-Language`).
 *
 * Retorna `true` quando o erro foi reconhecido/tratado. Retorna `false`
 * apenas para erros de rede (sem resposta HTTP), permitindo fallback
 * customizado pelo chamador.
 */
export async function handleApiError(
  err: unknown,
  options: HandleApiErrorOptions = {},
): Promise<boolean> {
  const parsed = parseApiError(err);
  const title = options.fallbackTitle ?? "Erro";
  const message = parsed.message || options.fallbackMessage || "";

  if (parsed.isNetworkError) return false;

  switch (parsed.code) {
    case "VALIDATION_ERROR": {
      if (options.setError && parsed.fieldErrors.length > 0) {
        let focused = false;
        for (const fe of parsed.fieldErrors) {
          if (!fe.fieldName) continue;
          options.setError(
            fe.fieldName,
            { type: "server", message: fe.message },
            focused ? undefined : { shouldFocus: true },
          );
          focused = true;
        }
        return true;
      }
      await alerts.error(options.validationTitle ?? title, message);
      return true;
    }
    case "CONFLICT":
    case "RESOURCE_NOT_FOUND":
    case "DATABASE_ERROR":
    case "INVALID_TOKEN":
    case "ACCESS_DISABLED":
    case "ACCESS_DENIED":
    case "AUTHENTICATION_REQUIRED":
    case "INTERNAL_SERVER_ERROR":
      await alerts.error(title, message);
      return true;
    default:
      await alerts.error(title, message);
      return true;
  }
}