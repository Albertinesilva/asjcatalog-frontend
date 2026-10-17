import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoryService } from "@/services/category-service";
import { alerts } from "@/utils/alerts";
import { Button, Card, Input } from "@/components/ui";
import { CategoryFormSkeleton, ErrorState, NotFoundState } from "@/components";
import { useResource } from "@/hooks/useResource";
import { handleApiError } from "@/utils/api-error-handler";
import { getUiErrorMessage } from "@/utils/ui-error";

type FormFields = { name: string };
type Props = { mode: "create" | "edit" };

export default function CategoryForm({ mode }: Props) {
  const { t } = useTranslation(["categories", "validation"]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ defaultValues: { name: "" } });

  const categoryId = Number(id);
  const invalidEditId = mode === "edit" && (!id || Number.isNaN(categoryId));
  const fetchCategory = useCallback(() => categoryService.findById(categoryId), [categoryId]);
  const { state, reload } = useResource(mode === "edit" && !invalidEditId ? fetchCategory : null);

  useEffect(() => {
    if (state.status === "success") reset({ name: state.data.name });
  }, [state, reset]);

  const onSubmit = async (data: FormFields) => {
    setSaveError(null);
    try {
      if (mode === "create") {
        await categoryService.create({ name: data.name });
        await alerts.success(
          t("categories:form.successNewTitle"),
          t("categories:form.successNewMessage"),
        );
      } else if (id) {
        await categoryService.update(Number(id), { name: data.name });
        await alerts.success(
          t("categories:form.successEditTitle"),
          t("categories:form.successEditMessage"),
        );
      }
      navigate("/dashboard/categories");
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof FormFields, error),
        fallbackTitle: t("categories:form.failTitle"),
      });
      if (!handled) setSaveError(getUiErrorMessage(err));
    }
  };

  if (invalidEditId || state.status === "notFound") {
    return <NotFoundState backTo="/dashboard/categories" />;
  }
  if (state.status === "error") return <ErrorState message={state.message} onRetry={reload} />;
  if (state.status === "loading") return <CategoryFormSkeleton />;

  return (
    <Card padding="lg" className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
        <Input
          label={t("categories:form.name")}
          required
          error={errors.name?.message}
          {...register("name", { required: t("validation:nameRequired") })}
        />
        {saveError && (
          <p className="text-small text-danger m-0" role="alert">
            {t("common:error", { defaultValue: "Erro" })}: {saveError}
          </p>
        )}
        <div className="flex flex-wrap gap-sm pt-sm">
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? t("categories:form.submitting") : t("categories:form.submit")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/dashboard/categories")}
          >
            {t("categories:form.cancel")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
