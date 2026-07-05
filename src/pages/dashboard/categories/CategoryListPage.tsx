import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { categoryService } from "@/services/category-service";
import {
  Authorization,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  SearchInput,
  TableToolbar,
} from "@/components";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/utils/api-errors";
import { alerts } from "@/utils/alerts";
import type { Category } from "@/types";
import styles from "@/styles/action-buttons.module.css";
import { CategoryTable } from "./components";

export default function CategoryListPage() {
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
      await alerts.success("Categoria removida", "Categoria removida com sucesso.");
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <TableToolbar
        counter={filtered.length}
      >
        <Authorization roles={["ROLE_OPERATOR", "ROLE_ADMIN"]}>
          <Link to="/dashboard/categories/new" className={`btn btn-primary ${styles.actionBtnLg}`}>
            ADICIONAR
          </Link>
        </Authorization>
      </TableToolbar>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Pesquisar Categoria"
          ariaLabel="Pesquisar categoria"
        />
      </div>

      {deleteError && <ErrorState message={deleteError} />}

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <CategoryTable categories={filtered} onDelete={setPendingDelete} />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir categoria"
        description={
          pendingDelete ? (
            <p className="mb-0">
              Tem certeza que deseja excluir <strong>{pendingDelete.name}</strong>? Esta ação não
              pode ser desfeita.
            </p>
          ) : undefined
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        confirmingLabel="Excluindo..."
        variant="danger"
        isConfirming={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
