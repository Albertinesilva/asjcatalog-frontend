import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { userService } from "@/services/user-service";
import type { User } from "@/types";

export default function UserListPage() {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const load = useCallback(() => {
    setIsLoading(true);
    userService
      .findAll({ size: 50, firstName: filter || undefined })
      .then((page) => setData(page.content))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter(search.trim());
  };

  const handleClear = () => {
    setSearch("");
    setFilter("");
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Excluir usuário?")) return;
    userService
      .delete(id)
      .then(load)
      .catch((err: Error) => setError(err.message));
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex flex-column flex-md-row gap-3 mb-4 align-items-stretch align-items-md-center">
        <Link
          to="/admin/users/new"
          className="btn btn-primary fw-bold d-flex align-items-center justify-content-center"
          style={{ minWidth: 180, height: 50, borderRadius: 10 }}
        >
          ADICIONAR
        </Link>
        <form
          onSubmit={handleSearch}
          className="card-base border-radius-10 d-flex flex-column flex-md-row gap-2 flex-grow-1 p-2"
        >
          <input
            className="form-control border-0 flex-grow-1"
            style={{ height: 46 }}
            placeholder="Pesquisar Nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: 46, borderRadius: 10, minWidth: 120 }}
          >
            BUSCAR
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            style={{ height: 46, borderRadius: 10, minWidth: 150 }}
            onClick={handleClear}
          >
            LIMPAR FILTRO
          </button>
        </form>
      </div>

      {isLoading && <p>Carregando...</p>}
      {error && <p className="text-danger">Erro: {error}</p>}

      <div className="d-flex flex-column gap-3">
        {data.map((u) => (
          <div
            key={u.id}
            className="card-base border-radius-10 d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 gap-2"
          >
            <div>
              <h5 className="m-0 fw-bold" style={{ color: "#263238" }}>
                {u.firstName} {u.lastName}
              </h5>
              <small className="text-muted">{u.email}</small>
              {u.roles?.length ? (
                <div className="mt-1 d-flex gap-1 flex-wrap">
                  {u.roles.map((r) => (
                    <span key={r.id} className="badge bg-secondary text-dark">
                      {r.authority}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Link
                to={`/admin/users/${u.id}`}
                className="btn btn-outline-primary fw-bold"
                style={{ minWidth: 100, borderRadius: 10 }}
              >
                VER
              </Link>
              <Link
                to={`/admin/users/${u.id}/edit`}
                className="btn btn-outline-secondary fw-bold"
                style={{ minWidth: 100, borderRadius: 10, color: "#9e9e9e" }}
              >
                EDITAR
              </Link>
              <button
                className="btn btn-outline-danger fw-bold"
                style={{ minWidth: 100, borderRadius: 10 }}
                onClick={() => handleDelete(u.id)}
              >
                EXCLUIR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
