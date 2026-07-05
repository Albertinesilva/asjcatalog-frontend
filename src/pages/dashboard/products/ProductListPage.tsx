import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import { getApiErrorMessage } from "@/utils/api-errors";
import { alerts } from "@/utils/alerts";
import type { Category, Paginated, ProductResponse } from "@/types";
import styles from "@/styles/action-buttons.module.css";
import { ProductTable } from "./components";
import type { ProductFilters } from "./types";

export default function ProductListPage() {
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
    categoryService.findAll().then(setCategories).catch(() => {});
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
      await alerts.success("Produto removido", "Produto removido com sucesso.");
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <TableToolbar
        counter={pagination.totalElements}
      >
        <Authorization roles={["ROLE_OPERATOR", "ROLE_ADMIN"]}>
          <Link to="/dashboard/products/new" className={`btn btn-primary ${styles.actionBtnLg}`}>
            ADICIONAR
          </Link>
        </Authorization>
      </TableToolbar>

      <div className="mb-4 d-flex flex-column flex-md-row gap-2">
        <div className="flex-grow-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
            placeholder="Pesquisar Produto"
            ariaLabel="Pesquisar produto"
          />
        </div>
        <select
          className="form-select"
          style={{ maxWidth: 260 }}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-label="Filtrar por categoria"
        >
          <option value="">Filtrar por Categoria</option>
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
        title="Excluir produto"
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