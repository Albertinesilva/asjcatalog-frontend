import { useTranslation } from "react-i18next";
import { Card, Skeleton } from "@/components/ui";

/** Placeholder do formulário de produto enquanto os dados de edição carregam. */
export default function ProductFormSkeleton() {
  const { t } = useTranslation();
  return (
    <Card padding="lg" role="status" aria-busy="true">
      <span className="sr-only">{t("common:states.loading")}</span>
      <div className="flex flex-col gap-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-[136px] w-full" />
          <Skeleton className="h-4 w-2/5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-[104px] w-full" />
        </div>
        <div className="flex flex-wrap gap-sm pt-sm">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </Card>
  );
}
