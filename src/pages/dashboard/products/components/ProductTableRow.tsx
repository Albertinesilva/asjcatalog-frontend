import type { ProductResponse } from "@/types";
import { Card } from "@/components/ui";
import ProductCategoryBadge from "./ProductCategoryBadge";
import ProductPrice from "./ProductPrice";
import ProductActions from "./ProductActions";

type Props = {
  product: ProductResponse;
  onDelete: (product: ProductResponse) => void;
};

export default function ProductTableRow({ product, onDelete }: Props) {
  const firstSentence = product.description?.split(/(?<=\.)\s+/)[0] ?? "";
  const rest = product.description?.slice(firstSentence.length) ?? "";

  return (
    <Card padding="md" className="flex flex-col md:flex-row md:items-center gap-md transition-colors hover:border-primary/40">
      <div className="flex items-center justify-center h-24 w-24 shrink-0 rounded-md bg-surface-hover overflow-hidden">
        <img src={product.imgUrl} alt={product.name} className="h-full w-full object-contain" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="m-0 font-heading font-semibold text-subtitle text-foreground truncate">
          {product.name}
        </h3>
        <div className="mt-xs">
          <ProductPrice value={product.price} />
        </div>
        {product.categories?.length ? (
          <div className="mt-sm flex flex-wrap gap-xs">
            {product.categories.map((c) => (
              <ProductCategoryBadge key={c.id} name={c.name} />
            ))}
          </div>
        ) : null}
        {product.description && (
          <p className="mt-sm mb-0 text-small text-foreground-muted line-clamp-2">
            <strong className="text-foreground font-semibold">{firstSentence}</strong>
            {rest}
          </p>
        )}
      </div>
      <ProductActions product={product} onDelete={onDelete} />
    </Card>
  );
}