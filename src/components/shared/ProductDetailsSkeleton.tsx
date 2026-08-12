import { useTranslation } from "react-i18next";
import { Card, Skeleton } from "@/components/ui";

/** Representação visual da página de detalhes do produto durante o carregamento. */
export default function ProductDetailsSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="w-full mx-auto max-w-[1200px] px-md py-lg lg:px-xl lg:py-xl">
      <Card
        padding="none"
        elevated
        bordered
        className="p-md lg:p-2xl"
        role="status"
        aria-busy="true"
      >
        <span className="sr-only">{t("common:states.loading")}</span>
        <Skeleton className="h-4 w-32 mb-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-start">
          <div className="flex flex-col">
            <div className="flex items-center justify-center min-h-[220px] lg:min-h-[320px] rounded-lg border border-border p-md lg:p-lg">
              <Skeleton className="w-full max-w-[320px] h-[200px] lg:h-[280px]" />
            </div>
            <Skeleton className="h-9 w-3/4 mt-lg" />
            <Skeleton className="h-8 w-1/3 mt-md" />
          </div>
          <div className="rounded-lg border border-border p-md lg:p-lg min-h-[220px]">
            <Skeleton className="h-5 w-40" />
            <div className="mt-md flex flex-col gap-sm">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
