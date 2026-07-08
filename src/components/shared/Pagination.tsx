import { cn } from "@/components/ui";

type Props = {
  /** Página atual (0-based, padrão Spring). */
  page: number;
  /** Total de páginas disponíveis. */
  totalPages: number;
  /** Callback disparado ao trocar de página. */
  onChange: (page: number) => void;
  /** Label acessível do <nav>. */
  ariaLabel?: string;
};

function buildPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | "…")[] = [0];
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  if (start > 1) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 2) pages.push("…");
  pages.push(total - 1);
  return pages;
}

/**
 * Paginação numérica genérica (0-based) para qualquer recurso paginado.
 * Desacoplada do domínio — recebe apenas page/totalPages/onChange.
 */
const dotBase =
  "inline-flex items-center justify-center h-9 min-w-9 px-2 rounded-full text-small font-heading font-semibold " +
  "transition-colors duration-DEFAULT ease-standard " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export default function Pagination({ page, totalPages, onChange, ariaLabel = "Paginação" }: Props) {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);

  return (
    <nav aria-label={ariaLabel} className="flex justify-center mt-lg">
      <ul className="flex items-center gap-xs list-none m-0 p-0">
        <li>
          <button
            type="button"
            className={cn(
              dotBase,
              "bg-surface text-foreground-muted border border-border hover:bg-surface-hover",
            )}
            onClick={() => onChange(page - 1)}
            aria-label="Página anterior"
            disabled={page === 0}
          >
            ‹
          </button>
        </li>
        {pages.map((p, i) =>
          p === "…" ? (
            <li key={`e-${i}`} className="text-foreground-muted px-1 select-none">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                aria-current={p === page ? "page" : undefined}
                onClick={() => onChange(p)}
                className={cn(
                  dotBase,
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-foreground-muted border border-border hover:bg-surface-hover hover:text-foreground",
                )}
              >
                {p + 1}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            className={cn(
              dotBase,
              "bg-surface text-foreground-muted border border-border hover:bg-surface-hover",
            )}
            onClick={() => onChange(page + 1)}
            aria-label="Próxima página"
            disabled={page >= totalPages - 1}
          >
            ›
          </button>
        </li>
      </ul>
    </nav>
  );
}
