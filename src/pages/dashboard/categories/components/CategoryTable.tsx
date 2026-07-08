import type { Category } from "@/types";
import { EmptyState } from "@/components";
import CategoryTableRow from "./CategoryTableRow";

type Props = {
  categories: Category[];
  onDelete: (category: Category) => void;
};

export default function CategoryTable({ categories, onDelete }: Props) {
  if (categories.length === 0) {
    return (
      <EmptyState
        title="Nenhuma categoria encontrada"
        description="Tente ajustar o filtro ou adicionar uma nova categoria."
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
