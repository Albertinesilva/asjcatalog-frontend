import type { ProductResponse } from "@/types";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components";
import { Button } from "@/components/ui";
import ProductTableRow from "./ProductTableRow";

type Props = {
  products: ProductResponse[];
  /** Há filtros ativos: distingue "nenhum resultado" de "nada cadastrado". */
  filtered: boolean;
  onClearFilters: () => void;
  onDelete: (product: ProductResponse) => void;
};

export default function ProductTable({ products, filtered, onClearFilters, onDelete }: Props) {
  const { t } = useTranslation(["products"]);
  if (products.length === 0) {
    return filtered ? (
      <EmptyState
        title={t("products:table.emptyFiltered.title")}
        description={t("products:table.emptyFiltered.description")}
        action={
          <Button variant="outline" onClick={onClearFilters}>
            {t("common:actions.clearFilters")}
          </Button>
        }
      />
    ) : (
      <EmptyState
        title={t("products:table.emptyAll.title")}
        description={t("products:table.emptyAll.description")}
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
