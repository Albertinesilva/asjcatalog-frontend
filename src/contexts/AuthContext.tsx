import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { authService } from "@/services/auth-service";
import { hasRefreshToken, refreshSession } from "@/api/auth-api";
import { decodeToken } from "@/utils/permissions";
import { TOKEN_REFRESH_SKEW_MS } from "@/utils/constants";
import type { AccessToken, AuthContextData, LoginRequest, Role, User } from "@/types";
import { AuthContext } from "./auth-context";

export { AuthContext };

type State = {
  authenticated: boolean;
  token: AccessToken | null;
  user: User | null;
  loading: boolean;
};

/**
 * Decodifica o JWT UMA única vez e deriva todo o estado a partir do payload.
 * Com refresh token disponível a sessão permanece autenticada mesmo com o
 * Access Token vencido: a renovação silenciosa cuida de emitir um novo par.
 */
function readState(): State {
  const payload = decodeToken();
  const accessValid = !!payload?.exp && Date.now() < payload.exp * 1000;
  const authenticated = !!payload && (accessValid || hasRefreshToken());
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
   * Renovação silenciosa: agenda o refresh ~60s antes do `exp` do JWT e
   * revalida quando a aba volta a ficar visível (sem polling). O logout só
   * ocorre quando a renovação falha definitivamente.
   */
  useEffect(() => {
    const exp = state.token?.exp;
    if (!state.authenticated || !exp) return;

    let cancelled = false;

    const endSession = () => {
      authService.logout();
      refresh();
    };

    const renew = () => {
      if (!hasRefreshToken()) {
        // Sem refresh token, o vencimento do Access Token encerra a sessão.
        if (Date.now() >= exp * 1000) endSession();
        return;
      }
      // `refreshSession` é single-flight: chamadas concorrentes compartilham
      // a mesma Promise e persistem o novo par de tokens (auth-change).
      refreshSession().catch(() => {
        if (!cancelled) endSession();
      });
    };

    const refreshAt = exp * 1000 - TOKEN_REFRESH_SKEW_MS;
    const msLeft = refreshAt - Date.now();
    let timer: number | undefined;
    if (msLeft <= 0) {
      renew();
    } else {
      // setTimeout satura acima de ~24.8 dias; o clamp mantém o agendamento seguro.
      timer = window.setTimeout(renew, Math.min(msLeft, 2_147_483_000));
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible" && Date.now() >= refreshAt) {
        renew();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [state.authenticated, state.token?.exp, refresh]);


  useEffect(() => {
    if (!state.authenticated) {
      userRef.current = null;
      // Atualização funcional: evita ler `state.loading` do closure sem
      // alterar o comportamento (só encerra o loading quando ativo).
      setState((s) => (s.loading ? { ...s, loading: false } : s));
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
        if (!cancelled)
          setState((s) => ({ ...s, user: s.user ?? userRef.current, loading: false }));
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
