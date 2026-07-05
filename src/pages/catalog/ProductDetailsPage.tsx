import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";

import { ProductPrice, LoadingState, EmptyState } from "@/components";
import { productService } from "@/services/product-service";

import arrow from "@/assets/blue_arrow.svg";

import type { ProductResponse } from "@/types";

import styles from "@/styles/pages/product.module.css";

export default function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>();

  const [data, setData] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (!productId) {
          setNotFound(true);
          return;
        }

        const id = Number(productId);

        if (Number.isNaN(id)) {
          setNotFound(true);
          return;
        }

        const product = await productService.findById(id);

        setData(product);
      } catch (error: unknown) {
        const err = error as AxiosError;

        if (err.response?.status === 404) {
          setNotFound(true);
          return;
        }

        await Swal.fire({
          icon: "error",
          title: "Erro ao carregar produto",
          text: "Não foi possível carregar os detalhes do produto. Tente novamente mais tarde.",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <LoadingState message="Carregando produto..." />
    );
  }

  if (notFound || !data) {
    return (
      <EmptyState
        title="Produto não encontrado"
        description="O produto solicitado não existe ou não está mais disponível."
        action={
          <Link to="/catalog" className="btn btn-primary">
            Voltar ao catálogo
          </Link>
        }
      />
    );
  }

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
              <img src={imgUrl} alt={name} className={styles.productDetailsImage} />
            </div>

            <h1 className={styles.productDetailsName}>{name}</h1>

            <ProductPrice price={String(price)} />
          </div>

          <div className={styles.descriptionCard}>
            <h2 className={styles.productDescriptionTitle}>Descrição do Produto</h2>

            <p className={styles.productDescriptionText}>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
