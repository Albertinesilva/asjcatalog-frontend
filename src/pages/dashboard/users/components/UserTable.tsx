import type { User } from "@/types";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components";
import { Button } from "@/components/ui";
import UserTableRow from "./UserTableRow";

type Props = {
  users: User[];
  /** Há filtros ativos: distingue "nenhum resultado" de "nada cadastrado". */
  filtered: boolean;
  onClearFilters: () => void;
  onDelete: (user: User) => void;
};

export default function UserTable({ users, filtered, onClearFilters, onDelete }: Props) {
  const { t } = useTranslation(["users"]);
  if (users.length === 0) {
    return filtered ? (
      <EmptyState
        title={t("users:table.emptyFiltered.title")}
        description={t("users:table.emptyFiltered.description")}
        action={
          <Button variant="outline" onClick={onClearFilters}>
            {t("common:actions.clearFilters")}
          </Button>
        }
      />
    ) : (
      <EmptyState
        title={t("users:table.emptyAll.title")}
        description={t("users:table.emptyAll.description")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      {users.map((u) => (
        <UserTableRow key={u.id} user={u} onDelete={onDelete} />
      ))}
    </div>
  );
}
