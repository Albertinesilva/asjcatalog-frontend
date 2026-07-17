import i18n from "@/i18n";
import { alerts } from "@/utils/alerts";
import { parseApiError, type ApiError, type ApiErrorCode } from "@/utils/api-error";

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

export { parseApiError };
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
    default:
      await alerts.error(title, message);
      return true;
  }
}
