import axios from "axios";
import qs from "query-string";
import { buildAuthUrl } from "./axios";
import { CLIENT_ID, CLIENT_SECRET, ENDPOINTS } from "@/utils/constants";
import { getAuthData, saveAuthData } from "@/utils/storage";
import type { LoginRequest, LoginResponse } from "@/types";

function basicAuthHeader(): string {
  const encoder =
    typeof btoa === "function" ? btoa : (s: string) => Buffer.from(s).toString("base64");
  return `Basic ${encoder(`${CLIENT_ID}:${CLIENT_SECRET}`)}`;
}

const FORM_HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded",
};

/**
 * `/oauth2/token` usa o axios GLOBAL de propósito: assim o endpoint de token
 * (login e refresh) nunca passa pelo interceptor de 401 da instância `http`,
 * evitando recursão refresh -> 401 -> refresh.
 */
export async function requestToken({ username, password }: LoginRequest): Promise<LoginResponse> {
  const body = qs.stringify({
    username,
    password,
    grant_type: "password",
  });

  const res = await axios.post<LoginResponse>(buildAuthUrl(ENDPOINTS.token), body, {
    headers: { Authorization: basicAuthHeader(), ...FORM_HEADERS },
  });
  return res.data;
}

export async function refreshTokenRequest(refreshToken: string): Promise<LoginResponse> {
  const body = qs.stringify({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await axios.post<LoginResponse>(buildAuthUrl(ENDPOINTS.token), body, {
    headers: { Authorization: basicAuthHeader(), ...FORM_HEADERS },
  });
  return res.data;
}

/** Promise compartilhada: garante single-flight do refresh dentro da aba. */
let refreshPromise: Promise<LoginResponse> | null = null;

export function hasRefreshToken(): boolean {
  return !!getAuthData()?.refresh_token;
}

/**
 * Executa (ou aguarda) uma renovação de sessão em andamento.
 * Em sucesso persiste o PAR INTEIRO de tokens via `saveAuthData`
 * (rotação: `reuseRefreshTokens(false)` no backend).
 */
export function refreshSession(): Promise<LoginResponse> {
  if (refreshPromise) return refreshPromise;

  const current = getAuthData()?.refresh_token;
  if (!current) return Promise.reject(new Error("NO_REFRESH_TOKEN"));

  refreshPromise = refreshTokenRequest(current)
    .then((data) => {
      // Defensivo: se o backend omitir o refresh_token, mantém o atual em vez
      // de apagá-lo. O contrato esperado é sempre retornar um novo.
      const next: LoginResponse = { ...data, refresh_token: data.refresh_token ?? current };
      saveAuthData(next);
      return next;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
