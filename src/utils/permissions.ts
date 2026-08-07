import { jwtDecode } from "jwt-decode";
import { getAuthData } from "./storage";
import type { JwtPayload } from "@/types";

/**
 * Leitura de baixo nível do Access Token.
 * Fonte única da identidade: o JWT -> decodeToken -> AuthContext -> useAuth.
 * Componentes NÃO devem chamar estas funções diretamente; use `useAuth`/`useRoles`.
 */

export function decodeToken(): JwtPayload | null {
  const data = getAuthData();
  if (!data?.access_token) return null;
  try {
    return jwtDecode<JwtPayload>(data.access_token);
  } catch {
    return null;
  }
}

export function isTokenValid(): boolean {
  const decoded = decodeToken();
  if (!decoded?.exp) return false;
  return Date.now() < decoded.exp * 1000;
}
