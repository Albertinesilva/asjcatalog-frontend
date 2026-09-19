import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { accountService } from "@/services/account-service";
import { Button, Card, Input } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { handleApiError } from "@/utils/api-error-handler";
import { authFormTitle } from "./_ui";

type RecoverFormFields = { email: string; emailConfirm: string };

export default function RecoverPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecoverFormFields>();
  const emailValue = watch("email");

  const onSubmit = async (data: RecoverFormFields) => {
    try {
      await accountService.requestPasswordRecovery(data.email);
      await alerts.success(t("auth:recover.successTitle"), t("auth:recover.successMessage"));
      navigate("/auth/login");
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof RecoverFormFields, error),
        fallbackTitle: t("auth:recover.failTitle"),
        fallbackMessage: t("auth:recover.failMessage"),
      });
      if (!handled) await alerts.error(t("auth:recover.failTitle"), t("auth:recover.failMessage"));
    }
  };

  return (
    <Card padding="lg" elevated bordered className="w-full max-w-form">
      <form className="flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className={authFormTitle}>{t("auth:recover.title")}</h2>

        <Input
          type="email"
          autoComplete="email"
          placeholder={t("auth:recover.emailPlaceholder")}
          aria-label={t("auth:recover.emailPlaceholder")}
          error={errors.email?.message}
          {...register("email", {
            required: t("validation:email.requiredShort"),
            pattern: {
              value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: t("validation:emailInvalid"),
            },
          })}
        />

        <Input
          type="email"
          autoComplete="email"
          placeholder={t("auth:recover.confirmEmailPlaceholder")}
          aria-label={t("auth:recover.confirmEmailAria")}
          error={errors.emailConfirm?.message}
          {...register("emailConfirm", {
            required: t("validation:email.confirm"),
            validate: (v) => v === emailValue || t("validation:email.mismatch"),
          })}
        />

        <div className="flex gap-sm mt-sm">
          <Link to="/auth/login" className="flex-1">
            <Button type="button" variant="outline" size="lg" fullWidth>
              {t("auth:recover.cancel")}
            </Button>
          </Link>
          <Button type="submit" size="lg" loading={isSubmitting} className="flex-1">
            {isSubmitting ? t("auth:recover.submitting") : t("auth:recover.submit")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
