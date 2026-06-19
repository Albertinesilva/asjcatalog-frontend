import { useEffect, useMemo, useState } from "react";
import { ProductItem } from "@/components";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import type { Category, Product, SpringPage } from "@/types";
import styles from "@/styles/pages/catalog.module.css";

export default function CatalogPage() {
  const [data, setData] = useState<SpringPage<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryIds, setCategoryIds] = useState<string>("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Debounce search input to avoid spamming the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page whenever filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, categoryIds]);

  useEffect(() => {
    setLoading(true);
    productService
      .findAll({
        page,
        size: pageSize,
        name: debouncedSearch,
        categoryIds: categoryIds || "0",
      })
      .then((products) => setData(products))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, categoryIds]);

  useEffect(() => {
    categoryService
      .findAll()
      .then((cats) =>
        setCategories(Array.isArray(cats) ? cats : cats.content),
      )
      .catch(() => {});
  }, []);

  // Backend already filters by name/categoryIds; render the page content directly.
  const products = data?.content ?? [];

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategoryIds("");
  };

  const totalPages = data?.totalPages ?? 0;
  const currentPage = page + 1;

  const pagesToRender = useMemo(() => {
    const items: (number | "dots")[] = [];
    if (totalPages <= 0) return items;
    if (totalPages <= 11) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
      return items;
    }
    for (let i = 1; i <= 10; i++) items.push(i);
    items.push("dots");
    items.push(totalPages);
    return items;
  }, [totalPages]);

  return (
    <div className="container-fluid px-4 py-4">
      <div className={styles.headerRow}>
        <h3 className={styles.catalogTitle}>Catálogo de produtos</h3>
        <div className={`card-base border-radius-10 ${styles.filterCard}`}>
        <div className={styles.filterControls}>
          <div className={styles.searchWrapper}>
            <input
              type="search"
              className={`form-control ${styles.searchInput}`}
              placeholder="Pesquisar Produto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className={styles.searchIcon} aria-hidden>
              ⌕
            </span>
          </div>
          <select
            className={`form-select ${styles.categorySelect}`}
            value={categoryIds}
            onChange={(e) => setCategoryIds(e.target.value)}
          >
            <option value="">Filtrar por Categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`btn btn-outline-secondary ${styles.clearBtn}`}
            onClick={clearFilters}
          >
            LIMPAR FILTRO
          </button>
        </div>
      </div>
      </div>

      {loading && <p className="py-3">Carregando produtos...</p>}
      {error && <p className="py-3 text-danger">Erro: {error}</p>}

      <div className={styles.catalogProducts}>
        {products.length === 0 ? (
          <p className="text-muted py-5 text-center">
            Nenhum produto encontrado.
          </p>
        ) : (
          products.map((product) => (
            <ProductItem key={product.id} {...product} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageArrow}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Página anterior"
          >
            ‹
          </button>
          {pagesToRender.map((item, idx) =>
            item === "dots" ? (
              <span key={`dots-${idx}`} className={styles.pageDots}>
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`${styles.pageDot} ${
                  item === currentPage ? styles.pageDotActive : ""
                }`}
                onClick={() => setPage(item - 1)}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            className={styles.pageArrow}
            onClick={() =>
              setPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage >= totalPages}
            aria-label="Próxima página"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}