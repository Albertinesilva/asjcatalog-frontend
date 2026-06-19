import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "@/services/user-service";
import type { UserDetails } from "@/types";

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    userService
      .findById(Number(id))
      .then(setUser)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error) return <p className="p-4 text-danger">Erro: {error}</p>;
  if (!user) return <p className="p-4">Carregando...</p>;

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
          <Link to={`/admin/users/${user.id}/edit`} className="btn btn-primary">
            Editar
          </Link>
          <Link to="/admin/users" className="btn btn-outline-secondary">
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}
