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
  const [categoryId, setCategoryId] = useState<string>("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    setLoading(true);
    productService
      .findAll({ page, size: pageSize })
      .then((products) => setData(products))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    categoryService
      .findAll()
      .then((cats) =>
        setCategories(Array.isArray(cats) ? cats : cats.content),
      )
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return (data?.content ?? []).filter((p) => {
      const matchName = p.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchCat =
        !categoryId ||
        p.categories?.some((c) => String(c.id) === categoryId);
      return matchName && matchCat;
    });
  }, [data?.content, search, categoryId]);

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
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
      <h3 className={styles.catalogTitle}>Catálogo de produtos</h3>

      {loading && <p className="py-3">Carregando produtos...</p>}
      {error && <p className="py-3 text-danger">Erro: {error}</p>}

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
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
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

      <div className={styles.catalogProducts}>
        {filtered.length === 0 ? (
          <p className="text-muted py-5 text-center">
            Nenhum produto encontrado.
          </p>
        ) : (
          filtered.map((product) => (
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