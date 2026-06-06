import { NavLink } from "react-router-dom";
import { useRoles } from "@/hooks/useRoles";
import styles from "./sidebar.module.css";

export default function Sidebar() {
  const { isAdmin } = useRoles();
  const showUsers = isAdmin;
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