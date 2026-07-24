import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";

import { ProductPrice, LoadingState, EmptyState } from "@/components";
import { Button, Card } from "@/components/ui";
import { productService } from "@/services/product-service";
import { alerts } from "@/utils/alerts";

import type { ProductResponse } from "@/types";

export default function ProductDetailsPage() {
  const { t } = useTranslation(["catalog"]);
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

        await alerts.error(t("catalog:loadErrorTitle"), t("catalog:loadErrorMessage"));
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [productId, t]);

  if (loading) {
    return <LoadingState message={t("catalog:details.loading")} />;
  }

  if (notFound || !data) {
    return (
      <EmptyState
        title={t("catalog:details.notFoundTitle")}
        description={t("catalog:details.notFoundDescription")}
        action={
          <Link to="/catalog">
            <Button variant="primary">{t("catalog:details.backCatalog")}</Button>
          </Link>
        }
      />
    );
  }

  const { imgUrl, name, price, description } = data;

  return (
    <div className="w-full mx-auto max-w-[1200px] px-md py-lg lg:px-xl lg:py-xl">
      <Card padding="none" elevated bordered className="p-md lg:p-2xl">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-sm text-small font-heading font-semibold uppercase tracking-wider text-accent hover:text-primary transition-colors duration-DEFAULT ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm mb-lg"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          {t("catalog:details.back")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-start">
          <div className="flex flex-col">
            <div className="flex items-center justify-center min-h-[220px] lg:min-h-[320px] rounded-lg border border-border p-md lg:p-lg bg-surface">
              <img
                src={imgUrl}
                alt={name}
                className="max-w-full max-h-[280px] w-auto h-auto object-contain"
              />
            </div>
            <h1 className="font-heading text-h2 lg:text-h1 text-foreground mt-lg mb-0">{name}</h1>
            <ProductPrice price={String(price)} />
          </div>

          <div className="rounded-lg border border-border p-md lg:p-lg min-h-[220px]">
            <h2 className="font-heading text-title text-foreground-muted m-0">
              {t("catalog:details.description")}
            </h2>
            <p className="mt-md text-body text-foreground m-0 leading-relaxed">{description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
