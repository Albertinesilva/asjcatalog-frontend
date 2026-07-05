import { Link } from "react-router-dom";
import styles from "@/styles/action-buttons.module.css";
import type { User } from "@/types";
import { Authorization } from "@/components";

type Props = {
  user: User;
  onDelete: (user: User) => void;
};

export default function UserActions({ user, onDelete }: Props) {
  return (
    <div className="d-flex gap-2 flex-wrap">
      <Link to={`/dashboard/users/${user.id}`} className={`btn btn-outline-primary ${styles.actionBtn}`}>
        VER
      </Link>
      <Link
        to={`/dashboard/users/${user.id}/edit`}
        className={`btn btn-outline-secondary ${styles.actionBtn} ${styles.actionBtnMuted}`}
      >
        EDITAR
      </Link>
      <Authorization roles={["ROLE_ADMIN"]}>
        <button
          type="button"
          className={`btn btn-outline-danger ${styles.actionBtn}`}
          onClick={() => onDelete(user)}
        >
          EXCLUIR
        </button>
      </Authorization>
    </div>
  );
}