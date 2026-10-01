import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/components/ui/cn";
import { showcaseSlides } from "./slides";

const AUTOPLAY_MS = 5000;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * ProductShowcase — Home hero carousel.
 *
 * Editorial product composition (one main image + one supporting detail card)
 * rotating across catalog categories. Design System only: semantic tokens,
 * Card-like surfaces, Tailwind utilities.
 */
export default function ProductShowcase({ className }: { className?: string }) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  // Pausa explícita (botão) e pausa enquanto o foco de TECLADO está no carrossel.
  // Nenhuma das duas é permanente: o autoplay retoma ao despausar/perder o foco.
  const [userPaused, setUserPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const total = showcaseSlides.length;
  const playing = !reducedMotion && !userPaused && !focusPaused;

  const go = useCallback((next: number) => setIndex(((next % total) + total) % total), [total]);

  // Um único timeout por slide: navegar (manual ou automático) troca `index`, o cleanup
  // cancela o timeout anterior e um novo é armado — nunca há dois timers vivos.
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, index, total]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    }
  };

  const label = (key: string) => t(`home:showcase.categories.${key}`);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("home:showcase.label")}
      className={cn("w-full max-w-[560px] mx-auto lg:mx-0", className)}
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setFocusPaused(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocusPaused(false);
      }}
    >
      <div
        tabIndex={0}
        role="group"
        aria-label={t("home:showcase.slidesRegion")}
        onKeyDown={onKeyDown}
        className={cn(
          "relative rounded-xl focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        )}
      >
        <div className="relative aspect-[4/3] w-full">
          {showcaseSlides.map((slide, i) => {
            const active = i === index;
            return (
              <div
                key={slide.key}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${total} — ${label(slide.key)}`}
                aria-hidden={!active}
                className={cn(
                  "absolute inset-0 transition-opacity ease-standard motion-reduce:transition-none",
                  active
                    ? "opacity-100 duration-slow"
                    : "opacity-0 duration-slow pointer-events-none",
                )}
              >
                <div className="absolute inset-0 rounded-xl overflow-hidden border border-border bg-surface shadow-lg">
                  <img
                    src={slide.main}
                    alt={t("home:showcase.mainAlt", { category: label(slide.key) })}
                    width={1200}
                    height={1200}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div
                  className={cn(
                    "absolute -bottom-4 -left-2 sm:-left-6 w-[34%] max-w-[150px]",
                    "rounded-lg overflow-hidden border border-border bg-card shadow-xl",
                  )}
                >
                  <img
                    src={slide.detail}
                    alt={t("home:showcase.detailAlt", { category: label(slide.key) })}
                    width={800}
                    height={800}
                    loading="lazy"
                    className="h-full w-full object-cover aspect-square"
                  />
                </div>

                <div className="absolute top-md left-md rounded-full bg-card/90 border border-border px-3 py-1 shadow-sm">
                  <span className="font-heading text-caption uppercase tracking-wider text-foreground">
                    {label(slide.key)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="sr-only" aria-live={playing ? "off" : "polite"}>
        {t("home:showcase.status", {
          current: index + 1,
          total,
          category: label(showcaseSlides[index].key),
        })}
      </p>

      <div className="mt-xl flex flex-wrap items-center justify-between gap-md">
        <ul className="flex items-center m-0 p-0 list-none">
          {showcaseSlides.map((slide, i) => (
            <li key={slide.key}>
              <button
                type="button"
                aria-label={label(slide.key)}
                aria-current={i === index ? "true" : undefined}
                onClick={() => go(i)}
                className={cn(
                  // hit area 24px (the dot itself stays 10px): visual density preserved
                  "group inline-flex h-6 items-center justify-center rounded-full px-[7px]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "block h-2.5 rounded-full transition-all ease-standard",
                    i === index ? "w-7 bg-primary" : "w-2.5 bg-border group-hover:bg-secondary",
                  )}
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-sm">
          {!reducedMotion && (
            <button
              type="button"
              aria-label={userPaused ? t("home:showcase.play") : t("home:showcase.pause")}
              onClick={() => setUserPaused((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {userPaused ? <PlayIcon /> : <PauseIcon />}
            </button>
          )}
          <button
            type="button"
            aria-label={t("home:showcase.previous")}
            onClick={() => go(index - 1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            aria-label={t("home:showcase.next")}
            onClick={() => go(index + 1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}
