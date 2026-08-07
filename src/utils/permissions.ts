import { jwtDecode } from "jwt-decode";
import { getAuthData } from "./storage";
import type { JwtPayload, Role } from "@/types";

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

/** Identificador do usuário autenticado (claim `userId`). */
export function getUserId(): number | null {
  return decodeToken()?.userId ?? null;
}

/** Login do usuário autenticado (claim `username`, nunca `sub`). */
export function getUsername(): string | null {
  return decodeToken()?.username ?? null;
}

export function hasAnyRole(roles: Role[] = []): boolean {
  if (roles.length === 0) return true;
  const decoded = decodeToken();
  if (!decoded?.authorities) return false;
  return roles.some((r) => decoded.authorities.includes(r));
}

export function hasRole(role: Role): boolean {
  return hasAnyRole([role]);
}

export function isAdmin(): boolean {
  return hasAnyRole(["ROLE_ADMIN"]);
}

export function isOperator(): boolean {
  return hasAnyRole(["ROLE_OPERATOR", "ROLE_ADMIN"]);
}
