import type { User } from "@/types";
import { Card } from "@/components/ui";
import UserRoleBadge from "./UserRoleBadge";
import UserActions from "./UserActions";

type Props = {
  user: User;
  onDelete: (user: User) => void;
};

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

export default function UserTableRow({ user, onDelete }: Props) {
  return (
    <Card
      padding="md"
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-md transition-colors hover:border-primary/40"
    >
      <div className="flex items-center gap-md min-w-0">
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-heading font-semibold text-small"
        >
          {initials(user.firstName, user.lastName)}
        </span>
        <div className="min-w-0">
          <h2 className="m-0 font-heading font-semibold text-subtitle text-foreground truncate">
            {user.firstName} {user.lastName}
          </h2>
          <p className="m-0 text-small text-foreground-muted truncate">{user.email}</p>
          {user.roles?.length ? (
            <div className="mt-xs flex flex-wrap gap-xs">
              {user.roles.map((r) => (
                <UserRoleBadge key={r.id} role={r.authority} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <UserActions user={user} onDelete={onDelete} />
    </Card>
  );
}
