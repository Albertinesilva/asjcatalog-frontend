import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ProductItem } from "../components";
import { api } from "../lib/api";
import type { Category, ProductsPage } from "../lib/types";
import styles from "../styles/pages/catalog.module.css";

const productsQueryOptions = queryOptions({
  queryKey: ["catalog", "products", { page: 0, size: 12 }],
  queryFn: async () => {
    const res = await api.get<ProductsPage>("/products", {
      params: { page: 0, size: 12, sort: "name,asc" },
    });
    return res.data;
  },
});

const categoriesQueryOptions = queryOptions({
  queryKey: ["catalog", "categories"],
  queryFn: async () => {
    const res = await api.get<Category[] | { content: Category[] }>(
      "/categories",
    );
    const d = res.data;
    return Array.isArray(d) ? d : d.content;
  },
});

export const Route = createFileRoute("/catalog/")({
  head: () => ({
    meta: [
      { title: "Catálogo — DS Catalog" },
      {
        name: "description",
        content: "Explore o catálogo completo de produtos.",
      },
    ],
  }),
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(productsQueryOptions),
      queryClient.ensureQueryData(categoriesQueryOptions),
    ]),
  component: CatalogPage,
});

function CatalogPage() {
  const { data } = useSuspenseQuery(productsQueryOptions);
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");

  const filtered = useMemo(() => {
    return data.content.filter((p) => {
      const matchName = p.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchCat =
        !categoryId ||
        p.categories?.some((c) => String(c.id) === categoryId);
      return matchName && matchCat;
    });
  }, [data.content, search, categoryId]);

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
  };

  return (
    <div className="container py-4">
      <div
        className={`card-base border-radius-10 ${styles.filterCard}`}
      >
        <h3 className={styles.catalogTitle}>Catálogo de produtos</h3>
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
            {categories?.map((c) => (
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
    </div>
  );
}