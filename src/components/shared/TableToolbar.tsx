import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Badge, cn } from "@/components/ui";

type Props = {
  title?: string;
  subtitle?: string;
  counter?: number;
  children?: ReactNode;
  className?: string;
};

/**
 * Cabeçalho reutilizável para listagens administrativas.
 * Slot `children` recebe as ações (botões, links, filtros).
 *
 * Fase 10.2: migrado para Tailwind + Badge do Design System.
 */
export default function TableToolbar({
  title,
  subtitle,
  counter,
  children,
  className = "",
}: Props) {
  const { t } = useTranslation();
  const hasCounter = typeof counter === "number";
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row gap-md items-stretch md:items-center justify-between mb-lg",
        className,
      )}
    >
      <div className="flex flex-col gap-xs">
        {title ? (
          <h2 className="m-0 font-heading font-bold text-h3 text-foreground inline-flex items-center gap-sm">
            {title}
            {hasCounter && <Badge variant="default">{counter}</Badge>}
          </h2>
        ) : (
          hasCounter && (
            <Badge variant="default">{t("common:table.records", { count: counter })}</Badge>
          )
        )}
        {subtitle && <small className="text-small text-foreground-muted">{subtitle}</small>}
      </div>
      {children && <div className="flex gap-sm flex-wrap">{children}</div>}
    </div>
  );
}
