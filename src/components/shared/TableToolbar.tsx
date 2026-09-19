import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui";

type Props = {
  counter?: number;
  children?: ReactNode;
};

/**
 * Cabeçalho reutilizável para listagens administrativas.
 * Slot `children` recebe as ações (botões, links, filtros).
 *
 * Fase 10.2: migrado para Tailwind + Badge do Design System.
 */
export default function TableToolbar({ counter, children }: Props) {
  const { t } = useTranslation();
  const hasCounter = typeof counter === "number";
  return (
    <div className="flex flex-col md:flex-row gap-md items-stretch md:items-center justify-between mb-lg">
      <div className="flex flex-col gap-xs">
        {hasCounter && (
          <Badge variant="default">{t("common:table.records", { count: counter })}</Badge>
        )}
      </div>
      {children && <div className="flex gap-sm flex-wrap">{children}</div>}
    </div>
  );
}
