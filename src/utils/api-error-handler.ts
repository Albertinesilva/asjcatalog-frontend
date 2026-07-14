import { alerts } from "@/utils/alerts";

/**
 * Contrato oficial de erros da API (backend V2.5.2+).
 *
 * Toda decisão de tratamento deve ser tomada exclusivamente através
 * do campo `code` (enum `ApiErrorCode`). Nunca inferir tipo de erro
 * a partir de `status`, `message`, `error` ou de heurísticas de texto.
 *
 * Mensagens (`message` / `fieldErrors[].message`) já são
 * internacionalizadas pelo backend via `Accept-Language` — o frontend
 * apenas as exibe verbatim.
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "RESOURCE_NOT_FOUND"
  | "DATABASE_ERROR"
  | "CONFLICT"
  | "INVALID_TOKEN"
  | "ACCESS_DISABLED"
  | "ACCESS_DENIED"
  | "AUTHENTICATION_REQUIRED"
  | "INTERNAL_SERVER_ERROR";

export type ApiFieldError = {
  fieldName: string;
  message: string;
};

export type ApiErrorBody = {
  timestamp?: string;
  status?: number;
  code?: ApiErrorCode | string;
  error?: string;
  message?: string;
  path?: string;
  fieldErrors?: ApiFieldError[];
};

export function getApiErrorBody(err: unknown): ApiErrorBody | null {
  const e = err as { response?: { data?: ApiErrorBody } } | undefined;
  return e?.response?.data ?? null;
}

export function getApiErrorCode(err: unknown): ApiErrorCode | null {
  const body = getApiErrorBody(err);
  return (body?.code as ApiErrorCode | undefined) ?? null;
}

type SetFormError = (
  fieldName: string,
  error: { type: string; message: string },
  options?: { shouldFocus?: boolean },
) => void;

export type HandleApiErrorOptions = {
  /** setError do react-hook-form; obrigatório para VALIDATION_ERROR. */
  setError?: SetFormError;
  /** Título do SweetAlert quando um alerta modal é exibido. */
  fallbackTitle?: string;
  /** Mensagem exibida quando o backend não retornou `message`. */
  fallbackMessage?: string;
};

/**
 * Tratamento centralizado de erros da API baseado em `ApiErrorCode`.
 *
 * - VALIDATION_ERROR: percorre `fieldErrors`, aplica `setError` em cada
 *   campo. Nenhum SweetAlert é exibido. Feedback ocorre inline nos
 *   inputs via mecanismo padrão do react-hook-form.
 * - Demais códigos: exibe SweetAlert de erro com a `message` retornada
 *   pelo backend (já internacionalizada).
 *
 * Retorna `true` quando o erro foi reconhecido/tratado. Retorna `false`
 * quando não foi possível identificar o payload (ex.: erro de rede),
 * permitindo que o chamador aplique um fallback adicional se desejar.
 */
export async function handleApiError(
  err: unknown,
  options: HandleApiErrorOptions = {},
): Promise<boolean> {
  const body = getApiErrorBody(err);
  const code = (body?.code ?? null) as ApiErrorCode | null;
  const message =
    body?.message ?? options.fallbackMessage ?? "Ocorreu um erro inesperado. Tente novamente.";
  const title = options.fallbackTitle ?? "Erro";

  switch (code) {
    case "VALIDATION_ERROR": {
      const fieldErrors = body?.fieldErrors ?? [];
      if (options.setError && fieldErrors.length > 0) {
        let focused = false;
        for (const fe of fieldErrors) {
          if (!fe?.fieldName) continue;
          options.setError(
            fe.fieldName,
            { type: "server", message: fe.message ?? "" },
            focused ? undefined : { shouldFocus: true },
          );
          focused = true;
        }
        return true;
      }
      await alerts.error("Dados inválidos", message);
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
    default: {
      if (!body) return false;
      await alerts.error(title, message);
      return true;
    }
  }
}