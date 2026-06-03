import type { ProductPriceProps } from "../../lib/types";
import styles from "./productprice.module.css";

export default function ProductPrice({ price }: ProductPriceProps) {
  return (
    <div className={styles.productPriceContainer}>
      <span>R$</span>
      <h3>{price}</h3>
    </div>
  );
}
