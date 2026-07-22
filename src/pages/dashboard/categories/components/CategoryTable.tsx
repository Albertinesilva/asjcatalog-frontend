import type { Category } from "@/types";
import { EmptyState } from "@/components";
import { useTranslation } from "react-i18next";
import CategoryTableRow from "./CategoryTableRow";

type Props = {
  categories: Category[];
  onDelete: (category: Category) => void;
};

export default function CategoryTable({ categories, onDelete }: Props) {
  const { t } = useTranslation("categories");
  if (categories.length === 0) {
    return (
      <EmptyState
        title={t("emptyFiltered.title")}
        description={t("emptyFiltered.description")}
      />
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
