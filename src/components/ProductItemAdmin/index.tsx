import { Link } from "@tanstack/react-router";
import styles from "./productitemadmin.module.css";

import ProductPrice from "../ProductPrice";
import type { Category, ProductItemProps } from "../../lib/types";

type Props = ProductItemProps & {
  onDelete?: (id: number) => void;
};

export default function ProductItemAdmin(product: Props) {
  const { imgUrl, name, price, id, categories, onDelete } = product;

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

          <div className="d-flex flex-wrap gap-2 mt-2">
            {categories?.map((category: Category) => (
              <span
                key={category.id}
                className="badge rounded-pill bg-secondary text-dark"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
        <div className="col-12 col-md-4 pt-3 d-flex flex-row-reverse flex-md-column justify-content-between align-items-md-end gap-2">
          <Link
            to="/admin/products/$id"
            params={{ id: String(id) }}
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