import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { accountService } from "@/services/account-service";
import { PasswordField, PasswordMatch, PasswordRequirements } from "@/components";
import { Button, Card } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { handleApiError } from "@/utils/api-error-handler";
import { getUiErrorMessage } from "@/utils/ui-error";
import { buildPasswordValidation } from "@/utils/password";
import { authFieldError, authFormTitle } from "./_ui";

type FormFields = { password: string; confirmPassword: string };

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>();
  const passwordValue = watch("password") ?? "";
  const confirmValue = watch("confirmPassword") ?? "";

  const onSubmit = async (data: FormFields) => {
    if (!token) {
      await alerts.error(t("auth:reset.invalidTokenTitle"), t("auth:reset.invalidTokenMessage"));
      return;
    }
    try {
      await accountService.resetPassword(token, data.password);
      await alerts.success(t("auth:reset.successTitle"), t("auth:reset.successMessage"));
      navigate("/auth/login");
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof FormFields, error),
        fallbackTitle: t("auth:reset.failTitle"),
        fallbackMessage: t("auth:reset.failMessage"),
      });
      if (!handled)
        await alerts.error(
          t("auth:reset.failTitle"),
          getUiErrorMessage(err, t("auth:reset.failMessage")),
        );
    }
  };

  return (
    <Card padding="lg" elevated bordered className="w-full max-w-form">
      <form className="flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className={authFormTitle}>{t("auth:reset.title")}</h2>
        {!token && (
          <p className={authFieldError} role="alert">
            {t("auth:reset.tokenMissing")}
          </p>
        )}

        <div className="flex flex-col gap-sm">
          {(() => {
            const reg = register("password", buildPasswordValidation(t));
            return (
              <PasswordField
                placeholder={t("auth:reset.newPasswordPlaceholder")}
                autoComplete="new-password"
                aria-label={t("auth:reset.newPasswordAria")}
                error={errors.password?.message}
                {...reg}
              />
            );
          })()}
          <PasswordRequirements password={passwordValue} />
        </div>

        <div className="flex flex-col gap-1.5">
          <PasswordField
            placeholder={t("auth:reset.confirmPasswordPlaceholder")}
            autoComplete="new-password"
            aria-label={t("auth:reset.confirmPasswordAria")}
            error={
              errors.confirmPassword?.message && !confirmValue
                ? errors.confirmPassword.message
                : undefined
            }
            {...register("confirmPassword", {
              required: t("validation:password.confirm"),
              validate: (v) => v === passwordValue || t("validation:password.mismatch"),
            })}
          />
          <PasswordMatch password={passwordValue} confirm={confirmValue} />
        </div>

        <div className="flex gap-sm mt-sm">
          <Link to="/auth/login" className="flex-1">
            <Button type="button" variant="outline" size="lg" fullWidth>
              {t("auth:reset.cancel")}
            </Button>
          </Link>
          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting || !token}
            className="flex-1"
          >
            {isSubmitting ? t("auth:reset.submitting") : t("auth:reset.submit")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
