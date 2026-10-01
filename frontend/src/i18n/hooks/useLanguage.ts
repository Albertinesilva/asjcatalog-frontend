import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type SupportedLanguage } from "@/i18n/config";

/**
 * Hook central para leitura, troca e listagem de idiomas.
 * Evita que componentes importem `useTranslation` só para trocar idioma.
 */
export function useLanguage() {
  const { i18n } = useTranslation();

  const current = (i18n.resolvedLanguage ?? i18n.language ?? DEFAULT_LANGUAGE) as SupportedLanguage;

  const available = useMemo(() => SUPPORTED_LANGUAGES, []);

  const change = useCallback(
    async (code: SupportedLanguage) => {
      await i18n.changeLanguage(code);
      if (typeof document !== "undefined") {
        document.documentElement.lang = code;
      }
    },
    [i18n],
  );

  const activeMeta = useMemo(
    () => available.find((l) => l.code === current) ?? available[0],
    [available, current],
  );

  return { current, activeMeta, available, change } as const;
}
