import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavbarLink from "../NavbarLink";
import { useAuth } from "@/utils/use-auth";
import { logout } from "@/utils/auth";
import styles from "./navbar.module.css";

export default function Navbar() {
  const { authenticated, token } = useAuth();
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
          <h4 className="m-0">DS Catalog</h4>
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

        <div
          className={`${styles.menuWrap} ${open ? styles.menuWrapOpen : ""}`}
        >
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

          {authenticated && (
            <div className={styles.userBlock}>
              <span className={styles.userName}>{token?.user_name}</span>
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
