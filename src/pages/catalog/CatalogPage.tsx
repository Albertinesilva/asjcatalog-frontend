import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProductItem, ProductGridSkeleton, ErrorState, EmptyState } from "@/components";
import { Button, Card, Select, cn, inputBaseClasses } from "@/components/ui";
import { catalogGridClasses } from "@/components/shared/catalog-grid";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import { parseApiError } from "@/utils/api-error";
import type { Category, ProductResponse, SpringPage } from "@/types";
import catalogProducts from "@/assets/catalog/catalog-products.jpg";

export default function CatalogPage() {
  const { t } = useTranslation(["catalog"]);
  const [data, setData] = useState<SpringPage<ProductResponse> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  // `message` só é preenchida quando o backend devolveu um erro do contrato da API
  // (já localizado via Accept-Language); nos demais casos a UI usa o texto i18n padrão.
  const [error, setError] = useState<{ message: string | null } | null>(null);
  const latestRequest = useRef(0);
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

  // Também usada como "tentar novamente": repete a busca com página/filtros atuais.
  // Só a resposta da requisição mais recente pode alterar dados/erro/loading.
  const fetchProducts = useCallback(() => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError(null);
    productService
      .findAll({
        page,
        size: pageSize,
        name: debouncedSearch,
        categoryIds: categoryIds || "0",
      })
      .then((products) => {
        if (requestId === latestRequest.current) setData(products);
      })
      .catch((err: unknown) => {
        if (requestId !== latestRequest.current) return;
        const parsed = parseApiError(err);
        setError({ message: parsed.code ? parsed.message : null });
      })
      .finally(() => {
        if (requestId === latestRequest.current) setLoading(false);
      });
  }, [page, debouncedSearch, categoryIds]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    categoryService
      .findAll()
      .then(setCategories)
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

  const pageBtn =
    "inline-flex items-center justify-center w-9 h-9 rounded-full text-small font-semibold " +
    "transition-colors duration-DEFAULT ease-standard " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <div className="w-full mx-auto max-w-[1400px] px-md py-lg lg:px-xl lg:py-xl">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-md mb-lg">
        <h1 className="font-heading text-h2 text-foreground m-0">{t("catalog:title")}</h1>
        <Card
          padding="none"
          elevated={false}
          bordered
          className="flex-1 md:max-w-[720px] flex flex-col md:flex-row md:items-stretch overflow-hidden"
        >
          <input
            type="search"
            className={cn(
              inputBaseClasses,
              "flex-1 border-0 shadow-none bg-transparent md:border-r md:border-border rounded-none",
            )}
            placeholder={t("catalog:search")}
            aria-label={t("catalog:searchAria")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            wrapperClassName="flex-1"
            className="border-0 shadow-none bg-transparent md:border-r md:border-border rounded-none"
            value={categoryIds}
            onChange={(e) => setCategoryIds(e.target.value)}
            aria-label={t("catalog:filterCategoryAria")}
          >
            <option value="">{t("catalog:filterCategory")}</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={clearFilters}
            className="rounded-none md:min-w-[160px] text-foreground-muted hover:text-accent"
          >
            {t("catalog:clearFilters")}
          </Button>
        </Card>
      </header>

      {products.length > 0 && (
        <div className="mb-lg w-full overflow-hidden rounded-lg border border-border bg-surface">
          <img
            src={catalogProducts}
            alt=""
            aria-hidden="true"
            width={2064}
            height={512}
            loading="lazy"
            className="block w-full h-auto aspect-[4/1] object-cover"
          />
        </div>
      )}

      {loading ? (
        <ProductGridSkeleton count={pageSize} />
      ) : error ? (
        <ErrorState description={error.message ?? undefined} onRetry={fetchProducts} />
      ) : products.length === 0 ? (
        <EmptyState
          title={t("catalog:empty")}
          description={t("catalog:emptyHint")}
          illustration={
            <img
              src={catalogProducts}
              alt=""
              aria-hidden="true"
              width={2064}
              height={512}
              loading="lazy"
              className="block w-full max-w-[640px] h-auto aspect-[4/1] object-cover rounded-lg border border-border mb-sm"
            />
          }
        />
      ) : (
        <div className={catalogGridClasses}>
          {products.map((product) => (
            <ProductItem key={product.id} {...product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label={t("catalog:paginationAria")}
          className="mt-xl mb-xl flex items-center justify-center flex-wrap gap-xs"
        >
          <button
            type="button"
            className={cn(
              pageBtn,
              "bg-surface border border-border text-foreground-muted hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed",
            )}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label={t("catalog:previousPageAria")}
          >
            ‹
          </button>
          {pagesToRender.map((item, idx) =>
            item === "dots" ? (
              <span
                key={`dots-${idx}`}
                className="px-xs text-small font-semibold text-foreground-muted"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item - 1)}
                aria-current={item === currentPage ? "page" : undefined}
                className={cn(
                  pageBtn,
                  item === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface border border-border text-foreground hover:bg-surface-hover",
                )}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            className={cn(
              pageBtn,
              "bg-surface border border-border text-foreground-muted hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed",
            )}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label={t("catalog:nextPageAria")}
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
}
