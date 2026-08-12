import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { categoryService } from "@/services/category-service";
import {
  Authorization,
  ConfirmDialog,
  ErrorState,
  SearchInput,
  TableToolbar,
} from "@/components";
import TableSkeleton from "@/components/shared/TableSkeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/utils/api-error";
import { alerts } from "@/utils/alerts";
import type { Category } from "@/types";
import { buttonClasses } from "@/components/ui";
import { CategoryTable } from "./components";

export default function CategoryListPage() {
  const { t } = useTranslation(["categories", "common"]);
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const debouncedName = useDebouncedValue(search.trim(), 400);

  const load = () => {
    setIsLoading(true);
    setError(null);
    categoryService
      .findAll()
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = debouncedName.toLowerCase();
    if (!term) return data;
    return data.filter((c) => c.name.toLowerCase().includes(term));
  }, [data, debouncedName]);

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await categoryService.delete(pendingDelete.id);
      setPendingDelete(null);
      load();
      await alerts.success(
        t("categories:delete.successTitle"),
        t("categories:delete.successMessage"),
      );
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <TableToolbar counter={filtered.length}>
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

      {deleteError && <ErrorState message={deleteError} />}

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <CategoryTable categories={filtered} onDelete={setPendingDelete} />
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
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
