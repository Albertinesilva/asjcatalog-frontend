import type { Category } from "@/types";
import { EmptyState } from "@/components";
import { Button } from "@/components/ui";
import { useTranslation } from "react-i18next";
import CategoryTableRow from "./CategoryTableRow";

type Props = {
  categories: Category[];
  /** Há filtro ativo: distingue "nenhum resultado" de "nada cadastrado". */
  filtered: boolean;
  onClearFilters: () => void;
  onDelete: (category: Category) => void;
};

export default function CategoryTable({ categories, filtered, onClearFilters, onDelete }: Props) {
  const { t } = useTranslation(["categories", "common"]);
  if (categories.length === 0) {
    return filtered ? (
      <EmptyState
        title={t("categories:emptyFiltered.title")}
        description={t("categories:emptyFiltered.description")}
        action={
          <Button variant="outline" onClick={onClearFilters}>
            {t("common:actions.clearFilters")}
          </Button>
        }
      />
    ) : (
      <EmptyState title={t("categories:empty")} />
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      {categories.map((c) => (
        <CategoryTableRow key={c.id} category={c} onDelete={onDelete} />
      ))}
    </div>
  );
}
