import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Category } from "@/types";
import { Authorization } from "@/components";
import { Button, buttonClasses } from "@/components/ui";

type Props = {
  category: Category;
  onDelete: (category: Category) => void;
};

export default function CategoryActions({ category, onDelete }: Props) {
  const { t } = useTranslation("categories");
  return (
    <div className="flex flex-wrap gap-sm">
      <Authorization roles={["ROLE_OPERATOR", "ROLE_ADMIN"]}>
        <Link
          to={`/dashboard/categories/${category.id}`}
          className={buttonClasses("secondary", "sm")}
        >
          {t("actions.edit")}
        </Link>
      </Authorization>
      <Authorization roles={["ROLE_ADMIN"]}>
        <Button type="button" variant="danger" size="sm" onClick={() => onDelete(category)}>
          {t("actions.delete")}
        </Button>
      </Authorization>
    </div>
  );
}
