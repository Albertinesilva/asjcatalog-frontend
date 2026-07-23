import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { User } from "@/types";
import { Authorization } from "@/components";
import { Button, buttonClasses } from "@/components/ui";

type Props = {
  user: User;
  onDelete: (user: User) => void;
};

export default function UserActions({ user, onDelete }: Props) {
  const { t } = useTranslation(["users"]);
  return (
    <div className="flex flex-wrap gap-sm">
      <Link to={`/dashboard/users/${user.id}`} className={buttonClasses("outline", "sm")}>
        {t("users:actions.view")}
      </Link>
      <Link to={`/dashboard/users/${user.id}/edit`} className={buttonClasses("secondary", "sm")}>
        {t("users:actions.edit")}
      </Link>
      <Authorization roles={["ROLE_ADMIN"]}>
        <Button type="button" variant="danger" size="sm" onClick={() => onDelete(user)}>
          {t("users:actions.delete")}
        </Button>
      </Authorization>
    </div>
  );
}
