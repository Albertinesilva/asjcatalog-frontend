import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { categoryService } from "@/services/category-service";
import type { Category } from "@/types";

export default function CategoryListPage() {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    setIsLoading(true);
    categoryService
      .findAll()
      .then((d) => setData(Array.isArray(d) ? d : d.content))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const filtered = data.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleDelete = (id: number) => {
    if (!window.confirm("Excluir categoria?")) return;
    categoryService
      .delete(id)
      .then(load)
      .catch((err: Error) => setError(err.message));
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex flex-column flex-md-row gap-3 mb-4 align-items-stretch align-items-md-center">
        <Link
          to="/admin/categories/new"
          className="btn btn-primary fw-bold d-flex align-items-center justify-content-center"
          style={{ minWidth: 180, height: 50, borderRadius: 10 }}
        >
          ADICIONAR
        </Link>
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

      {isLoading && <p>Carregando...</p>}
      {error && (
        <p className="text-danger">Erro ao carregar categorias: {error}</p>
      )}

      <div className="d-flex flex-column gap-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="card-base border-radius-10 d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 gap-2"
          >
            <h5 className="m-0 fw-bold" style={{ color: "#263238" }}>
              {c.name}
            </h5>
            <div className="d-flex gap-2 flex-wrap">
              <Link
                to={`/admin/categories/${c.id}`}
                className="btn btn-outline-secondary fw-bold"
                style={{ minWidth: 120, borderRadius: 10, color: "#9e9e9e" }}
              >
                EDITAR
              </Link>
              <button
                className="btn btn-outline-danger fw-bold"
                style={{ minWidth: 120, borderRadius: 10 }}
                onClick={() => handleDelete(c.id)}
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