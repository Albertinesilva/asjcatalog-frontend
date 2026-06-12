import { Link } from "react-router-dom";
import styles from "./productitemadmin.module.css";

import ProductPrice from "../ProductPrice";
import type { ProductItemProps } from "@/types";

type Props = ProductItemProps & {
  description?: string;
  onDelete?: (id: number) => void;
};

export default function ProductItemAdmin(product: Props) {
  const { imgUrl, name, price, id, description, onDelete } = product;

  const desc = (description ?? "").trim();
  const splitIdx = desc.search(/[.\n]/);
  const firstLine = splitIdx > 0 ? desc.slice(0, splitIdx) : desc;
  const rest = splitIdx > 0 ? desc.slice(splitIdx + 1).trim() : "";

  return (
    <div className={`card-base ${styles.productCardAdmin} container-fluid`}>
      <div className="d-flex flex-column flex-md-row align-items-center p-4">
        <div className="col-lg-2 text-center border-lg-end p-3">
          <img
            src={imgUrl}
            alt="Produto"
            className={styles.productCardImageAdmin}
            width={100}
            height={100}
          />
        </div>
        <div className="col-md-6 col-12 p-md-3 ">
          <h3 className={styles.productCardNameAdmin}>{name}</h3>
          <ProductPrice price={String(price)} />

          {desc && (
            <div className={styles.productDescription}>
              <p className={styles.descTitle}>{firstLine}</p>
              {rest && <p className={styles.descText}>{rest}</p>}
            </div>
          )}
        </div>
        <div className="col-12 col-md-4 pt-3 d-flex flex-row-reverse flex-md-column justify-content-between align-items-md-end gap-2">
          <Link
            to={`/admin/products/${id}`}
            className="btn btn-outline-secondary btn-block border-radius-10 col-6"
          >
            EDITAR
          </Link>
          <button
            type="button"
            className="btn btn-outline-danger btn-block border-radius-10 col-6 "
            onClick={() => onDelete?.(id)}
          >
            EXCLUIR
          </button>
        </div>
      </div>
    </div>
  );
}