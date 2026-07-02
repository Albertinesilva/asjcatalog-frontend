import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { userService } from "@/services/user-service";
import {
  LoadingState,
  ErrorState,
  Pagination,
  ConfirmDialog,
  TableToolbar,
  SearchInput,
} from "@/components";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { getApiErrorMessage } from "@/utils/api-errors";
import type { Paginated, User } from "@/types";
import styles from "@/styles/action-buttons.module.css";
import { UserTable } from "./components";
import type { UserFilters } from "./types";

export default function UserListPage() {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim(), 400);
  const filters = useMemo<UserFilters>(() => ({ firstName: debounced }), [debounced]);

  const fetcher = useCallback(
    ({ page, size, filters }: { page: number; size: number; filters: UserFilters }): Promise<Paginated<User>> =>
      userService.findAll({
        page,
        size,
        firstName: filters.firstName || undefined,
      }),
    [],
  );

  const { data, isLoading, error, pagination, refetch } = usePagedQuery<User, UserFilters>(
    fetcher,
    { initialSize: 12, filters },
  );

  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await userService.delete(pendingDelete.id);
      setPendingDelete(null);
      refetch();
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <TableToolbar
        title="Usuários"
        subtitle="Gerencie os usuários do sistema"
        counter={pagination.totalElements}
      >
        <Link to="/admin/users/new" className={`btn btn-primary ${styles.actionBtnLg}`}>
          ADICIONAR
        </Link>
      </TableToolbar>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Pesquisar por nome"
          ariaLabel="Pesquisar por nome"
        />
      </div>

      {deleteError && <ErrorState message={deleteError} />}

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          <UserTable users={data} onDelete={setPendingDelete} />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={pagination.goToPage}
          />
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir usuário"
        description={
          pendingDelete ? (
            <p className="mb-0">
              Tem certeza que deseja excluir{" "}
              <strong>
                {pendingDelete.firstName} {pendingDelete.lastName}
              </strong>
              ? Esta ação não pode ser desfeita.
            </p>
          ) : undefined
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        isDeleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
