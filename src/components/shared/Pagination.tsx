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
export default function Pagination({ page, totalPages, onChange, ariaLabel = "Paginação" }: Props) {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);

  return (
    <nav aria-label={ariaLabel} className="d-flex justify-content-center mt-4">
      <ul className="pagination mb-0">
        <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onChange(page - 1)}
            aria-label="Anterior"
            disabled={page === 0}
          >
            ‹
          </button>
        </li>
        {pages.map((p, i) =>
          p === "…" ? (
            <li key={`e-${i}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
              <button type="button" className="page-link" onClick={() => onChange(p)}>
                {p + 1}
              </button>
            </li>
          ),
        )}
        <li className={`page-item ${page >= totalPages - 1 ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onChange(page + 1)}
            aria-label="Próxima"
            disabled={page >= totalPages - 1}
          >
            ›
          </button>
        </li>
      </ul>
    </nav>
  );
}