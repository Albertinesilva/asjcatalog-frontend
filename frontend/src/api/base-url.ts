import { API_BASE_URL } from "@/utils/constants";

/**
 * Módulo neutro de construção de URL da API.
 * Não conhece autenticação, tokens nem executa requisições — existe para que
 * `axios.ts` e `auth-api.ts` compartilhem a mesma regra sem criar ciclo.
 */
function isLovablePreview(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.includes("lovable.app");
}

/** Base usada pela instância `http` (proxy no preview, API real fora dele). */
export function getHttpBaseUrl(): string {
  return isLovablePreview() ? "/api/proxy" : API_BASE_URL;
}

/** URL absoluta/relativa para chamadas feitas fora da instância `http`. */
export function buildAuthUrl(path: string): string {
  return isLovablePreview() ? `/api/proxy${path}` : `${API_BASE_URL}${path}`;
}

export { API_BASE_URL };
