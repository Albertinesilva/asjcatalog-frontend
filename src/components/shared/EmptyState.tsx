import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/components/ui";

type Props = {
  title?: string;
  description?: string;
  action?: ReactNode;
  /** Optional decorative illustration rendered above the title. */
  illustration?: ReactNode;
  className?: string;
};

/**
 * Estado vazio. Fase 10.2: migrado para Tailwind + tokens.
 */
export default function EmptyState({
  title,
  description,
  action,
  illustration,
  className = "",
}: Props) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("common:states.empty");
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-xl text-center gap-sm",
        className,
      )}
    >
      {illustration ?? (
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
      )}
      <h5 className="font-heading text-title text-foreground m-0">{resolvedTitle}</h5>
      {description && <p className="text-body text-foreground-muted m-0">{description}</p>}
      {action && <div className="mt-sm">{action}</div>}
    </div>
  );
}
