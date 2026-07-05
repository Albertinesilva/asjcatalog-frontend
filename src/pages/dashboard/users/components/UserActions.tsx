import { Link } from "react-router-dom";
import type { User } from "@/types";
import { Authorization } from "@/components";
import { Button, buttonClasses } from "@/components/ui";

type Props = {
  user: User;
  onDelete: (user: User) => void;
};

export default function UserActions({ user, onDelete }: Props) {
  return (
    <div className="flex flex-wrap gap-sm">
      <Link to={`/dashboard/users/${user.id}`} className={buttonClasses("outline", "sm")}>
        Ver
      </Link>
      <Link to={`/dashboard/users/${user.id}/edit`} className={buttonClasses("secondary", "sm")}>
        Editar
      </Link>
      <Authorization roles={["ROLE_ADMIN"]}>
        <Button type="button" variant="danger" size="sm" onClick={() => onDelete(user)}>
          Excluir
        </Button>
      </Authorization>
    </div>
  );
}