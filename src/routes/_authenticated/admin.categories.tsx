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

  return (
    <div className="container py-4">
      <h3 className="mb-4">Categorias</h3>

      <form
        className="d-flex gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (newName.trim()) createMut.mutate(newName.trim());
        }}
      >
        <input
          className="form-control"
          placeholder="Nova categoria"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={createMut.isPending}
        >
          Adicionar
        </button>
      </form>

      {isLoading && <p>Carregando...</p>}
      {isError && (
        <p className="text-danger">
          Erro ao carregar categorias: {(error as Error).message}
        </p>
      )}

      <ul className="list-group">
        {data?.map((c) => (
          <li
            key={c.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {editingId === c.id ? (
              <>
                <input
                  className="form-control me-2"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() =>
                      updateMut.mutate({ id: c.id, name: editingName })
                    }
                  >
                    Salvar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setEditingId(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>{c.name}</span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setEditingId(c.id);
                      setEditingName(c.name);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      if (window.confirm("Excluir categoria?")) {
                        deleteMut.mutate(c.id);
                      }
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}