import { Link } from "react-router-dom";
import { ButtonIcon } from "@/components";
import homeImage from "@/assets/homeimage.svg";
import styles from "@/styles/pages/home.module.css";

export default function HomePage() {
  return (
    <div className={styles.homeContainer}>
      <div
        className={`row d-flex flex-column-reverse align-items-center justify-content-center flex-lg-row card-base border-radius-20 ${styles.homeContent}`}
      >
        <div
          className={`col-lg-6 d-flex flex-column align-items-center mt-4 mt-md-0 ${styles.homeText}`}
        >
          <h1 className={styles.textTitle}>ASJ Catalog</h1>
          <p className={styles.textSubtitle}>
            Plataforma profissional para gestão e organização de catálogos de produtos,
            com controle centralizado e administração simplificada.
          </p>
          <Link to="/catalog">
            <ButtonIcon label="Acessar catálogo" type="button" />
          </Link>
        </div>
        <div
          className={`col-lg-6 d-flex align-items-center justify-content-center align-items-lg-center justify-content-lg-start ${styles.homeImgContainer}`}
        >
          <img src={homeImage} alt="Ilustração do ASJ Catalog" />
        </div>
      </div>
    </div>
  );
}
