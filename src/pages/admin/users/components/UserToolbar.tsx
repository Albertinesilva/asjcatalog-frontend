import { Link } from "react-router-dom";
import styles from "@/styles/action-buttons.module.css";

export default function UserToolbar() {
  return (
    <Link to="/admin/users/new" className={`btn btn-primary ${styles.actionBtnLg}`}>
      ADICIONAR
    </Link>
  );
}