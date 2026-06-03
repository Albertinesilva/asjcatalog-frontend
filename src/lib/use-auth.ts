import { useEffect, useState } from "react";
import { getDecodedToken, isAuthenticated } from "./auth";
import type { AccessToken } from "./types";

export function useAuth() {
  const [state, setState] = useState<{
    authenticated: boolean;
    token: AccessToken | null;
  }>({ authenticated: false, token: null });

  useEffect(() => {
    const sync = () =>
      setState({
        authenticated: isAuthenticated(),
        token: getDecodedToken(),
      });
    sync();
    window.addEventListener("auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return state;
}