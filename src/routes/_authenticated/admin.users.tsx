import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { User } from "../../lib/types";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersAdmin,
});

function UsersAdmin() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await api.get<
        User[] | { content: User[] }
      >("/users", { params: { page: 0, size: 50, sort: "firstName,asc" } });
      const d = res.data;
      return Array.isArray(d) ? d : d.content;
    },
  });

  return (
    <div className="container py-4">
      <h3 className="mb-4">Usuários</h3>

      {isLoading && <p>Carregando...</p>}
      {isError && (
        <p className="text-danger">
          Erro: {(error as Error).message}
        </p>
      )}

      <div className="table-responsive">
        <table className="table table-striped card-base">
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Permissões</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  {u.firstName} {u.lastName}
                </td>
                <td>{u.email}</td>
                <td>
                  {u.roles?.map((r) => (
                    <span
                      key={r.id}
                      className="badge bg-secondary me-1"
                    >
                      {r.authority}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}