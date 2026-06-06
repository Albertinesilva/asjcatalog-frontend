import { NavLink } from "react-router-dom";
import { hasAnyRole } from "@/utils/auth";
import { useAuth } from "@/utils/use-auth";
import styles from "./sidebar.module.css";

export default function Sidebar() {
  useAuth(); // re-render on auth change so role-gated items appear
  const showUsers = hasAnyRole(["ROLE_ADMIN"]);
  const activeClass = `${styles.adminNavItem} active-sidebar-item`;

  return (
    <div className={styles.adminNavContainer}>
      <ul>
        <li>
          <NavLink
            to="/admin/products"
            className={({ isActive }: { isActive: boolean }) =>
              isActive ? activeClass : styles.adminNavItem
            }
          >
            Produtos
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/categories"
            className={({ isActive }: { isActive: boolean }) =>
              isActive ? activeClass : styles.adminNavItem
            }
          >
            Categorias
          </NavLink>
        </li>
        {showUsers && (
          <li>
            <NavLink
              to="/admin/users"
              className={({ isActive }: { isActive: boolean }) =>
                isActive ? activeClass : styles.adminNavItem
              }
            >
              Usuários
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
}