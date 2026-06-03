import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Category, ProductItemProps } from "../../lib/types";

type FormFields = {
  name: string;
  price: number;
  imgUrl: string;
  description: string;
  categoryIds: string[];
};

type Props = {
  mode: "create" | "edit";
  productId?: string;
};

export default function ProductForm({ mode, productId }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    defaultValues: {
      name: "",
      price: 0,
      imgUrl: "",
      description: "",
      categoryIds: [],
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await api.get<Category[] | { content: Category[] }>(
        "/categories",
      );
      const data = res.data;
      return Array.isArray(data) ? data : data.content;
    },
  });

  const productQuery = useQuery({
    queryKey: ["product", productId],
    enabled: mode === "edit" && !!productId,
    queryFn: async () => {
      const res = await api.get<ProductItemProps>(`/products/${productId}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (mode === "edit" && productQuery.data) {
      const p = productQuery.data;
      reset({
        name: p.name,
        price: p.price,
        imgUrl: p.imgUrl,
        description: p.description,
        categoryIds: p.categories?.map((c) => String(c.id)) ?? [],
      });
    }
  }, [mode, productQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormFields) => {
      const payload = {
        name: data.name,
        price: Number(data.price),
        imgUrl: data.imgUrl,
        description: data.description,
        categories: data.categoryIds.map((id) => ({ id: Number(id) })),
      };
      if (mode === "create") {
        return api.post("/products", payload);
      }
      return api.put(`/products/${productId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      navigate({ to: "/admin/products" });
    },
  });

  const onSubmit = (data: FormFields) => saveMutation.mutate(data);

  return (
    <div className="container py-4">
      <div className="card-base p-4 border-radius-10">
        <h3 className="mb-4">
          {mode === "create" ? "Adicionar Produto" : "Editar Produto"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nome</label>
              <input
                className="form-control"
                {...register("name", { required: "Nome é obrigatório" })}
              />
              {errors.name && (
                <small className="text-danger">{errors.name.message}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Preço</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                {...register("price", {
                  required: "Preço é obrigatório",
                  valueAsNumber: true,
                  min: { value: 0, message: "Deve ser positivo" },
                })}
              />
              {errors.price && (
                <small className="text-danger">{errors.price.message}</small>
              )}
            </div>

            <div className="col-12">
              <label className="form-label">URL da Imagem</label>
              <input
                className="form-control"
                {...register("imgUrl", { required: "URL é obrigatória" })}
              />
              {errors.imgUrl && (
                <small className="text-danger">{errors.imgUrl.message}</small>
              )}
            </div>

            <div className="col-12">
              <label className="form-label">Categorias</label>
              <select
                multiple
                className="form-select"
                size={Math.min(6, (categoriesQuery.data?.length ?? 1) + 1)}
                {...register("categoryIds", {
                  validate: (v) =>
                    v.length > 0 || "Selecione pelo menos uma categoria",
                })}
              >
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
              <small className="text-muted">
                Use Ctrl/Cmd para selecionar várias.
              </small>
              {errors.categoryIds && (
                <div>
                  <small className="text-danger">
                    {errors.categoryIds.message as string}
                  </small>
                </div>
              )}
            </div>

            <div className="col-12">
              <label className="form-label">Descrição</label>
              <textarea
                className="form-control"
                rows={4}
                {...register("description", {
                  required: "Descrição é obrigatória",
                })}
              />
              {errors.description && (
                <small className="text-danger">
                  {errors.description.message}
                </small>
              )}
            </div>
          </div>

          {saveMutation.isError && (
            <p className="text-danger mt-3">
              Erro ao salvar: {(saveMutation.error as Error).message}
            </p>
          )}

          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || saveMutation.isPending}
            >
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate({ to: "/admin/products" })}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}