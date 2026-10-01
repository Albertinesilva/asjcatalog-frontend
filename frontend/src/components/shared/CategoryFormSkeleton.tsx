import { useTranslation } from "react-i18next";
import { Card, Skeleton } from "@/components/ui";

/** Placeholder do formulário de categoria enquanto os dados de edição carregam. */
export default function CategoryFormSkeleton() {
  const { t } = useTranslation();
  return (
    <Card padding="lg" className="max-w-2xl" role="status" aria-busy="true">
      <span className="sr-only">{t("common:states.loading")}</span>
      <div className="flex flex-col gap-md">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-wrap gap-sm pt-sm">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </Card>
  );
}
