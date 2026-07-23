import type { ProductResponse } from "@/types";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components";
import ProductTableRow from "./ProductTableRow";

type Props = {
  products: ProductResponse[];
  onDelete: (product: ProductResponse) => void;
};

export default function ProductTable({ products, onDelete }: Props) {
  const { t } = useTranslation(["products"]);
  if (products.length === 0) {
    return (
      <EmptyState
        title={t("products:table.empty.title")}
        description={t("products:table.empty.description")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      {products.map((p) => (
        <ProductTableRow key={p.id} product={p} onDelete={onDelete} />
      ))}
    </div>
  );
}
