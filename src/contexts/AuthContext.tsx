import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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

function readState(): State {
  const authenticated = authService.isAuthenticated();
  return {
    authenticated,
    token: authenticated ? decodeToken() : null,
    user: null,
    loading: authenticated,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(readState);

  const refresh = useCallback(() => {
    setState(readState());
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

  useEffect(() => {
    if (!state.authenticated) {
      if (state.loading) setState((s) => ({ ...s, loading: false }));
      return;
    }
    let cancelled = false;
    setState((s) => (s.loading ? s : { ...s, loading: true }));
    authService
      .getCurrentUser()
      .then((user) => {
        if (!cancelled) setState((s) => ({ ...s, user, loading: false }));
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
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
    setState((s) => ({ ...s, user, loading: false }));
  }, []);

  const value = useMemo<AuthContextData>(
    () => ({
      authenticated: state.authenticated,
      loading: state.loading,
      token: state.token,
      user: state.user,
      userId: state.token?.userId ?? null,
      username: state.token?.username ?? null,
      roles: (state.token?.authorities ?? []) as Role[],
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
