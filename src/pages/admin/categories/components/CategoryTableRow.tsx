import type { Category } from "@/types";
import CategoryActions from "./CategoryActions";

type Props = {
  category: Category;
  onDelete: (category: Category) => void;
};

export default function CategoryTableRow({ category, onDelete }: Props) {
  return (
    <div className="card-base border-radius-10 d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 gap-2">
      <h5 className="m-0 fw-bold" style={{ color: "#263238" }}>
        {category.name}
      </h5>
      <CategoryActions category={category} onDelete={onDelete} />
    </div>
  );
}