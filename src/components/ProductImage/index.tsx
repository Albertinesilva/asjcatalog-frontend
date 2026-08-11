import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  /** Remote product image URL coming from the API (may be missing/broken). */
  src?: string | null;
  alt: string;
  /** Classes applied to the <img> when a valid image is rendered. */
  className?: string;
  /** Classes applied to the fallback wrapper (keeps container dimensions). */
  fallbackClassName?: string;
};

/**
 * ProductImage — single source of truth for rendering product images.
 *
 * Renders the remote image when available and falls back to a neutral,
 * token-based placeholder when `src` is missing, empty or fails to load.
 */
export default function ProductImage({
  src,
  alt,
  className,
  fallbackClassName,
  ...imgProps
}: Props) {
  const initialFailed = !src || src.trim() === "";
  const [failed, setFailed] = useState(initialFailed);

  useEffect(() => {
    setFailed(!src || src.trim() === "");
  }, [src]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center rounded-md bg-surface-hover text-foreground-muted",
          fallbackClassName ?? className,
        )}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-60"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="1.5" />
          <path d="m21 15-4.5-4.5L7 21" />
        </svg>
      </div>
    );
  }

  return (
    <img
      {...imgProps}
      src={src ?? undefined}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
