import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ProductItemAdmin } from "@/components";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import type { Category, Product, SpringPage } from "@/types";
import styles from "@/styles/pages/dashboardProducts.module.css";
import catalogStyles from "@/styles/pages/catalog.module.css";

export default function ProductListPage() {
  const [data, setData] = useState<SpringPage<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const loadProducts = () => {
    setIsLoading(true);
    productService
      .findAll({ page, size: pageSize })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadProducts, [page]);

  useEffect(() => {
    categoryService
      .findAll()
      .then((cats) =>
        setCategories(Array.isArray(cats) ? cats : cats.content),
      )
      .catch(() => {});
  }, []);

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      productService
        .delete(id)
        .then(loadProducts)
        .catch((err: Error) => setError(err.message));
    }
  };

  const filtered = useMemo(() => {
    return (data?.content ?? []).filter((p) => {
      const matchName = p.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchCat =
        !categoryId || p.categories?.some((c) => String(c.id) === categoryId);
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
    <div className={styles.productListContainer}>
      <div className={styles.toolbar}>
        <Link
          to="/admin/products/new"
          className={`btn btn-primary ${styles.add}`}
        >
          ADICIONAR
        </Link>
        <div className={`card-base border-radius-10 ${catalogStyles.filterCard}`}>
          <div className={catalogStyles.filterControls}>
            <div className={catalogStyles.searchWrapper}>
              <input
                type="search"
                className={`form-control ${catalogStyles.searchInput}`}
                placeholder="Pesquisar Produto"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className={catalogStyles.searchIcon} aria-hidden>
                ⌕
              </span>
            </div>
            <select
              className={`form-select ${catalogStyles.categorySelect}`}
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
              className={`btn btn-outline-secondary ${catalogStyles.clearBtn}`}
              onClick={clearFilters}
            >
              LIMPAR FILTRO
            </button>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column container-fluid">
        {isLoading && <p className="p-3">Carregando produtos...</p>}
        {error && (
          <p className="p-3 text-danger">
            Erro ao carregar produtos: {error}
          </p>
        )}
        {filtered.map((product) => (
          <ProductItemAdmin
            key={product.id}
            {...product}
            onDelete={handleDelete}
          />
        ))}
        {!isLoading && filtered.length === 0 && (
          <p className="text-muted py-5 text-center">
            Nenhum produto encontrado.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className={catalogStyles.pagination}>
          <button
            type="button"
            className={catalogStyles.pageArrow}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Página anterior"
          >
            ‹
          </button>
          {pagesToRender.map((item, idx) =>
            item === "dots" ? (
              <span key={`dots-${idx}`} className={catalogStyles.pageDots}>
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`${catalogStyles.pageDot} ${
                  item === currentPage ? catalogStyles.pageDotActive : ""
                }`}
                onClick={() => setPage(item - 1)}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            className={catalogStyles.pageArrow}
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