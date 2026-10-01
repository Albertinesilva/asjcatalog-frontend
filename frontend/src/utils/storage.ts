import { PENDING_EMAIL_KEY, RESEND_COOLDOWN_KEY, RESEND_COOLDOWN_MS, TOKEN_KEY } from "./constants";
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
  // Uma nova sessão invalida qualquer e-mail pendente de ativação.
  window.localStorage.removeItem(PENDING_EMAIL_KEY);
  window.dispatchEvent(new Event("auth-change"));
}

export function removeAuthData(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(PENDING_EMAIL_KEY);
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

/**
 * Cooldown de reenvio do e-mail de ativação.
 * Persistido em localStorage para sobreviver a recarregamentos e evitar
 * cliques excessivos entre abas.
 */
export function startResendCooldown(ms: number = RESEND_COOLDOWN_MS): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESEND_COOLDOWN_KEY, String(Date.now() + ms));
}

export function getResendCooldownRemainingMs(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(RESEND_COOLDOWN_KEY);
  if (!raw) return 0;
  const diff = Number(raw) - Date.now();
  if (diff <= 0) {
    window.localStorage.removeItem(RESEND_COOLDOWN_KEY);
    return 0;
  }
  return diff;
}
