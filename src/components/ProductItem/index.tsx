import { Link } from "react-router-dom";
import styles from "./productitem.module.css";
import ProductPrice from "../ProductPrice";
import type { ProductItemProps } from "../../lib/types";

export default function ProductItem(product: ProductItemProps) {
  const { imgUrl, name, price, id } = product;

  return (
    <Link
      to={`/catalog/product/${id}`}
      className={`card-base border-radius-10 ${styles.productCard}`}
    >
      <div className={styles.cardTopContainer}>
        <img
          src={imgUrl}
          alt={name}
          className={styles.productCardImage}
          width={197}
          height={158}
        />
      </div>

      <div className={styles.cardBottomContainer}>
        <h6>{name}</h6>
        <ProductPrice price={String(price)} />
      </div>
    </Link>
  );
}