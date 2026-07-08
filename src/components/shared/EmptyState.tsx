import type { ReactNode } from "react";
import { cn } from "@/components/ui";

type Props = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * Estado vazio. Fase 10.2: migrado para Tailwind + tokens.
 */
export default function EmptyState({
  title = "Nenhum resultado encontrado",
  description,
  action,
  className = "",
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-xl text-center gap-sm",
        className,
      )}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground-muted mb-xs"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <h5 className="font-heading text-title text-foreground m-0">{title}</h5>
      {description && <p className="text-body text-foreground-muted m-0">{description}</p>}
      {action && <div className="mt-sm">{action}</div>}
    </div>
  );
}
