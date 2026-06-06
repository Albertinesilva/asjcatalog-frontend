import arrow from "@/assets/arrow.svg";
import type { ButtonIconProps } from "@/types";
import styles from "./buttonicon.module.css";

export default function ButtonIcon({ label, type }: ButtonIconProps) {
  return (
    <div className={`d-flex ${styles.btnContainer}`}>
      <button className={`btn btn-primary ${styles.btnIcon}`} type={type}>
        <h5>{label}</h5>
      </button>
      <div className={styles.btnIconContent}>
        <img src={arrow} alt="Arrow" />
      </div>
    </div>
  );
}
