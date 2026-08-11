import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/components/ui/cn";
import { showcaseSlides } from "./slides";

const AUTOPLAY_MS = 6000;

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
  const [paused, setPaused] = useState(false);
  const total = showcaseSlides.length;
  const interacted = useRef(false);

  const go = useCallback((next: number) => setIndex(((next % total) + total) % total), [total]);

  const onUserNav = useCallback(
    (next: number) => {
      interacted.current = true;
      setPaused(true);
      go(next);
    },
    [go],
  );

  useEffect(() => {
    if (reducedMotion || paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused, total]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onUserNav(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onUserNav(index + 1);
    }
  };

  const label = (key: string) => t(`home:showcase.categories.${key}`);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("home:showcase.label")}
      className={cn("w-full max-w-[560px] mx-auto lg:mx-0", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(interacted.current)}
      onFocus={() => setPaused(true)}
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

      <p className="sr-only" aria-live="polite">
        {t("home:showcase.status", {
          current: index + 1,
          total,
          category: label(showcaseSlides[index].key),
        })}
      </p>

      <div className="mt-xl flex items-center justify-between gap-md">
        <ul className="flex items-center gap-sm m-0 p-0 list-none">
          {showcaseSlides.map((slide, i) => (
            <li key={slide.key}>
              <button
                type="button"
                aria-label={label(slide.key)}
                aria-current={i === index ? "true" : undefined}
                onClick={() => onUserNav(i)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-DEFAULT ease-standard",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  i === index ? "w-7 bg-primary" : "w-2.5 bg-border hover:bg-secondary",
                )}
              />
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-sm">
          <button
            type="button"
            aria-label={t("home:showcase.previous")}
            onClick={() => onUserNav(index - 1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors duration-DEFAULT ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            aria-label={t("home:showcase.next")}
            onClick={() => onUserNav(index + 1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors duration-DEFAULT ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}
