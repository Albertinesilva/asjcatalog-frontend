import { useTranslation } from "react-i18next";
import { Skeleton, cn } from "@/components/ui";
import { catalogGridClasses } from "./catalog-grid";

type Props = { count?: number; className?: string };

/** Representação visual do grid de produtos durante o carregamento. */
export default function ProductGridSkeleton({ count = 10, className }: Props) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(catalogGridClasses, className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{t("common:states.loading")}</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-center min-h-[170px] p-md border-b border-border">
            <Skeleton className="w-full max-w-[160px] aspect-[197/158]" />
          </div>
          <div className="p-md">
            <div className="min-h-[3rem] flex flex-col gap-xs">
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="mt-md h-7 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
