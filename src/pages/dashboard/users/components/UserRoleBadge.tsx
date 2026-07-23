import type { Role } from "@/types";
import { useTranslation } from "react-i18next";
import { Badge, type BadgeVariant } from "@/components/ui";

const VARIANTS: Record<Role, BadgeVariant> = {
  ROLE_ADMIN: "primary",
  ROLE_OPERATOR: "default",
};

type Props = { role: Role };

export default function UserRoleBadge({ role }: Props) {
  const { t } = useTranslation(["users"]);
  return (
    <Badge variant={VARIANTS[role] ?? "default"}>
      {t(`users:roles.${role}`, { defaultValue: role })}
    </Badge>
  );
}
