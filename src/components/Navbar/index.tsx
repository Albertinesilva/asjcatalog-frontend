import { Link, useNavigate } from "@tanstack/react-router";
import NavbarLink from "../NavbarLink";
import { useAuth } from "../../lib/use-auth";
import { logout } from "../../lib/auth";
import styles from "./navbar.module.css";

export default function Navbar() {
  const { authenticated, token } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <nav
      className={`navbar navbar-dark bg-primary ${styles.mainNav}`}
    >
      <div className={`container-fluid ${styles.navContent}`}>
        <Link to="/" className={styles.navLogoText}>
          <h4 className="m-0">DS Catalog</h4>
        </Link>

        <div className={styles.menuWrap}>
          <ul className={styles.mainMenu}>
            <li>
              <NavbarLink label="HOME" target="/" />
            </li>
            <li>
              <NavbarLink label="CATÁLOGO" target="/catalog" />
            </li>
            <li>
              <NavbarLink label="ADMIN" target="/admin" />
            </li>
          </ul>
        </div>

        {authenticated ? (
          <div className="d-flex align-items-center gap-3 text-white">
            <span className="small">{token?.user_name}</span>
            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              SAIR
            </button>
          </div>
        ) : (
          <div style={{ width: 100 }} />
        )}
      </div>
    </nav>
  );
}
