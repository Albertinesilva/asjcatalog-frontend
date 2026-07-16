/**
 * Configuração central do i18next.
 *
 * - Suporte a pt-BR, en, es.
 * - Detecção automática via preferência salva → navegador → fallback pt-BR.
 * - Namespaces separados por domínio (common, navigation, auth, ...).
 * - Preparado para lazy loading futuro (o backend também segue Accept-Language).
 */
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import ptBRCommon from "./locales/pt-BR/common.json";
import ptBRNavigation from "./locales/pt-BR/navigation.json";
import ptBRValidation from "./locales/pt-BR/validation.json";
import ptBRAuth from "./locales/pt-BR/auth.json";
import ptBRProfile from "./locales/pt-BR/profile.json";
import ptBRDashboard from "./locales/pt-BR/dashboard.json";
import ptBRCatalog from "./locales/pt-BR/catalog.json";
import ptBRProducts from "./locales/pt-BR/products.json";
import ptBRCategories from "./locales/pt-BR/categories.json";
import ptBRUsers from "./locales/pt-BR/users.json";
import ptBRHome from "./locales/pt-BR/home.json";

import enCommon from "./locales/en/common.json";
import enNavigation from "./locales/en/navigation.json";
import enValidation from "./locales/en/validation.json";
import enAuth from "./locales/en/auth.json";
import enProfile from "./locales/en/profile.json";
import enDashboard from "./locales/en/dashboard.json";
import enCatalog from "./locales/en/catalog.json";
import enProducts from "./locales/en/products.json";
import enCategories from "./locales/en/categories.json";
import enUsers from "./locales/en/users.json";
import enHome from "./locales/en/home.json";

import esCommon from "./locales/es/common.json";
import esNavigation from "./locales/es/navigation.json";
import esValidation from "./locales/es/validation.json";
import esAuth from "./locales/es/auth.json";
import esProfile from "./locales/es/profile.json";
import esDashboard from "./locales/es/dashboard.json";
import esCatalog from "./locales/es/catalog.json";
import esProducts from "./locales/es/products.json";
import esCategories from "./locales/es/categories.json";
import esUsers from "./locales/es/users.json";
import esHome from "./locales/es/home.json";

export const SUPPORTED_LANGUAGES = [
  { code: "pt-BR", label: "Português", short: "PT", flag: "🇧🇷" },
  { code: "en", label: "English", short: "EN", flag: "🇺🇸" },
  { code: "es", label: "Español", short: "ES", flag: "🇪🇸" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: SupportedLanguage = "pt-BR";

export const I18N_STORAGE_KEY = "asj.lang";

export const NAMESPACES = [
  "common",
  "navigation",
  "validation",
  "auth",
  "profile",
  "dashboard",
  "catalog",
  "products",
  "categories",
  "users",
  "home",
] as const;

const resources = {
  "pt-BR": {
    common: ptBRCommon,
    navigation: ptBRNavigation,
    validation: ptBRValidation,
    auth: ptBRAuth,
    profile: ptBRProfile,
    dashboard: ptBRDashboard,
    catalog: ptBRCatalog,
    products: ptBRProducts,
    categories: ptBRCategories,
    users: ptBRUsers,
    home: ptBRHome,
  },
  en: {
    common: enCommon,
    navigation: enNavigation,
    validation: enValidation,
    auth: enAuth,
    profile: enProfile,
    dashboard: enDashboard,
    catalog: enCatalog,
    products: enProducts,
    categories: enCategories,
    users: enUsers,
    home: enHome,
  },
  es: {
    common: esCommon,
    navigation: esNavigation,
    validation: esValidation,
    auth: esAuth,
    profile: esProfile,
    dashboard: esDashboard,
    catalog: esCatalog,
    products: esProducts,
    categories: esCategories,
    users: esUsers,
    home: esHome,
  },
} as const;

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
      ns: NAMESPACES as unknown as string[],
      defaultNS: "common",
      interpolation: { escapeValue: false },
      returnNull: false,
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        lookupLocalStorage: I18N_STORAGE_KEY,
        caches: ["localStorage"],
      },
      react: { useSuspense: false },
    });
}

export default i18n;