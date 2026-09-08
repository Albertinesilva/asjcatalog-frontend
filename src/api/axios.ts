import axios, { type InternalAxiosRequestConfig } from "axios";
import { getHttpBaseUrl } from "./base-url";
import { refreshSession } from "./auth-api";
import { getAuthData, removeAuthData } from "@/utils/storage";
import { isTokenValid } from "@/utils/permissions";
import { isPrivatePath } from "@/routes/route-access";
import { getAcceptLanguageHeader } from "@/i18n/http";

export const http = axios.create({
  baseURL: getHttpBaseUrl(),
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
  // Em rota pública apenas limpamos a sessão: redirecionar tiraria o usuário
  // do catálogo sem necessidade.
  if (typeof window !== "undefined" && isPrivatePath(window.location.pathname)) {
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
