import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavbarLink from "../NavbarLink";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import styles from "./navbar.module.css";
import logo from "@/assets/asj-logo.png";

export default function Navbar() {
  const { authenticated, user, logout } = useAuth();
  const { isAdmin } = useRoles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while menu is open on mobile
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <nav className={`navbar navbar-dark bg-primary ${styles.mainNav}`}>
      <div className={`container-fluid ${styles.navContent}`}>
        <Link to="/" className={styles.navLogoText}>
          <span className={styles.brand}>
            <img src={logo} alt="ASJ Catalog" className={styles.brandLogo} width={32} height={32} />
            <span className={styles.brandText}>
              <strong>ASJ</strong> Catalog
            </span>
          </span>
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`${styles.bar} ${open ? styles.barTop : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barMid : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barBot : ""}`} />
        </button>

        <div className={`${styles.menuWrap} ${open ? styles.menuWrapOpen : ""}`}>
          <ul className={styles.mainMenu}>
            <li>
              <NavbarLink label="Início" target="/" />
            </li>
            <li>
              <NavbarLink label="Catálogo" target="/catalog" />
            </li>
            <li>
              {authenticated ? (
                <NavbarLink label="Dashboard" target="/dashboard" />
              ) : (
                <NavbarLink label="Entrar" target="/auth/login" />
              )}
            </li>
          </ul>

          {authenticated && (
            <div className={styles.userBlock}>
              <Link to="/account/profile" className={styles.userName}>
                <span className={styles.userGreeting}>
                  {user?.firstName ? `Olá, ${user.firstName}` : user?.email ?? ""}
                </span>
                <span className={styles.userRole}>
                  {isAdmin ? "Administrador" : "Operador"}
                </span>
              </Link>
              <button type="button" className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Sair
              </button>
            </div>
          )}
        </div>

        {!authenticated && <div className={styles.endSpacer} aria-hidden />}
      </div>

      {open && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
    </nav>
  );
}
