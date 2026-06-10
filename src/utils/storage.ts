import { PENDING_EMAIL_KEY, TOKEN_KEY } from "./constants";
import type { LoginResponse } from "@/types";

export function getAuthData(): LoginResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse;
  } catch {
    return null;
  }
}

export function saveAuthData(data: LoginResponse): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("auth-change"));
}

export function removeAuthData(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("auth-change"));
}

export function savePendingEmail(email: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_EMAIL_KEY, email);
}

export function getPendingEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PENDING_EMAIL_KEY);
}

export function removePendingEmail(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_EMAIL_KEY);
}