import type { Role } from "@/types";

const LABELS: Record<Role, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_OPERATOR: "Operador",
};

const COLORS: Record<Role, string> = {
  ROLE_ADMIN: "bg-primary",
  ROLE_OPERATOR: "bg-secondary",
};

type Props = { role: Role };

export default function UserRoleBadge({ role }: Props) {
  return (
    <span className={`badge ${COLORS[role] ?? "bg-secondary"} text-white`}>
      {LABELS[role] ?? role}
    </span>
  );
}