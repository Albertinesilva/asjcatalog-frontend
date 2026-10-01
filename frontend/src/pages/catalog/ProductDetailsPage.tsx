import { Link, useParams } from "react-router-dom";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
  ProductPrice,
  ProductDetailsSkeleton,
  ErrorState,
  NotFoundState,
  ProductImage,
} from "@/components";
import { Card } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { productService } from "@/services/product-service";

export default function ProductDetailsPage() {
  const { t } = useTranslation(["catalog"]);
  const { productId } = useParams<{ productId: string }>();

  // Id não numérico nunca chega à API: é recurso inexistente.
  const id = Number(productId);
  const validId = Boolean(productId) && !Number.isNaN(id);
  const fetchProduct = useCallback(() => productService.findById(id), [id]);
  const { state, reload } = useResource(validId ? fetchProduct : null);

  if (state.status === "loading") {
    return <ProductDetailsSkeleton />;
  }

  if (state.status === "error") {
    return (
      <ErrorState
        title={t("catalog:loadErrorTitle")}
        description={state.message}
        onRetry={reload}
      />
    );
  }

  if (state.status !== "success") {
    return (
      <NotFoundState
        backTo="/catalog"
        backLabel={t("catalog:details.backCatalog")}
        title={t("catalog:details.notFoundTitle")}
        description={t("catalog:details.notFoundDescription")}
      />
    );
  }

  const { imgUrl, name, price, description } = state.data;

  return (
    <div className="w-full mx-auto max-w-page px-md py-lg lg:px-xl lg:py-xl">
      <Card padding="none" elevated bordered className="p-md lg:p-2xl animate-fade-in">
        <Link
          to="/catalog"
          className="inline-flex min-h-6 items-center gap-sm text-small font-heading font-semibold uppercase tracking-wider text-accent hover:text-primary transition-colors ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm mb-lg"
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
              <ProductImage
                src={imgUrl}
                alt={name}
                className="max-w-full max-h-[280px] w-auto h-auto object-contain"
                fallbackClassName="w-full h-[200px] lg:h-[280px]"
              />
            </div>
            <h1 className="font-heading text-h2 lg:text-h1 text-foreground mt-lg mb-0">{name}</h1>
            <ProductPrice price={String(price)} className="mt-md" />
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
