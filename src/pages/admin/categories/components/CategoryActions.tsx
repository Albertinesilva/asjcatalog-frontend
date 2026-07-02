import { Link } from "react-router-dom";
import styles from "@/styles/action-buttons.module.css";
import type { Category } from "@/types";
import { Authorization } from "@/components";

type Props = {
  category: Category;
  onDelete: (category: Category) => void;
};

export default function CategoryActions({ category, onDelete }: Props) {
  return (
    <div className="d-flex gap-2 flex-wrap">
      <Authorization roles={["ROLE_OPERATOR", "ROLE_ADMIN"]}>
        <Link
          to={`/admin/categories/${category.id}`}
          className={`btn btn-outline-secondary ${styles.actionBtn} ${styles.actionBtnMuted}`}
        >
          EDITAR
        </Link>
      </Authorization>
      <Authorization roles={["ROLE_ADMIN"]}>
        <button
          type="button"
          className={`btn btn-outline-danger ${styles.actionBtn}`}
          onClick={() => onDelete(category)}
        >
          EXCLUIR
        </button>
      </Authorization>
    </div>
  );
}