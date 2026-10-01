import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/hooks/useLanguage";
import { cn } from "@/components/ui";
import type { SupportedLanguage } from "@/i18n/config";

type Variant = "onPrimary" | "onSurface";

type Props = {
  variant?: Variant;
  className?: string;
};

/**
 * Seletor de idioma acessível e responsivo.
 * - Dropdown custom (não é <select>).
 * - Navegação por teclado (Enter/Espaço/Escape/Setas).
 * - Fecha ao clicar fora ou perder foco.
 */
export default function LanguageSelector({ variant = "onPrimary", className }: Props) {
  const { t } = useTranslation();
  const { current, activeMeta, available, change } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && listRef.current) {
      const first =
        listRef.current.querySelector<HTMLButtonElement>('button[data-active="true"]') ??
        listRef.current.querySelector<HTMLButtonElement>("button");
      first?.focus();
    }
  }, [open]);

  const handleSelect = async (code: SupportedLanguage) => {
    await change(code);
    setOpen(false);
  };

  const isOnPrimary = variant === "onPrimary";

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common:language.select")}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-xs rounded-md px-sm py-xs text-small font-heading font-semibold transition-colors ease-standard focus-visible:outline-none focus-visible:ring-2",
          isOnPrimary
            ? "text-brand-foreground hover:bg-brand-foreground/10 focus-visible:ring-brand-foreground/60"
            : "text-foreground hover:bg-surface-hover focus-visible:ring-ring",
        )}
      >
        <span aria-hidden className="text-body">
          {activeMeta.flag}
        </span>
        <span>{activeMeta.short}</span>
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill="none"
          className={cn("transition-transform ease-standard", open && "rotate-180")}
        >
          <path
            d="M5 8l5 5 5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={t("common:language.label")}
          className="absolute right-0 mt-xs min-w-[180px] rounded-md border border-border bg-surface shadow-lg z-dropdown overflow-hidden animate-fade-in"
        >
          {available.map((lang) => {
            const active = lang.code === current;
            return (
              <li key={lang.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  data-active={active}
                  onClick={() => handleSelect(lang.code)}
                  className={cn(
                    "w-full flex items-center gap-sm px-md py-sm text-small text-left transition-colors duration-fast ease-standard focus-visible:outline-none",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-surface-hover focus:bg-surface-hover",
                  )}
                >
                  <span aria-hidden className="text-body">
                    {lang.flag}
                  </span>
                  <span className="flex-1">{lang.label}</span>
                  {active && (
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
                      <path
                        d="M4 10l4 4 8-8"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
