import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import { alerts } from "@/utils/alerts";
import type { Category, ProductRequest } from "@/types";
import { Button, Card, Input } from "@/components/ui";
import { inputBaseClasses } from "@/components/ui/Input";
import { handleApiError } from "@/utils/api-error-handler";
import { getApiErrorMessage } from "@/utils/api-error";

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
    setError,
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
      if (mode === "create") {
        await productService.create(payload);
        await alerts.success("Produto criado", "Produto criado com sucesso.");
      } else if (productId) {
        await productService.update(Number(productId), payload);
        await alerts.success("Produto atualizado", "Produto atualizado com sucesso.");
      }
      navigate("/dashboard/products");
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof FormFields, error),
        fallbackTitle: "Falha ao salvar produto",
      });
      if (!handled) setSaveError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Input
            label="Nome"
            required
            error={errors.name?.message}
            {...register("name", { required: "Nome é obrigatório" })}
          />
          <Input
            label="Preço"
            type="number"
            step="0.01"
            required
            error={errors.price?.message}
            {...register("price", {
              required: "Preço é obrigatório",
              valueAsNumber: true,
              min: { value: 0, message: "Deve ser positivo" },
            })}
          />
        </div>

        <Input
          label="URL da Imagem"
          required
          error={errors.imgUrl?.message}
          {...register("imgUrl", { required: "URL é obrigatória" })}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-categories" className="text-small font-medium text-foreground">
            Categorias{" "}
            <span aria-hidden="true" className="text-danger ml-0.5">
              *
            </span>
          </label>
          <select
            id="product-categories"
            multiple
            className={`${inputBaseClasses} h-auto py-2`}
            size={Math.min(6, categories.length + 1)}
            aria-invalid={errors.categoryIds ? true : undefined}
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
          {errors.categoryIds ? (
            <p className="text-small text-danger">{errors.categoryIds.message as string}</p>
          ) : (
            <p className="text-small text-foreground-muted">Use Ctrl/Cmd para selecionar várias.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-description" className="text-small font-medium text-foreground">
            Descrição{" "}
            <span aria-hidden="true" className="text-danger ml-0.5">
              *
            </span>
          </label>
          <textarea
            id="product-description"
            rows={4}
            className={`${inputBaseClasses} h-auto py-2 resize-y`}
            aria-invalid={errors.description ? true : undefined}
            {...register("description", { required: "Descrição é obrigatória" })}
          />
          {errors.description && (
            <p className="text-small text-danger">{errors.description.message}</p>
          )}
        </div>

        {saveError && (
          <p className="text-small text-danger m-0" role="alert">
            Erro ao salvar: {saveError}
          </p>
        )}

        <div className="flex flex-wrap gap-sm pt-sm">
          <Button type="submit" variant="primary" loading={isSubmitting || loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/dashboard/products")}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
