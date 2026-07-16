/**
 * Ponte i18n ↔ HTTP layer.
 *
 * O idioma ativo é publicado em `getCurrentLanguage()`, consumido pelo
 * interceptor Axios (`src/api/axios.ts`) para injetar `Accept-Language`
 * em toda requisição — assim páginas e services nunca precisam configurar
 * o header manualmente.
 */
import i18n, { DEFAULT_LANGUAGE, type SupportedLanguage } from "./config";

export function getCurrentLanguage(): SupportedLanguage {
  const active = (i18n.resolvedLanguage ?? i18n.language ?? DEFAULT_LANGUAGE) as SupportedLanguage;
  return active;
}

/** Normaliza para um formato válido de Accept-Language. */
export function getAcceptLanguageHeader(): string {
  const active = getCurrentLanguage();
  // pt-BR aceito diretamente; en → en-US; es → es-ES para melhor casamento.
  if (active === "en") return "en-US,en;q=0.9";
  if (active === "es") return "es-ES,es;q=0.9";
  return "pt-BR,pt;q=0.9";
}