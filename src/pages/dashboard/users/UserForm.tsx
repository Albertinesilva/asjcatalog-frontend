import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { userService } from "@/services/user-service";
import { PasswordField, PasswordRequirements } from "@/components";
import { alerts } from "@/utils/alerts";
import type { Role } from "@/types";
import { Button, Card, Input } from "@/components/ui";
import { inputBaseClasses } from "@/components/ui/Input";
import { handleApiError } from "@/utils/api-error-handler";
import { buildPasswordValidation } from "@/utils/password";

const AVAILABLE_ROLES: { id: number; authority: Role }[] = [
  { id: 1, authority: "ROLE_OPERATOR" },
  { id: 2, authority: "ROLE_ADMIN" },
];

type FormFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleIds: string[];
};

type Props = { mode: "create" | "edit" };

export default function UserForm({ mode }: Props) {
  const { t } = useTranslation(["users", "validation"]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roleIds: [],
    },
  });

  const passwordValue = watch("password") ?? "";
  const firstNameValue = watch("firstName") ?? "";
  const lastNameValue = watch("lastName") ?? "";
  const emailValue = watch("email") ?? "";
  const passwordContext = {
    firstName: firstNameValue,
    lastName: lastNameValue,
    email: emailValue,
  };

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    userService
      .findById(Number(id))
      .then((u) =>
        reset({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          password: "",
          roleIds: (u.roles ?? []).map((r) => String(r.id)),
        }),
      )
      .catch((err: Error) => setSaveError(err.message));
  }, [mode, id, reset]);

  const onSubmit = async (data: FormFields) => {
    setSaveError(null);
    const roleIds = data.roleIds.map((rid) => Number(rid));
    try {
      if (mode === "create") {
        await userService.create({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          roleIds,
        });
        await alerts.success(
          t("users:success.createdTitle"),
          t("users:success.createdMessage"),
        );
      } else if (id) {
        await userService.update(Number(id), {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          roleIds,
        });
        await alerts.success(
          t("users:success.updatedTitle"),
          t("users:success.updatedMessage"),
        );
      }
      navigate("/dashboard/users");
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof FormFields, error),
        fallbackTitle: t("users:errors.saveTitle"),
        fallbackMessage: t("users:errors.saveMessage"),
      });
      if (!handled) {
        setSaveError((err as Error).message);
      }
    }
  };

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Input
            label={t("users:fields.firstName")}
            required
            error={errors.firstName?.message}
            {...register("firstName", { required: t("validation:firstNameRequired") })}
          />
          <Input
            label={t("users:fields.lastName")}
            required
            error={errors.lastName?.message}
            {...register("lastName", { required: t("validation:lastNameRequired") })}
          />
        </div>
        <Input
          label={t("users:fields.email")}
          type="email"
          required
          error={errors.email?.message}
          {...register("email", { required: t("validation:emailRequired") })}
        />
        {mode === "create" && (
          <div className="flex flex-col gap-sm">
            {(() => {
              const reg = register("password", buildPasswordValidation(t, () => passwordContext));
              return (
                <PasswordField
                  id="user-password"
                  label={t("users:fields.password")}
                  required
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...reg}
                />
              );
            })()}
            <PasswordRequirements password={passwordValue} context={passwordContext} />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="user-roles" className="text-small font-medium text-foreground">
            {t("users:fields.roles")}{" "}
            <span aria-hidden="true" className="text-danger ml-0.5">
              *
            </span>
          </label>
          <select
            id="user-roles"
            multiple
            className={`${inputBaseClasses} h-auto py-2`}
            size={AVAILABLE_ROLES.length}
            aria-invalid={errors.roleIds ? true : undefined}
            {...register("roleIds", {
              validate: (v) => v.length > 0 || t("validation:rolesRequired"),
            })}
          >
            {AVAILABLE_ROLES.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {t(`users:roles.${r.authority}`)}
              </option>
            ))}
          </select>
          {errors.roleIds && (
            <p className="text-small text-danger">{errors.roleIds.message as string}</p>
          )}
        </div>
        {saveError && (
          <p className="text-small text-danger m-0" role="alert">
            {t("users:errors.savePrefix")}: {saveError}
          </p>
        )}
        <div className="flex flex-wrap gap-sm pt-sm">
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? t("users:actions.saving") : t("users:actions.save")}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/dashboard/users")}>
            {t("users:actions.cancel")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
