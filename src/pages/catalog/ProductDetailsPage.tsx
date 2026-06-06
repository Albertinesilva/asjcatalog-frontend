import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProductPrice } from "@/components";
import arrow from "@/assets/blue_arrow.svg";
import { productService } from "@/services/product-service";
import type { Product } from "@/types";
import styles from "@/styles/pages/product.module.css";

export default function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>();
  const [data, setData] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    productService
      .findById(productId)
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [productId]);

  if (error) return <p className="p-4 text-danger">Erro: {error}</p>;
  if (!data) return <p className="p-4">Carregando produto...</p>;

  const { imgUrl, name, price, description } = data;

  return (
    <div className={styles.productDetailsContainer}>
      <div className={`card-base border-radius-10 ${styles.productDetails}`}>
        <Link to="/catalog" className={styles.productDetailsGoback}>
          <img src={arrow} alt="Voltar" />
          <span className={styles.textGoBack}>VOLTAR</span>
        </Link>
        <div className={styles.detailsGrid}>
          <div className={styles.leftColumn}>
            <div className={styles.imgCard}>
              <img
                src={imgUrl}
                alt={name}
                className={styles.productDetailsImage}
              />
            </div>
            <h1 className={styles.productDetailsName}>{name}</h1>
            <ProductPrice price={String(price)} />
          </div>
          <div className={styles.descriptionCard}>
            <h2 className={styles.productDescriptionTitle}>
              Descrição do Produto
            </h2>
            <p className={styles.productDescriptionText}>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}