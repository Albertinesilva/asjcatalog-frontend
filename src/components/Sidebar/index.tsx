import { Link } from "@tanstack/react-router";
import { hasAnyRole } from "../../lib/auth";
import { useAuth } from "../../lib/use-auth";
import styles from "./sidebar.module.css";

export default function Sidebar() {
  useAuth(); // re-render on auth change so role-gated items appear
  const showUsers = hasAnyRole(["ROLE_ADMIN"]);
  const activeClass = `${styles.adminNavItem} active-sidebar-item`;

  return (
    <div className={styles.adminNavContainer}>
      <ul>
        <li>
          <Link
            to="/admin/products"
            className={styles.adminNavItem}
            activeProps={{ className: activeClass }}
          >
            Produtos
          </Link>
        </li>
        <li>
          <Link
            to="/admin/categories"
            className={styles.adminNavItem}
            activeProps={{ className: activeClass }}
          >
            Categorias
          </Link>
        </li>
        {showUsers && (
          <li>
            <Link
              to="/admin/users"
              className={styles.adminNavItem}
              activeProps={{ className: activeClass }}
            >
              Usuários
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}