import type { Role } from "@/types";
import { Badge, type BadgeVariant } from "@/components/ui";

const LABELS: Record<Role, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_OPERATOR: "Operador",
};

const VARIANTS: Record<Role, BadgeVariant> = {
  ROLE_ADMIN: "primary",
  ROLE_OPERATOR: "default",
};

type Props = { role: Role };

export default function UserRoleBadge({ role }: Props) {
  return <Badge variant={VARIANTS[role] ?? "default"}>{LABELS[role] ?? role}</Badge>;
}
