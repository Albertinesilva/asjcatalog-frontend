import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import type { Category, ProductRequest } from "@/types";

type FormFields = {
  name: string;
  price: number;
  imgUrl: string;
  description: string;
  categoryIds: string[];
};

type Props = {
  mode: "create" | "edit";
};

export default function ProductForm({ mode }: Props) {
  const navigate = useNavigate();
  const { id: productId } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  useEffect(() => {
    categoryService.findAll().then(setCategories);
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    productService.findById(Number(productId)).then((p) => {
      reset({
        name: p.name,
        price: p.price,
        imgUrl: p.imgUrl,
        description: p.description,
        categoryIds: p.categories?.map((c) => String(c.id)) ?? [],
      });
    });
  }, [mode, productId, reset]);

  const onSubmit = async (data: FormFields) => {
    setLoading(true);
    setSaveError(null);
    const payload: ProductRequest = {
      name: data.name,
      price: data.price,
      imgUrl: data.imgUrl,
      description: data.description,
      categoryIds: data.categoryIds.map(Number),
    };
    try {
      if (mode === "create") await productService.create(payload);
      else if (productId) await productService.update(Number(productId), payload);
      navigate("/dashboard/products");
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card-base p-4 border-radius-10">
        <h3 className="mb-4">{mode === "create" ? "Adicionar Produto" : "Editar Produto"}</h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nome</label>
              <input
                className="form-control"
                {...register("name", { required: "Nome é obrigatório" })}
              />
              {errors.name && <small className="text-danger">{errors.name.message}</small>}
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
              {errors.price && <small className="text-danger">{errors.price.message}</small>}
            </div>

            <div className="col-12">
              <label className="form-label">URL da Imagem</label>
              <input
                className="form-control"
                {...register("imgUrl", { required: "URL é obrigatória" })}
              />
              {errors.imgUrl && <small className="text-danger">{errors.imgUrl.message}</small>}
            </div>

            <div className="col-12">
              <label className="form-label">Categorias</label>
              <select
                multiple
                className="form-select"
                size={Math.min(6, categories.length + 1)}
                {...register("categoryIds", {
                  validate: (v) => v.length > 0 || "Selecione pelo menos uma categoria",
                })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
              <small className="text-muted">Use Ctrl/Cmd para selecionar várias.</small>
              {errors.categoryIds && (
                <div>
                  <small className="text-danger">{errors.categoryIds.message as string}</small>
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
                <small className="text-danger">{errors.description.message}</small>
              )}
            </div>
          </div>

          {saveError && <p className="text-danger mt-3">Erro ao salvar: {saveError}</p>}

          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/dashboard/products")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
