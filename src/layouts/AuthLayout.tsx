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
          <h1 className={styles.authInfoTitle}>Gerencie seu catálogo com o ASJ Catalog</h1>
          <p className={styles.authInfoSubtitle}>
            Acesse sua conta para administrar produtos, categorias e usuários em um
            ambiente centralizado e profissional.
          </p>
          <img
            src={imageBackground}
            alt="Ilustração da plataforma ASJ Catalog"
            className={styles.authInfoImage}
          />
        </div>
        <Outlet />
      </div>
    </>
  );
}
