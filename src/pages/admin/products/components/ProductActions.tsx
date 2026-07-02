import { Link } from "react-router-dom";
import styles from "@/styles/action-buttons.module.css";
import type { ProductResponse } from "@/types";
import { Authorization } from "@/components";

type Props = {
  product: ProductResponse;
  onDelete: (product: ProductResponse) => void;
};

export default function ProductActions({ product, onDelete }: Props) {
  return (
    <div className="d-flex gap-2 flex-wrap">
      <Link
        to={`/catalog/${product.id}`}
        className={`btn btn-outline-primary ${styles.actionBtn}`}
      >
        VER
      </Link>
      <Authorization roles={["ROLE_OPERATOR", "ROLE_ADMIN"]}>
        <Link
          to={`/admin/products/${product.id}`}
          className={`btn btn-outline-secondary ${styles.actionBtn} ${styles.actionBtnMuted}`}
        >
          EDITAR
        </Link>
      </Authorization>
      <Authorization roles={["ROLE_ADMIN"]}>
        <button
          type="button"
          className={`btn btn-outline-danger ${styles.actionBtn}`}
          onClick={() => onDelete(product)}
        >
          EXCLUIR
        </button>
      </Authorization>
    </div>
  );
}