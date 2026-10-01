import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { categoryService } from "@/services/category-service";
import {
  Authorization,
  ConfirmDialog,
  ErrorState,
  Pagination,
  SearchInput,
  TableSkeleton,
  TableToolbar,
} from "@/components";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { getUiErrorMessage } from "@/utils/ui-error";
import { parseApiError } from "@/utils/api-error";
import { alerts } from "@/utils/alerts";
import type { Category, Paginated } from "@/types";
import { buttonClasses } from "@/components/ui";
import { CategoryTable } from "./components";
import type { CategoryFilters } from "./types";

export default function CategoryListPage() {
  const { t } = useTranslation(["categories", "common"]);
  const [search, setSearch] = useState("");
  const debouncedName = useDebouncedValue(search.trim(), 400);
  const filters = useMemo<CategoryFilters>(() => ({ name: debouncedName }), [debouncedName]);

  const fetcher = useCallback(
    ({
      page,
      size,
      filters,
    }: {
      page: number;
      size: number;
      filters: CategoryFilters;
    }): Promise<Paginated<Category>> =>
      categoryService.findPage({ page, size, name: filters.name }),
    [],
  );

  const { data, isLoading, error, pagination, refetch } = usePagedQuery<Category, CategoryFilters>(
    fetcher,
    { initialSize: 10, filters },
  );

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const closeDeleteDialog = () => {
    setPendingDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await categoryService.delete(pendingDelete.id);
      closeDeleteDialog();
      refetch();
      await alerts.success(
        t("categories:delete.successTitle"),
        t("categories:delete.successMessage"),
      );
    } catch (err) {
      // HTTP 409 nesta ação específica (exclusão de categoria) só ocorre pela
      // violação de FK de `tb_product_category`: o backend não distingue esse
      // caso de outros conflitos de integridade e devolve uma mensagem
      // genérica ("Conflito de dados"). Como aqui o significado é inequívoco,
      // a UI substitui o texto por uma orientação específica; os demais 409
      // do sistema continuam usando a mensagem padrão do backend.
      const parsed = parseApiError(err);
      setDeleteError(
        parsed.code === "CONFLICT"
          ? t("categories:delete.conflictMessage")
          : getUiErrorMessage(err),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <TableToolbar counter={pagination.totalElements}>
        <Authorization roles={["ROLE_OPERATOR", "ROLE_ADMIN"]}>
          <Link to="/dashboard/categories/new" className={buttonClasses("primary", "md")}>
            {t("categories:add")}
          </Link>
        </Authorization>
      </TableToolbar>

      <div className="mb-lg">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder={t("categories:search")}
          ariaLabel={t("categories:searchAria")}
        />
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          <CategoryTable
            categories={data}
            filtered={Boolean(filters.name)}
            onClearFilters={() => setSearch("")}
            onDelete={setPendingDelete}
          />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={pagination.goToPage}
          />
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title={t("categories:delete.title")}
        description={
          pendingDelete ? (
            <p className="mb-0">
              <Trans
                i18nKey="categories:delete.confirmMessage"
                values={{ name: pendingDelete.name }}
                components={{ strong: <strong /> }}
              />
            </p>
          ) : undefined
        }
        confirmLabel={t("categories:delete.confirm")}
        cancelLabel={t("categories:delete.cancel")}
        confirmingLabel={t("categories:delete.confirming")}
        variant="danger"
        isConfirming={isDeleting}
        error={deleteError}
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
