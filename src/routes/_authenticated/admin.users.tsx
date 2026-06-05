import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { User } from "../../lib/types";

export default function UsersAdminPage() {
  const [data, setData] = useState<User[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<User[] | { content: User[] }>("/users", {
        params: { page: 0, size: 50, sort: "firstName,asc" },
      })
      .then((res) => {
        const d = res.data;
        setData(Array.isArray(d) ? d : d.content);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <UsersView
      data={data}
      isLoading={isLoading}
      isError={!!error}
      error={error}
    />
  );
}

function UsersView({
  data,
  isLoading,
  isError,
  error,
}: {
  data: User[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}) {
  const [search, setSearch] = useState("");
  const filtered = (data ?? []).filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex flex-column flex-md-row gap-3 mb-4 align-items-stretch align-items-md-center">
        <div
          className="btn btn-primary fw-bold d-flex align-items-center justify-content-center"
          style={{ minWidth: 180, height: 50, borderRadius: 10, opacity: 0.6, cursor: "not-allowed" }}
          title="Cadastro de usuário disponível em breve"
        >
          ADICIONAR
        </div>
        <div className="card-base border-radius-10 d-flex flex-column flex-md-row gap-2 flex-grow-1 p-2">
          <input
            className="form-control border-0 flex-grow-1"
            style={{ height: 46 }}
            placeholder="Pesquisar Nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            style={{ height: 46, borderRadius: 10, minWidth: 150 }}
            onClick={() => setSearch("")}
          >
            LIMPAR FILTRO
          </button>
        </div>
      </div>

      {isLoading && <p>Carregando...</p>}
      {isError && (
        <p className="text-danger">Erro: {error}</p>
      )}

      <div className="d-flex flex-column gap-3">
        {filtered.map((u) => (
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
                    <span
                      key={r.id}
                      className="badge bg-secondary text-dark"
                    >
                      {r.authority}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-outline-secondary fw-bold"
                style={{ minWidth: 120, borderRadius: 10, color: "#9e9e9e" }}
                disabled
              >
                EDITAR
              </button>
              <button
                className="btn btn-outline-danger fw-bold"
                style={{ minWidth: 120, borderRadius: 10 }}
                disabled
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