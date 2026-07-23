import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["products", "validation"]);
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-categories" className="text-small font-medium text-foreground">
            {t("products:fields.categories")}{" "}
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
              validate: (v) => v.length > 0 || t("validation:categoriesRequired"),
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
            <p className="text-small text-foreground-muted">{t("products:hints.categoriesMulti")}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-description" className="text-small font-medium text-foreground">
            {t("products:fields.description")}{" "}
            <span aria-hidden="true" className="text-danger ml-0.5">
              *
            </span>
          </label>
          <textarea
            id="product-description"
            rows={4}
            className={`${inputBaseClasses} h-auto py-2 resize-y`}
            aria-invalid={errors.description ? true : undefined}
            {...register("description", { required: t("validation:descriptionRequired") })}
          />
          {errors.description && (
            <p className="text-small text-danger">{errors.description.message}</p>
          )}
        </div>

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
