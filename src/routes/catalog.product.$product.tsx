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
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(productDetailQuery(params.product)),
  component: ProductDetails,
});

function ProductDetails() {
  const { product } = Route.useParams();
  const { data } = useSuspenseQuery(productDetailQuery(product));
  const { imgUrl, name, price, description } = data;

  return (
    <div className={styles.productDetailsContainer}>
      <div
        className={`d-flex flex-column card-base border-radius-20 ${styles.productDetails}`}
      >
        <Link to="/catalog" className={styles.productDetailsGoback}>
          <img src={arrow} alt="Voltar" />
          <h1 className={styles.textGoBack}>voltar</h1>
        </Link>
        <div className="row flex-column flex-lg-row align-items-center align-items-lg-start">
          <div className="col-xl-6">
            <div
              className={`text-center ${styles.productDetailsCard} ${styles.imgContainer}`}
            >
              <img
                src={imgUrl}
                alt={name}
                className={styles.productDetailsImage}
                width={350}
                height={350}
              />
            </div>
            <div className="d-md-flex justify-content-md-between flex-md-row flex-lg-column">
              <h1 className={styles.productDetailsName}>{name}</h1>
              <ProductPrice price={String(price)} />
            </div>
          </div>
          <div className={`col-xl-6 ${styles.productDetailsCard}`}>
            <h1 className={styles.productDescriptionTitle}>
              Descrição do Produto
            </h1>
            <p className={styles.productDescriptionText}>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}