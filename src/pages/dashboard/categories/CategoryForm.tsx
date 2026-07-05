import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { categoryService } from "@/services/category-service";

type FormFields = { name: string };
type Props = { mode: "create" | "edit" };

export default function CategoryForm({ mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ defaultValues: { name: "" } });

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    categoryService
      .findById(Number(id))
      .then((c) => reset({ name: c.name }))
      .catch((err: Error) => setSaveError(err.message));
  }, [mode, id, reset]);

  const onSubmit = async (data: FormFields) => {
    setSaveError(null);
    try {
      if (mode === "create") {
        await categoryService.create({ name: data.name });
      } else if (id) {
        await categoryService.update(Number(id), {
          id: Number(id),
          name: data.name,
        });
      }
      navigate("/dashboard/categories");
    } catch (err) {
      setSaveError((err as Error).message);
    }
  };

  return (
    <div className="container py-4">
      <div className="card-base p-4 border-radius-10">
        <h3 className="mb-4">{mode === "create" ? "Adicionar Categoria" : "Editar Categoria"}</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input
              className="form-control"
              {...register("name", { required: "Nome é obrigatório" })}
            />
            {errors.name && <small className="text-danger">{errors.name.message}</small>}
          </div>
          {saveError && <p className="text-danger">Erro: {saveError}</p>}
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/dashboard/categories")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
