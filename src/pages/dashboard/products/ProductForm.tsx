import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import { alerts } from "@/utils/alerts";
import type { ProductRequest } from "@/types";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { ErrorState, NotFoundState, ProductFormSkeleton } from "@/components";
import { useResource } from "@/hooks/useResource";
import { handleApiError } from "@/utils/api-error-handler";
import { getUiErrorMessage } from "@/utils/ui-error";

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
  const { t } = useTranslation(["products", "validation"]);
  const navigate = useNavigate();
  const { id: productId } = useParams<{ id: string }>();
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

  // Categorias e (no modo edição) o produto precisam estar carregados antes do
  // formulário: sem as opções, o multi-select perderia a seleção do `reset`.
  const fetchCategories = useCallback(() => categoryService.findAll(), []);
  const { state: categoriesState, reload: reloadCategories } = useResource(fetchCategories);

  const id = Number(productId);
  const invalidEditId = mode === "edit" && (!productId || Number.isNaN(id));
  const fetchProduct = useCallback(() => productService.findById(id), [id]);
  const { state: productState, reload: reloadProduct } = useResource(
    mode === "edit" && !invalidEditId ? fetchProduct : null,
  );

  useEffect(() => {
    if (productState.status !== "success" || categoriesState.status !== "success") return;
    const p = productState.data;
    reset({
      name: p.name,
      price: p.price,
      imgUrl: p.imgUrl,
      description: p.description,
      categoryIds: p.categories?.map((c) => String(c.id)) ?? [],
    });
  }, [productState, categoriesState, reset]);

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
        await alerts.success(
          t("products:success.createdTitle"),
          t("products:success.createdMessage"),
        );
      } else if (productId) {
        await productService.update(Number(productId), payload);
        await alerts.success(
          t("products:success.updatedTitle"),
          t("products:success.updatedMessage"),
        );
      }
      navigate("/dashboard/products");
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof FormFields, error),
        fallbackTitle: t("products:errors.saveTitle"),
      });
      if (!handled) setSaveError(getUiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (invalidEditId || productState.status === "notFound") {
    return <NotFoundState backTo="/dashboard/products" />;
  }
  if (productState.status === "error") {
    return <ErrorState message={productState.message} onRetry={reloadProduct} />;
  }
  if (categoriesState.status === "error") {
    return (
      <ErrorState
        title={t("products:errors.categoriesLoad")}
        description={categoriesState.message}
        onRetry={reloadCategories}
      />
    );
  }
  if (productState.status === "loading" || categoriesState.status !== "success") {
    return <ProductFormSkeleton />;
  }

  const categories = categoriesState.data;

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Input
            label={t("products:fields.name")}
            required
            error={errors.name?.message}
            {...register("name", { required: t("validation:nameRequired") })}
          />
          <Input
            label={t("products:fields.price")}
            type="number"
            step="0.01"
            required
            error={errors.price?.message}
            {...register("price", {
              required: t("validation:priceRequired"),
              valueAsNumber: true,
              min: { value: 0, message: t("validation:priceMin") },
            })}
          />
        </div>

        <Input
          label={t("products:fields.imageUrl")}
          required
          error={errors.imgUrl?.message}
          {...register("imgUrl", { required: t("validation:imgUrlRequired") })}
        />

        <Select
          id="product-categories"
          multiple
          required
          label={t("products:fields.categories")}
          size={Math.min(6, categories.length + 1)}
          error={errors.categoryIds?.message as string | undefined}
          helperText={t("products:hints.categoriesMulti")}
          {...register("categoryIds", {
            validate: (v) => v.length > 0 || t("validation:categoriesRequired"),
          })}
        >
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </Select>

        <Textarea
          id="product-description"
          label={t("products:fields.description")}
          required
          rows={4}
          error={errors.description?.message}
          {...register("description", { required: t("validation:descriptionRequired") })}
        />

        {saveError && (
          <p className="text-small text-danger m-0" role="alert">
            {t("products:errors.savePrefix")}: {saveError}
          </p>
        )}

        <div className="flex flex-wrap gap-sm pt-sm">
          <Button type="submit" variant="primary" loading={isSubmitting || loading}>
            {loading ? t("products:actions.saving") : t("products:actions.save")}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/dashboard/products")}>
            {t("products:actions.cancel")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
