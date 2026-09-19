import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DARK_MEDIA_QUERY,
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
  ThemeContext,
  type ResolvedTheme,
  type Theme,
  type ThemeContextData,
} from "./theme-context";

/** Sem preferência salva (ou valor inválido/storage indisponível) => segue o sistema. */
function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_OPTIONS.includes(stored as Theme) ? (stored as Theme) : "system";
  } catch {
    return "system";
  }
}

function readSystemDark(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(DARK_MEDIA_QUERY).matches;
}

/**
 * Fonte única do tema:
 *   preferência (light | dark | system) -> tema resolvido -> classe `.dark` no <html>
 *   -> tokens semânticos CSS (globals.css) -> componentes.
 * A preferência só é gravada quando o usuário escolhe; mudanças do sistema nunca
 * sobrescrevem uma escolha explícita.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [systemDark, setSystemDark] = useState<boolean>(readSystemDark);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(DARK_MEDIA_QUERY);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage indisponível: a preferência vale só nesta sessão */
    }
  }, []);

  const value = useMemo<ThemeContextData>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
