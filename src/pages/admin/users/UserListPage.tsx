import { useCallback, useMemo, useState } from "react";
import { userService } from "@/services/user-service";
import { LoadingState, ErrorState } from "@/components";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { getApiErrorMessage } from "@/utils/api-errors";
import type { SpringPage, User } from "@/types";
import {
  UserToolbar,
  UserFilters,
  UserTable,
  UserPagination,
  UserDeleteDialog,
} from "./components";

type UserFiltersState = { firstName: string };

export default function UserListPage() {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim(), 400);
  const filters = useMemo<UserFiltersState>(() => ({ firstName: debounced }), [debounced]);

  const fetcher = useCallback(
    ({ page, size, filters }: { page: number; size: number; filters: UserFiltersState }): Promise<SpringPage<User>> =>
      userService.findAll({
        page,
        size,
        firstName: filters.firstName || undefined,
      }),
    [],
  );

  const { data, isLoading, error, pagination, refetch } = usePagedQuery<User, UserFiltersState>(
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
      <div className="d-flex flex-column flex-md-row gap-3 mb-4 align-items-stretch align-items-md-center">
        <UserToolbar />
        <UserFilters
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
        />
      </div>

      {deleteError && <p className="text-danger">{deleteError}</p>}

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          <UserTable users={data} onDelete={setPendingDelete} />
          <UserPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={pagination.goToPage}
          />
        </>
      )}

      <UserDeleteDialog
        user={pendingDelete}
        isDeleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
