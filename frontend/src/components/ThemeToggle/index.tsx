import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import { THEME_OPTIONS, type Theme } from "@/contexts/theme-context";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const ICONS: Record<Theme, ReactElement> = {
  light: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  dark: (
    <svg {...iconProps}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  ),
  system: (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
};

/**
 * Alterna a preferência de tema em ciclo: claro -> escuro -> sistema.
 * O ícone mostra a preferência atual; o `aria-label` informa a atual e a próxima.
 * Usado no Navbar (desktop: só ícone; menu mobile: ícone + nome) sobre `bg-brand`.
 */
export default function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const next = THEME_OPTIONS[(THEME_OPTIONS.indexOf(theme) + 1) % THEME_OPTIONS.length];
  const current = t(`navigation:theme.${theme}`);
  const label = t("navigation:theme.toggle", { current, next: t(`navigation:theme.${next}`) });

  return withLabel ? (
    <Button
      type="button"
      variant="inverse"
      size="md"
      onClick={() => setTheme(next)}
      aria-label={label}
      leftIcon={ICONS[theme]}
      className="border-brand-foreground/30"
    >
      {t("navigation:theme.current", { current })}
    </Button>
  ) : (
    <Button
      type="button"
      variant="inverse"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className="border-transparent"
    >
      {ICONS[theme]}
    </Button>
  );
}
