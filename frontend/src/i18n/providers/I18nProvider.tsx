import { useEffect, type ReactNode } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "@/i18n/config";

/** Mantém `<html lang>` sincronizado ao idioma ativo. */
function HtmlLangSync() {
  const { i18n: instance } = useTranslation();
  useEffect(() => {
    const apply = () => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = instance.resolvedLanguage ?? instance.language;
      }
    };
    apply();
    instance.on("languageChanged", apply);
    return () => {
      instance.off("languageChanged", apply);
    };
  }, [instance]);
  return null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <HtmlLangSync />
      {children}
    </I18nextProvider>
  );
}
