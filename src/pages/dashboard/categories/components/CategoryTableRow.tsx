import type { Category } from "@/types";
import { Card } from "@/components/ui";
import CategoryActions from "./CategoryActions";

type Props = {
  category: Category;
  onDelete: (category: Category) => void;
};

export default function CategoryTableRow({ category, onDelete }: Props) {
  return (
    <Card padding="md" className="flex flex-col md:flex-row md:items-center md:justify-between gap-sm transition-colors hover:border-primary/40">
      <h3 className="m-0 font-heading font-semibold text-subtitle text-foreground">
        {category.name}
      </h3>
      <CategoryActions category={category} onDelete={onDelete} />
    </Card>
  );
}