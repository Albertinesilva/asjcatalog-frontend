import i18n from "@/i18n";
import { alerts } from "@/utils/alerts";
import { parseApiError, type ApiError, type ApiErrorCode } from "@/utils/api-error";
import { getUiErrorMessage } from "@/utils/ui-error";

type SetFormError = (
  fieldName: string,
  error: { type: string; message: string },
  options?: { shouldFocus?: boolean },
) => void;

export type HandleApiErrorOptions = {
  setError?: SetFormError;
  fallbackTitle?: string;
  fallbackMessage?: string;
  validationTitle?: string;
};

export type { ApiError, ApiErrorCode };

export function getApiErrorCode(err: unknown): ApiErrorCode | null {
  return parseApiError(err).code;
}

export async function handleApiError(
  err: unknown,
  options: HandleApiErrorOptions = {},
): Promise<boolean> {
  const parsed = parseApiError(err);
  const title = options.fallbackTitle ?? i18n.t("common:errors.title");
  // Só o texto do contrato da API (localizado pelo backend) é exibido verbatim;
  // payload fora do contrato cai no fallback do chamador, nunca em `AxiosError.message`.
  const message = getUiErrorMessage(err, options.fallbackMessage);
  if (parsed.isNetworkError) return false;

  switch (parsed.code) {
    case "PASSWORD_UPDATE_ERROR": {
      // Erro de negócio da atualização de senha (HTTP 422).
      // Nunca é erro de sessão: a página trata inline, sem SweetAlert
      // e sem qualquer efeito sobre a autenticação.
      return false;
    }
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
    default:
      await alerts.error(title, message);
      return true;
  }
}
