import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { categoryService } from "@/services/category-service";
import { alerts } from "@/utils/alerts";
import { Button, Card, Input } from "@/components/ui";
import { handleApiError } from "@/utils/api-error-handler";
import { getApiErrorMessage } from "@/utils/api-error";

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
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ defaultValues: { name: "" } });

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    categoryService
      .findById(Number(id))
      .then((c) => reset({ name: c.name }))
      .catch((err) => setSaveError(getApiErrorMessage(err)));
  }, [mode, id, reset]);

  const onSubmit = async (data: FormFields) => {
    setSaveError(null);
    try {
      if (mode === "create") {
        await categoryService.create({ name: data.name });
        await alerts.success("Categoria criada", "Categoria criada com sucesso.");
      } else if (id) {
        await categoryService.update(Number(id), {
          id: Number(id),
          name: data.name,
        });
        await alerts.success("Categoria atualizada", "Categoria atualizada com sucesso.");
      }
      navigate("/dashboard/categories");
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof FormFields, error),
        fallbackTitle: "Falha ao salvar categoria",
      });
      if (!handled) setSaveError(getApiErrorMessage(err));
    }
  };

  return (
    <Card padding="lg" className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
        <Input
          label="Nome"
          required
          error={errors.name?.message}
          {...register("name", { required: "Nome é obrigatório" })}
        />
        {saveError && (
          <p className="text-small text-danger m-0" role="alert">
            Erro: {saveError}
          </p>
        )}
        <div className="flex flex-wrap gap-sm pt-sm">
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/dashboard/categories")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
