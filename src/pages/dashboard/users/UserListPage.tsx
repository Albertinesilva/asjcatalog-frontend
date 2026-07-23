import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
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
import { getApiErrorMessage } from "@/utils/api-error";
import { alerts } from "@/utils/alerts";
import type { Paginated, User } from "@/types";
import { buttonClasses } from "@/components/ui";
import { UserTable } from "./components";
import type { UserFilters } from "./types";

export default function UserListPage() {
  const { t } = useTranslation(["users"]);
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim(), 400);
  const filters = useMemo<UserFilters>(() => ({ firstName: debounced }), [debounced]);

  const fetcher = useCallback(
    ({
      page,
      size,
      filters,
    }: {
      page: number;
      size: number;
      filters: UserFilters;
    }): Promise<Paginated<User>> =>
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
      await alerts.success(
        t("users:success.deletedTitle"),
        t("users:success.deletedMessage"),
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
        <Link to="/dashboard/users/new" className={buttonClasses("primary", "md")}>
          {t("users:actions.create")}
        </Link>
      </TableToolbar>

      <div className="mb-lg">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder={t("users:placeholders.search")}
          ariaLabel={t("users:filters.searchAria")}
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
        title={t("users:dialogs.delete.title")}
        description={
          pendingDelete ? (
            <p className="mb-0">
              <Trans
                i18nKey="users:dialogs.delete.message"
                values={{ name: `${pendingDelete.firstName} ${pendingDelete.lastName}` }}
                components={{ strong: <strong /> }}
              />
            </p>
          ) : undefined
        }
        confirmLabel={t("users:dialogs.delete.confirm")}
        cancelLabel={t("users:dialogs.delete.cancel")}
        confirmingLabel={t("users:dialogs.delete.confirming")}
        variant="danger"
        isConfirming={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
