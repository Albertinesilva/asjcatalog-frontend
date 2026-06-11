import { Outlet } from "react-router-dom";
import { Navbar } from "@/components";
import imageBackground from "@/assets/auth_image.png";
import styles from "@/styles/pages/auth.module.css";

export default function AuthLayout() {
  return (
    <>
      <Navbar />
    <div className={styles.authContainer}>
      <div className={styles.authInfo}>
        <h1 className={styles.authInfoTitle}>
          Divulgue seus produtos no DS Catalog
        </h1>
        <p className={styles.authInfoSubtitle}>
          Faça parte do nosso catálogo de divulgação e aumente a venda dos seus
          produtos.
        </p>
        <img
          src={imageBackground}
          alt="Pessoas divulgando produtos"
          className={styles.authInfoImage}
        />
      </div>
      <Outlet />
    </div>
    </>
  );
}