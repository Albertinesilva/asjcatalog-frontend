import axios, { type AxiosError } from "axios";

/**
 * Contrato oficial de erros da API (backend V2.5.2+).
 *
 * Este módulo é a ÚNICA fonte responsável por interpretar o payload
 * de erros retornado pelo backend. Toda leitura de `code`, `message`,
 * `fieldErrors`, etc. deve passar por `parseApiError`.
 *
 * As mensagens (`error`, `message`, `fieldErrors[].message`) já são
 * internacionalizadas pelo backend via `Accept-Language` — o frontend
 * apenas as exibe verbatim.
 *
 * Este arquivo é uma função pura: NÃO deve importar utilitários de UI
 * (SweetAlert, react-hook-form, navegação, storage) nem executar
 * efeitos colaterais.
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "PASSWORD_UPDATE_ERROR"
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

/**
 * Representação normalizada e tipada do erro da API.
 * Sempre presente após `parseApiError`, mesmo para falhas de rede.
 */
export type ApiError = {
  /** Timestamp ISO retornado pelo backend, quando disponível. */
  timestamp: string | null;
  /** HTTP status retornado pelo backend. `0` para falhas de rede. */
  status: number;
  /** Código estável do contrato oficial. `null` quando não classificável. */
  code: ApiErrorCode | null;
  /** Título/categoria do erro (i18n via backend). */
  error: string | null;
  /** Mensagem legível (i18n via backend). Nunca `null` (fallback aplicado). */
  message: string;
  /** Path da requisição, quando disponível. */
  path: string | null;
  /** Lista de erros por campo — sempre array (pode ser vazio). */
  fieldErrors: ApiFieldError[];
  /** `true` quando não houve resposta HTTP (erro de rede/timeout). */
  isNetworkError: boolean;
};

type ApiErrorPayload = {
  timestamp?: unknown;
  status?: unknown;
  code?: unknown;
  error?: unknown;
  message?: unknown;
  path?: unknown;
  fieldErrors?: unknown;
};

const FALLBACK_MESSAGE = "Ocorreu um erro inesperado. Tente novamente.";
const NETWORK_MESSAGE = "Falha de conexão. Verifique sua internet e tente novamente.";

const KNOWN_CODES: ReadonlySet<ApiErrorCode> = new Set<ApiErrorCode>([
  "VALIDATION_ERROR",
  "PASSWORD_UPDATE_ERROR",
  "RESOURCE_NOT_FOUND",
  "DATABASE_ERROR",
  "CONFLICT",
  "INVALID_TOKEN",
  "ACCESS_DISABLED",
  "ACCESS_DENIED",
  "AUTHENTICATION_REQUIRED",
  "INTERNAL_SERVER_ERROR",
]);

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toCode(value: unknown): ApiErrorCode | null {
  if (typeof value !== "string") return null;
  return KNOWN_CODES.has(value as ApiErrorCode) ? (value as ApiErrorCode) : null;
}

function toFieldErrors(value: unknown): ApiFieldError[] {
  if (!Array.isArray(value)) return [];
  const out: ApiFieldError[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as { fieldName?: unknown; message?: unknown };
    const fieldName = typeof item.fieldName === "string" ? item.fieldName : null;
    if (!fieldName) continue;
    const message = typeof item.message === "string" ? item.message : "";
    out.push({ fieldName, message });
  }
  return out;
}

/**
 * Converte qualquer erro (AxiosError, Error, string, unknown) em um
 * `ApiError` normalizado. Função pura, sem efeitos colaterais.
 */
export function parseApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError<ApiErrorPayload>;
    const response = axErr.response;

    if (!response) {
      return {
        timestamp: null,
        status: 0,
        code: null,
        error: null,
        message: axErr.message || NETWORK_MESSAGE,
        path: null,
        fieldErrors: [],
        isNetworkError: true,
      };
    }

    const data = (response.data ?? {}) as ApiErrorPayload;
    return {
      timestamp: toStringOrNull(data.timestamp),
      status: response.status ?? 0,
      code: toCode(data.code),
      error: toStringOrNull(data.error),
      message: toStringOrNull(data.message) ?? axErr.message ?? FALLBACK_MESSAGE,
      path: toStringOrNull(data.path),
      fieldErrors: toFieldErrors(data.fieldErrors),
      isNetworkError: false,
    };
  }

  if (err instanceof Error) {
    return {
      timestamp: null,
      status: 0,
      code: null,
      error: null,
      message: err.message || FALLBACK_MESSAGE,
      path: null,
      fieldErrors: [],
      isNetworkError: false,
    };
  }

  if (typeof err === "string" && err.length > 0) {
    return {
      timestamp: null,
      status: 0,
      code: null,
      error: null,
      message: err,
      path: null,
      fieldErrors: [],
      isNetworkError: false,
    };
  }

  return {
    timestamp: null,
    status: 0,
    code: null,
    error: null,
    message: FALLBACK_MESSAGE,
    path: null,
    fieldErrors: [],
    isNetworkError: false,
  };
}

/**
 * Atalho para obter apenas a mensagem legível do erro. Consumido por
 * fluxos que não usam react-hook-form (listagens, exclusões, dashboard).
 *
 * A mensagem do backend (`message`) é sempre priorizada pois já vem
 * localizada via `Accept-Language`. O `fallback` só é aplicado quando
 * o backend não retornou mensagem alguma.
 */
export function getApiErrorMessage(err: unknown, fallback = FALLBACK_MESSAGE): string {
  const parsed = parseApiError(err);
  if (parsed.isNetworkError) return parsed.message || fallback;
  return parsed.message || fallback;
}
