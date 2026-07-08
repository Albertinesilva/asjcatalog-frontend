import { Link } from "react-router-dom";
import type { ProductResponse } from "@/types";
import { Authorization } from "@/components";
import { Button, buttonClasses } from "@/components/ui";

type Props = {
  product: ProductResponse;
  onDelete: (product: ProductResponse) => void;
};

export default function ProductActions({ product, onDelete }: Props) {
  return (
    <div className="flex flex-wrap gap-sm">
      <Link to={`/catalog/${product.id}`} className={buttonClasses("outline", "sm")}>
        Ver
      </Link>
      <Authorization roles={["ROLE_OPERATOR", "ROLE_ADMIN"]}>
        <Link to={`/dashboard/products/${product.id}`} className={buttonClasses("secondary", "sm")}>
          Editar
        </Link>
      </Authorization>
      <Authorization roles={["ROLE_ADMIN"]}>
        <Button type="button" variant="danger" size="sm" onClick={() => onDelete(product)}>
          Excluir
        </Button>
      </Authorization>
    </div>
  );
}
