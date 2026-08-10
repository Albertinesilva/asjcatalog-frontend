import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { authService } from "@/services/auth-service";
import { decodeToken } from "@/utils/permissions";
import type { AccessToken, AuthContextData, LoginRequest, Role, User } from "@/types";

export const AuthContext = createContext<AuthContextData | null>(null);

type State = {
  authenticated: boolean;
  token: AccessToken | null;
  user: User | null;
  loading: boolean;
};

/** Decodifica o JWT UMA única vez e deriva todo o estado a partir do payload. */
function readState(): State {
  const payload = decodeToken();
  const authenticated = !!payload?.exp && Date.now() < payload.exp * 1000;
  return {
    authenticated,
    token: authenticated ? payload : null,
    user: null,
    loading: authenticated,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(readState);
  const userRef = useRef<User | null>(null);

  const refresh = useCallback(() => {
    setState((prev) => {
      const next = readState();
      // Preserva o usuário já carregado quando a sessão continua a mesma.
      if (next.authenticated && prev.authenticated && prev.user) {
        return { ...next, user: prev.user, loading: false };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("auth-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("auth-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  /**
   * Expiração ativa: agenda o logout exatamente para o `exp` do JWT e
   * revalida quando a aba volta a ficar visível (sem polling).
   */
  useEffect(() => {
    const exp = state.token?.exp;
    if (!state.authenticated || !exp) return;

    const expireNow = () => {
      authService.logout();
      refresh();
    };

    const msLeft = exp * 1000 - Date.now();
    if (msLeft <= 0) {
      expireNow();
      return;
    }
    // setTimeout satura acima de ~24.8 dias; o clamp mantém o agendamento seguro.
    const timer = window.setTimeout(expireNow, Math.min(msLeft, 2_147_483_000));

    const onVisibility = () => {
      if (document.visibilityState === "visible" && Date.now() >= exp * 1000) {
        expireNow();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [state.authenticated, state.token?.exp, refresh]);

  useEffect(() => {
    if (!state.authenticated) {
      userRef.current = null;
      if (state.loading) setState((s) => ({ ...s, loading: false }));
      return;
    }
    let cancelled = false;
    setState((s) => (s.loading ? s : { ...s, loading: true }));
    authService
      .getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        // Falha transitória em /accounts/me não apaga o último usuário conhecido.
        if (user) userRef.current = user;
        setState((s) => ({ ...s, user: user ?? userRef.current, loading: false }));
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, user: s.user ?? userRef.current, loading: false }));
      });
    return () => {
      cancelled = true;
    };
  }, [state.authenticated]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      await authService.login(credentials);
      refresh();
    },
    [refresh],
  );

  const logout = useCallback(() => {
    authService.logout();
    refresh();
  }, [refresh]);

  const refreshUser = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    const user = await authService.getCurrentUser();
    if (user) userRef.current = user;
    setState((s) => ({ ...s, user: user ?? s.user ?? userRef.current, loading: false }));
  }, []);

  const value = useMemo<AuthContextData>(
    () => ({
      authenticated: state.authenticated,
      loading: state.loading,
      user: state.user,
      userId: state.token?.userId ?? null,
      username: state.token?.username ?? null,
      roles: state.token?.authorities ?? [],
      login,
      logout,
      isAuthenticated: () => state.authenticated,
      hasRole: (role: Role) => (state.token?.authorities ?? []).includes(role),
      refreshUser,
    }),
    [state, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
