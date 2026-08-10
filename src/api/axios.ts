import axios from "axios";
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

http.interceptors.response.use(
  (res) => res,
  (error) => {
    // Um 401 só encerra a sessão quando o token local realmente não é mais
    // válido (ausente ou expirado). 401 de um recurso específico com token
    // válido é propagado para a tela tratar, sem destruir a sessão.
    if (error?.response?.status === 401 && getAuthData() && !isTokenValid()) {
      removeAuthData();
      if (typeof window !== "undefined") {
        window.location.assign("/auth/login");
      }
    }
    return Promise.reject(error);
  },
);

export function buildAuthUrl(path: string): string {
  return isLovablePreview() ? `/api/proxy${path}` : `${API_BASE_URL}${path}`;
}
