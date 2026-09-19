import { Link } from "react-router-dom";
import ProductPrice from "../ProductPrice";
import ProductImage from "../ProductImage";
import type { ProductItemProps } from "@/types";

/**
 * ProductItem — Fase 10.4.
 * Card de produto do catálogo público, migrado para Tailwind + tokens.
 */
export default function ProductItem(product: ProductItemProps) {
  const { imgUrl, name, price, id } = product;

  return (
    <Link
      to={`/catalog/${id}`}
      className={[
        "group flex flex-col bg-card text-card-foreground rounded-lg border border-border",
        "shadow-sm transition-all ease-standard",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      ].join(" ")}
    >
      <div className="flex items-center justify-center min-h-[170px] p-md border-b border-border">
        <ProductImage
          src={imgUrl}
          alt={name}
          width={197}
          height={158}
          className="w-full max-w-[160px] h-auto object-contain"
          fallbackClassName="w-full max-w-[160px] aspect-[197/158]"
          loading="lazy"
        />
      </div>
      <div className="p-md">
        <h2 className="font-heading text-body font-semibold text-foreground m-0 min-h-[3rem] line-clamp-2">
          {name}
        </h2>
        <ProductPrice price={String(price)} className="mt-md" />
      </div>
    </Link>
  );
}
