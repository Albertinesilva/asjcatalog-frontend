import Link from "next/link";
import { returnActiveItem } from "../../utils";
import { isAllowedByRole } from "../../utils/auth";
import styles from "./sidebar.module.css";

export default function Sidebar() {
  return (
    <div className={styles.adminNavContainer}>
      <ul>
        <li>
          <Link
            href="/admin/dashboard/products"
            className={`${returnActiveItem("/admin/dashboard/products")} ${styles.adminNavItem}`}
          >
            Produtos
          </Link>
        </li>

        <li>
          <Link
            href="/admin/dashboard/categories"
            className={`${returnActiveItem("/admin/dashboard/categories")} ${styles.adminNavItem}`}
          >
            Categorias
          </Link>
        </li>

        {isAllowedByRole(["ROLE_ADMIN"]) && (
          <li>
            <Link
              href="/admin/dashboard/users"
              className={`${returnActiveItem("/admin/dashboard/users")} ${styles.adminNavItem}`}
            >
              Usuários
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}