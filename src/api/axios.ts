import axios, { type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/utils/constants";
import { getAuthData, removeAuthData } from "@/utils/storage";
import { isTokenValid } from "@/utils/permissions";
import { getAcceptLanguageHeader } from "@/i18n/http";

function isLovablePreview(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.includes("lovable.app");
}

export const http = axios.create({
  baseURL: isLovablePreview() ? "/api/proxy" : API_BASE_URL,
});

/** Marca de retry para impedir loop 401 -> refresh -> 401 -> refresh. */
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

http.interceptors.request.use((config) => {
  const session = getAuthData();
  if (session?.access_token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${session.access_token}`;
  }
  config.headers = config.headers ?? {};
  (config.headers as Record<string, string>)["Accept-Language"] = getAcceptLanguageHeader();
  return config;
});

function endSession() {
  removeAuthData();
  if (typeof window !== "undefined") {
    window.location.assign("/auth/login");
  }
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const config = error?.config as RetriableConfig | undefined;

    if (status === 401 && config && !config._retry && getAuthData()?.refresh_token) {
      config._retry = true;
      try {
        // Import dinâmico: evita ciclo estático axios.ts <-> auth-api.ts.
        const { refreshSession } = await import("./auth-api");
        const data = await refreshSession();
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>).Authorization = `Bearer ${data.access_token}`;
        return http.request(config);
      } catch {
        endSession();
        return Promise.reject(error);
      }
    }

    // Sem refresh token: um 401 só encerra a sessão quando o token local
    // realmente não é mais válido (ausente ou expirado). 401 de um recurso
    // específico com token válido é propagado para a tela tratar.
    if (status === 401 && getAuthData() && !isTokenValid()) {
      endSession();
    }
    return Promise.reject(error);
  },
);

export function buildAuthUrl(path: string): string {
  return isLovablePreview() ? `/api/proxy${path}` : `${API_BASE_URL}${path}`;
}
