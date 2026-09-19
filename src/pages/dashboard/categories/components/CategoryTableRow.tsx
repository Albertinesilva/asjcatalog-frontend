import type { Category } from "@/types";
import { Card } from "@/components/ui";
import CategoryActions from "./CategoryActions";

type Props = {
  category: Category;
  onDelete: (category: Category) => void;
};

export default function CategoryTableRow({ category, onDelete }: Props) {
  return (
    <Card
      padding="md"
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-sm transition-colors hover:border-primary/40"
    >
      <h2 className="m-0 min-w-0 break-words font-heading font-semibold text-subtitle text-foreground">
        {category.name}
      </h2>
      <CategoryActions category={category} onDelete={onDelete} />
    </Card>
  );
}
