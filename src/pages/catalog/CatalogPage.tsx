import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProductItem, LoadingState, ErrorState, EmptyState } from "@/components";
import { Button, Card, cn, inputBaseClasses } from "@/components/ui";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import type { Category, ProductResponse, SpringPage } from "@/types";
import catalogProducts from "@/assets/catalog/catalog-products.jpg";

export default function CatalogPage() {
  const { t } = useTranslation(["catalog"]);
  const [data, setData] = useState<SpringPage<ProductResponse> | null>(null);
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
          <select
            className={cn(
              inputBaseClasses,
              "flex-1 border-0 shadow-none bg-transparent md:border-r md:border-border rounded-none",
            )}
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
          </select>
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
        <div className="mb-lg overflow-hidden rounded-lg border border-border bg-surface">
          <img
            src={catalogProducts}
            alt=""
            aria-hidden="true"
            width={1920}
            height={640}
            loading="lazy"
            className="w-full h-24 sm:h-28 lg:h-32 object-cover object-bottom"
          />
        </div>
      )}

      {loading ? (
        <LoadingState message={t("catalog:loading")} />
      ) : error ? (
        <ErrorState message={error} />
      ) : products.length === 0 ? (
        <EmptyState
          title={t("catalog:empty")}
          description={t("catalog:emptyHint")}
          illustration={
            <img
              src={catalogProducts}
              alt=""
              aria-hidden="true"
              width={1920}
              height={640}
              loading="lazy"
              className="w-full max-w-[520px] h-32 sm:h-40 object-cover object-bottom rounded-lg border border-border mb-sm"
            />
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-md">
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
