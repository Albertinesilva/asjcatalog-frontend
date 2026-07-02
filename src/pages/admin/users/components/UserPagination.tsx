type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
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

export default function UserPagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);

  return (
    <nav aria-label="Paginação" className="d-flex justify-content-center mt-4">
      <ul className="pagination mb-0">
        <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(page - 1)} aria-label="Anterior">
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
              <button className="page-link" onClick={() => onChange(p)}>
                {p + 1}
              </button>
            </li>
          ),
        )}
        <li className={`page-item ${page >= totalPages - 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(page + 1)} aria-label="Próxima">
            ›
          </button>
        </li>
      </ul>
    </nav>
  );
}