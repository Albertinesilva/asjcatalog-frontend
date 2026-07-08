import axios, { type AxiosError } from "axios";

type ApiErrorBody = {
  message?: string;
  error?: string;
  errors?: { fieldName?: string; message?: string }[];
};

/**
 * Extrai uma mensagem legível a partir de qualquer erro lançado por
 * chamadas HTTP (axios) ou código de aplicação. Sempre retorna string.
 */
export function getApiErrorMessage(err: unknown, fallback = "Erro inesperado."): string {
  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError<ApiErrorBody>;
    const data = axErr.response?.data;
    const status = axErr.response?.status;

    if (status === 401) return "Sessão expirada. Faça login novamente.";
    if (status === 403) return "Você não tem permissão para executar esta ação.";
    if (status === 404) return "Recurso não encontrado.";
    if (status === 429) return "Muitas tentativas. Aguarde alguns instantes.";

    const fieldMsg = data?.errors
      ?.map((e) => e.message)
      .filter(Boolean)
      .join(" • ");
    if (fieldMsg) return fieldMsg;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (axErr.message) return axErr.message;
  }
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === "string") return err;
  return fallback;
}
