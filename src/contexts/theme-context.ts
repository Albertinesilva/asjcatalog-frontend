import { createContext } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type ThemeContextData = {
  /** Preferência do usuário (`system` = seguir o sistema operacional). */
  theme: Theme;
  /** Tema efetivamente aplicado (`.dark` no <html> quando "dark"). */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

/**
 * Chave da preferência (mesma convenção `asj.*` do idioma).
 * ATENÇÃO: o script anti-FOUC em `index.html` lê esta mesma chave.
 */
export const THEME_STORAGE_KEY = "asj.theme";
export const THEME_OPTIONS: readonly Theme[] = ["light", "dark", "system"];
export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/**
 * O objeto de contexto vive num módulo separado (sem componentes) para que o
 * Fast Refresh não o recrie ao editar o ThemeProvider (mesmo padrão do AuthContext).
 */
export const ThemeContext = createContext<ThemeContextData | null>(null);
