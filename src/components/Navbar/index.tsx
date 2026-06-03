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
      className={`navbar navbar-expand-md navbar-dark bg-primary ${styles.mainNav}`}
    >
      <div className="container-fluid">
        <Link to="/" className={styles.navLogoText}>
          <h4>DS Catalog</h4>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#dscatalog-navbar"
          aria-controls="dscatalog-navbar"
          aria-expanded="false"
          aria-label="Menu mobile"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="dscatalog-navbar">
          <ul className={`navbar-nav offset-md-2 ${styles.mainMenu}`}>
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

          {authenticated && (
            <div className="ms-auto d-flex align-items-center gap-3 text-white">
              <span className="small">
                {token?.user_name}
              </span>
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                SAIR
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
