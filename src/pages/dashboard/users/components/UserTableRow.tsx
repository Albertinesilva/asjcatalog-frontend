import type { User } from "@/types";
import UserRoleBadge from "./UserRoleBadge";
import UserActions from "./UserActions";

type Props = {
  user: User;
  onDelete: (user: User) => void;
};

export default function UserTableRow({ user, onDelete }: Props) {
  return (
    <div className="card-base border-radius-10 d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 gap-2">
      <div>
        <h5 className="m-0 fw-bold" style={{ color: "#263238" }}>
          {user.firstName} {user.lastName}
        </h5>
        <small className="text-muted">{user.email}</small>
        {user.roles?.length ? (
          <div className="mt-1 d-flex gap-1 flex-wrap">
            {user.roles.map((r) => (
              <UserRoleBadge key={r.id} role={r.authority} />
            ))}
          </div>
        ) : null}
      </div>
      <UserActions user={user} onDelete={onDelete} />
    </div>
  );
}