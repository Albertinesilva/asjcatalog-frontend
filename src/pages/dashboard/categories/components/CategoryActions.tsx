import { Link } from "react-router-dom";
import type { Category } from "@/types";
import { Authorization } from "@/components";
import { Button, buttonClasses } from "@/components/ui";

type Props = {
  category: Category;
  onDelete: (category: Category) => void;
};

export default function CategoryActions({ category, onDelete }: Props) {
  return (
    <div className="flex flex-wrap gap-sm">
      <Authorization roles={["ROLE_OPERATOR", "ROLE_ADMIN"]}>
        <Link to={`/dashboard/categories/${category.id}`} className={buttonClasses("secondary", "sm")}>
          Editar
        </Link>
      </Authorization>
      <Authorization roles={["ROLE_ADMIN"]}>
        <Button type="button" variant="danger" size="sm" onClick={() => onDelete(category)}>
          Excluir
        </Button>
      </Authorization>
    </div>
  );
}