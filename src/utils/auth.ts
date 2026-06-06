import { jwtDecode } from "jwt-decode";
import type { AccessToken, LoginResponse, Role } from "@/@types";

const STORAGE_KEY = "authData";

export function getSessionData(): LoginResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse;
  } catch {
    return null;
  }
}

export function saveSessionData(data: LoginResponse) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("auth-change"));
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("auth-change"));
}

export function getDecodedToken(): AccessToken | null {
  const session = getSessionData();
  if (!session?.access_token) return null;
  try {
    return jwtDecode<AccessToken>(session.access_token);
  } catch {
    return null;
  }
}

export function isTokenValid(): boolean {
  const decoded = getDecodedToken();
  if (!decoded?.exp) return false;
  return Date.now() < decoded.exp * 1000;
}

export function isAuthenticated(): boolean {
  const session = getSessionData();
  return !!session?.access_token && isTokenValid();
}

export function hasAnyRole(roles: Role[] = []): boolean {
  if (roles.length === 0) return true;
  const decoded = getDecodedToken();
  if (!decoded?.authorities) return false;
  return roles.some((r) => decoded.authorities.includes(r));
}