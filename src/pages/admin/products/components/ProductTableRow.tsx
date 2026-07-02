import type { ProductResponse } from "@/types";
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
    <div className="card-base border-radius-10 d-flex flex-column flex-md-row align-items-md-center gap-3 p-3">
      <img
        src={product.imgUrl}
        alt={product.name}
        style={{ width: 88, height: 88, objectFit: "contain", flexShrink: 0 }}
      />
      <div className="flex-grow-1 min-w-0">
        <h5 className="m-0 fw-bold" style={{ color: "#263238" }}>
          {product.name}
        </h5>
        <div className="mt-1">
          <ProductPrice value={product.price} />
        </div>
        {product.categories?.length ? (
          <div className="mt-2 d-flex gap-1 flex-wrap">
            {product.categories.map((c) => (
              <ProductCategoryBadge key={c.id} name={c.name} />
            ))}
          </div>
        ) : null}
        {product.description && (
          <p className="mt-2 mb-0 text-muted" style={{ fontSize: 14 }}>
            <strong>{firstSentence}</strong>
            {rest}
          </p>
        )}
      </div>
      <ProductActions product={product} onDelete={onDelete} />
    </div>
  );
}