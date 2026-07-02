import type { User } from "@/types";
import { EmptyState } from "@/components";
import UserTableRow from "./UserTableRow";

type Props = {
  users: User[];
  onDelete: (user: User) => void;
};

export default function UserTable({ users, onDelete }: Props) {
  if (users.length === 0) {
    return (
      <EmptyState
        title="Nenhum usuário encontrado"
        description="Tente ajustar os filtros ou adicionar um novo usuário."
      />
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {users.map((u) => (
        <UserTableRow key={u.id} user={u} onDelete={onDelete} />
      ))}
    </div>
  );
}