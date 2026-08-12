import { Card, Skeleton } from "@/components/ui";

type Props = { rows?: number };

/** Placeholder de carregamento para listagens tabulares do dashboard. */
export default function TableSkeleton({ rows = 6 }: Props) {
  return (
    <Card padding="lg" className="flex flex-col gap-md" role="status" aria-busy="true">
      <span className="sr-only">…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-md">
          <Skeleton className="h-4 w-10 shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <Skeleton className="h-8 w-20 shrink-0" />
        </div>
      ))}
    </Card>
  );
}
