import { NavLink } from "react-router-dom";
import { useRoles } from "@/hooks/useRoles";
import styles from "./sidebar.module.css";

export default function Sidebar() {
  const { isAdmin } = useRoles();
  const showUsers = isAdmin;
  const activeClass = `${styles.adminNavItem} active-sidebar-item`;

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? activeClass : styles.adminNavItem;

  return (
    <div className={styles.adminNavContainer}>
      <ul>
        <li>
          <NavLink to="/dashboard" end className={itemClass}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/products" className={itemClass}>
            Produtos
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/categories" className={itemClass}>
            Categorias
          </NavLink>
        </li>
        {showUsers && (
          <li>
            <NavLink to="/dashboard/users" className={itemClass}>
              Usuários
            </NavLink>
          </li>
        )}
        <li>
          <NavLink to="/account/profile" className={itemClass}>
            Meu Perfil
          </NavLink>
        </li>
        <li>
          <NavLink to="/catalog" className={itemClass}>
            Catálogo Público
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
