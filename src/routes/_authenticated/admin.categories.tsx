import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Category } from "../../lib/types";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await api.get<Category[] | { content: Category[] }>(
        "/categories",
      );
      const d = res.data;
      return Array.isArray(d) ? d : d.content;
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });

  const createMut = useMutation({
    mutationFn: (name: string) => api.post("/categories", { name }),
    onSuccess: () => {
      setNewName("");
      invalidate();
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      api.put(`/categories/${id}`, { id, name }),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}`),
    onSuccess: invalidate,
  });

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const filtered = (data ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex flex-column flex-md-row gap-3 mb-4 align-items-stretch align-items-md-center">
        <button
          type="button"
          className="btn btn-primary fw-bold"
          style={{ minWidth: 180, height: 50, borderRadius: 10 }}
          onClick={() => setShowAdd((s) => !s)}
        >
          ADICIONAR
        </button>
        <div className="card-base border-radius-10 d-flex flex-column flex-md-row gap-2 flex-grow-1 p-2">
          <input
            className="form-control border-0 flex-grow-1"
            style={{ height: 46 }}
            placeholder="Pesquisar Categoria"
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

      {showAdd && (
        <form
          className="card-base border-radius-10 p-3 mb-4 d-flex flex-column flex-md-row gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (newName.trim()) {
              createMut.mutate(newName.trim(), {
                onSuccess: () => setShowAdd(false),
              });
            }
          }}
        >
          <input
            className="form-control"
            placeholder="Nome da categoria"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createMut.isPending}
          >
            CADASTRAR
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowAdd(false)}
          >
            CANCELAR
          </button>
        </form>
      )}

      {isLoading && <p>Carregando...</p>}
      {isError && (
        <p className="text-danger">
          Erro ao carregar categorias: {(error as Error).message}
        </p>
      )}

      <div className="d-flex flex-column gap-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="card-base border-radius-10 d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 gap-2"
          >
            {editingId === c.id ? (
              <input
                className="form-control"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
              />
            ) : (
              <h5 className="m-0 fw-bold" style={{ color: "#263238" }}>
                {c.name}
              </h5>
            )}
            <div className="d-flex gap-2 flex-wrap">
              {editingId === c.id ? (
                <>
                  <button
                    className="btn btn-primary"
                    style={{ minWidth: 120, borderRadius: 10 }}
                    onClick={() =>
                      updateMut.mutate({ id: c.id, name: editingName })
                    }
                  >
                    SALVAR
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    style={{ minWidth: 120, borderRadius: 10 }}
                    onClick={() => setEditingId(null)}
                  >
                    CANCELAR
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-outline-secondary fw-bold"
                    style={{ minWidth: 120, borderRadius: 10, color: "#9e9e9e" }}
                    onClick={() => {
                      setEditingId(c.id);
                      setEditingName(c.name);
                    }}
                  >
                    EDITAR
                  </button>
                  <button
                    className="btn btn-outline-danger fw-bold"
                    style={{ minWidth: 120, borderRadius: 10 }}
                    onClick={() => {
                      if (window.confirm("Excluir categoria?")) {
                        deleteMut.mutate(c.id);
                      }
                    }}
                  >
                    EXCLUIR
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}