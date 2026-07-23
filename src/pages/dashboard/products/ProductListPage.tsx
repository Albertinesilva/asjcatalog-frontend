import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import {
  Authorization,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  Pagination,
  SearchInput,
  TableToolbar,
} from "@/components";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { getApiErrorMessage } from "@/utils/api-error";
import { alerts } from "@/utils/alerts";
import type { Category, Paginated, ProductResponse } from "@/types";
import { buttonClasses } from "@/components/ui";
import { inputBaseClasses } from "@/components/ui/Input";
import { ProductTable } from "./components";
import type { ProductFilters } from "./types";

export default function ProductListPage() {
  const { t } = useTranslation(["products"]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const debouncedName = useDebouncedValue(search.trim(), 400);

  const filters = useMemo<ProductFilters>(
    () => ({ name: debouncedName, categoryId }),
    [debouncedName, categoryId],
  );

  const fetcher = useCallback(
    ({
      page,
      size,
      filters,
    }: {
      page: number;
      size: number;
      filters: ProductFilters;
    }): Promise<Paginated<ProductResponse>> =>
      productService.findAll({
        page,
        size,
        name: filters.name || "",
        categoryIds: filters.categoryId || "0",
      }),
    [],
  );

  const { data, isLoading, error, pagination, refetch } = usePagedQuery<
    ProductResponse,
    ProductFilters
  >(fetcher, { initialSize: 10, filters });

  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    categoryService
      .findAll()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const [pendingDelete, setPendingDelete] = useState<ProductResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await productService.delete(pendingDelete.id);
      setPendingDelete(null);
      refetch();
      await alerts.success(
        t("products:success.deletedTitle"),
        t("products:success.deletedMessage"),
      );
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <TableToolbar counter={pagination.totalElements}>
        <Authorization roles={["ROLE_OPERATOR", "ROLE_ADMIN"]}>
          <Link to="/dashboard/products/new" className={buttonClasses("primary", "md")}>
            {t("products:actions.create")}
          </Link>
        </Authorization>
      </TableToolbar>

      <div className="mb-lg flex flex-col md:flex-row gap-sm">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
            placeholder={t("products:placeholders.search")}
            ariaLabel={t("products:filters.searchAria")}
          />
        </div>
        <select
          className={`${inputBaseClasses} md:max-w-[260px]`}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-label={t("products:filters.categoryAria")}
        >
          <option value="">{t("products:placeholders.category")}</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {deleteError && <ErrorState message={deleteError} />}

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          <ProductTable products={data} onDelete={setPendingDelete} />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={pagination.goToPage}
          />
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title={t("products:dialogs.delete.title")}
        description={
          pendingDelete ? (
            <p className="mb-0">
              <Trans
                i18nKey="products:dialogs.delete.message"
                values={{ name: pendingDelete.name }}
                components={{ strong: <strong /> }}
              />
            </p>
          ) : undefined
        }
        confirmLabel={t("products:dialogs.delete.confirm")}
        cancelLabel={t("products:dialogs.delete.cancel")}
        confirmingLabel={t("products:dialogs.delete.confirming")}
        variant="danger"
        isConfirming={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
