import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "@/services/user-service";
import { LoadingState, ErrorState } from "@/components";
import { getApiErrorMessage } from "@/utils/api-errors";
import type { UserDetails } from "@/types";

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    userService
      .findById(Number(id))
      .then(setUser)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [id]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!user) return null;

  return (
    <div className="container py-4">
      <div className="card-base p-4 border-radius-10">
        <h3 className="mb-3">
          {user.firstName} {user.lastName}
        </h3>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Permissões:</strong>{" "}
          {(user.roles ?? []).map((r) => r.authority).join(", ") || "—"}
        </p>
        <div className="d-flex gap-2 mt-3">
          <Link to={`/dashboard/users/${user.id}/edit`} className="btn btn-primary">
            Editar
          </Link>
          <Link to="/dashboard/users" className="btn btn-outline-secondary">
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}
