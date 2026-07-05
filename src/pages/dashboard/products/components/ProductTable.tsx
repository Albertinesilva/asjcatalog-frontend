import type { ProductResponse } from "@/types";
import { EmptyState } from "@/components";
import ProductTableRow from "./ProductTableRow";

type Props = {
  products: ProductResponse[];
  onDelete: (product: ProductResponse) => void;
};

export default function ProductTable({ products, onDelete }: Props) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Nenhum produto encontrado"
        description="Tente ajustar os filtros ou adicionar um novo produto."
      />
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {products.map((p) => (
        <ProductTableRow key={p.id} product={p} onDelete={onDelete} />
      ))}
    </div>
  );
}