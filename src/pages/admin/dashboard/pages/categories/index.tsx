import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import type { Category } from "@/@types";

export default function CategoriesAdminPage() {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const loadCategories = () => {
    setIsLoading(true);
    api
      .get<Category[] | { content: Category[] }>("/categories")
      .then((res) => {
        const d = res.data;
        setData(Array.isArray(d) ? d : d.content);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadCategories, []);

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const filtered = data.filter((c) =>
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
              api.post("/categories", { name: newName.trim() }).then(() => {
                setNewName("");
                setShowAdd(false);
                loadCategories();
              }).catch((err: Error) => setError(err.message));
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
      {error && (
        <p className="text-danger">
          Erro ao carregar categorias: {error}
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
                    onClick={() => {
                      api.put(`/categories/${c.id}`, { id: c.id, name: editingName }).then(() => {
                        setEditingId(null);
                        loadCategories();
                      }).catch((err: Error) => setError(err.message));
                    }}
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
                        api.delete(`/categories/${c.id}`).then(loadCategories).catch((err: Error) => setError(err.message));
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