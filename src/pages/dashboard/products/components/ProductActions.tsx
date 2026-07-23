import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ProductResponse } from "@/types";
import { Authorization } from "@/components";
import { Button, buttonClasses } from "@/components/ui";

type Props = {
  product: ProductResponse;
  onDelete: (product: ProductResponse) => void;
};

export default function ProductActions({ product, onDelete }: Props) {
  const { t } = useTranslation(["products"]);
  return (
    <div className="flex flex-wrap gap-sm">
      <Link to={`/catalog/${product.id}`} className={buttonClasses("outline", "sm")}>
        {t("products:actions.view")}
      </Link>
      <Authorization roles={["ROLE_OPERATOR", "ROLE_ADMIN"]}>
        <Link to={`/dashboard/products/${product.id}`} className={buttonClasses("secondary", "sm")}>
          {t("products:actions.edit")}
        </Link>
      </Authorization>
      <Authorization roles={["ROLE_ADMIN"]}>
        <Button type="button" variant="danger" size="sm" onClick={() => onDelete(product)}>
          {t("products:actions.delete")}
        </Button>
      </Authorization>
    </div>
  );
}
