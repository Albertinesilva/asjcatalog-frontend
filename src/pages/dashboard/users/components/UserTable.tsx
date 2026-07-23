import type { User } from "@/types";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components";
import UserTableRow from "./UserTableRow";

type Props = {
  users: User[];
  onDelete: (user: User) => void;
};

export default function UserTable({ users, onDelete }: Props) {
  const { t } = useTranslation(["users"]);
  if (users.length === 0) {
    return (
      <EmptyState
        title={t("users:table.empty.title")}
        description={t("users:table.empty.description")}
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
