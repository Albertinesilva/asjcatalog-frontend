import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ProductPrice } from "../components";
import arrow from "../assets/blue_arrow.svg";
import { api } from "../lib/api";
import type { ProductItemProps } from "../lib/types";
import styles from "../styles/pages/product.module.css";

const productDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get<ProductItemProps>(`/products/${id}`);
      return res.data;
    },
  });

export const Route = createFileRoute("/catalog/product/$product")({
  ssr: false,
  component: ProductDetails,
});

function ProductDetails() {
  const { product } = Route.useParams();
  const { data } = useSuspenseQuery(productDetailQuery(product));
  const { imgUrl, name, price, description } = data;

  return (
    <div className={styles.productDetailsContainer}>
      <div
        className={`card-base border-radius-10 ${styles.productDetails}`}
      >
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
              Decrição do Produto
            </h2>
            <p className={styles.productDescriptionText}>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}