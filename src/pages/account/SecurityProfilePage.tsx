import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { updateOwnPassword } from "@/services/account-service";
import {
  LoadingState,
  ErrorState,
  PasswordField,
  PasswordMatch,
  PasswordRequirements,
} from "@/components";
import { getApiErrorMessage, parseApiError } from "@/utils/api-error";
import { alerts } from "@/utils/alerts";
import { Button, Card } from "@/components/ui";
import { handleApiError } from "@/utils/api-error-handler";
import { buildPasswordValidation } from "@/utils/password";

type PasswordFields = {
  currentPassword: string;
  password: string;
  confirmPassword: string;
};

type Feedback = { kind: "success" | "error"; message: string } | null;

/**
 * SecurityProfilePage — /account/profile/security.
 * Formulário de alteração de senha extraído da antiga ProfilePage,
 * preservando integralmente validações, i18n e tratamento de erros.
 */
export default function SecurityProfilePage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  const passwordForm = useForm<PasswordFields>({
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = passwordForm;

  const passwordValue = watchPassword("password") ?? "";
  const confirmPasswordValue = watchPassword("confirmPassword") ?? "";

  if (loading && !user) {
    return <LoadingState message={t("profile:loading")} />;
  }

  if (!user) {
    return <ErrorState message={t("profile:loadError")} />;
  }

  const passwordContext = {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
  };

  const onChangePassword = async (data: PasswordFields) => {
    setPasswordFeedback(null);
    if (data.password !== data.confirmPassword) {
      setPasswordFeedback({ kind: "error", message: t("validation:password.mismatch") });
      return;
    }
    try {
      await updateOwnPassword({
        currentPassword: data.currentPassword,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      });
      passwordForm.reset({ currentPassword: "", password: "", confirmPassword: "" });
      setPasswordFeedback({ kind: "success", message: t("profile:successPasswordMessage") });
      await alerts.success(t("profile:successPasswordTitle"), t("profile:successPasswordMessage"));
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.code === "PASSWORD_UPDATE_ERROR") {
        // 422 de negócio: mantém sessão, mantém campos e permite nova tentativa.
        const message = parsed.message || t("profile:passwordUpdateError");
        setPasswordFeedback({ kind: "error", message });
        passwordForm.setError(
          "currentPassword",
          { type: "server", message },
          { shouldFocus: true },
        );
        return;
      }
      const handled = await handleApiError(err, {
        setError: (name, error) => passwordForm.setError(name as keyof PasswordFields, error),
        fallbackTitle: t("profile:failPasswordTitle"),
        fallbackMessage: t("profile:failPasswordMessage"),
      });
      if (!handled) {
        setPasswordFeedback({
          kind: "error",
          message: getApiErrorMessage(err, t("profile:failPasswordMessage")),
        });
      }
    }
  };

  return (
    <div className="flex w-full max-w-3xl flex-col gap-md">
      <Link
        to="/account/profile"
        className="inline-flex items-center gap-xs self-start text-small text-foreground-muted transition-colors duration-DEFAULT ease-standard hover:text-accent focus-visible:outline-none focus-visible:text-accent"
      >
        <span aria-hidden>&larr;</span>
        {t("profile:hub.back")}
      </Link>

      <Card padding="md" className="flex flex-col gap-sm">
        <div className="flex flex-col gap-0.5">
          <h2 className="m-0 font-heading font-semibold text-h4 text-foreground">
            {t("profile:sections.security")}
          </h2>
          <p className="m-0 text-small text-foreground-muted">
            {t("profile:sections.securityHint")}
          </p>
        </div>
        <form
          onSubmit={handlePasswordSubmit(onChangePassword)}
          noValidate
          className="flex flex-col gap-sm"
        >
          <PasswordField
            id="currentPassword"
            label={t("profile:fields.currentPassword")}
            required
            autoComplete="current-password"
            error={passwordErrors.currentPassword?.message}
            {...registerPassword("currentPassword", {
              required: t("validation:password.requiredShort"),
            })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            {(() => {
              const reg = registerPassword(
                "password",
                buildPasswordValidation(t, () => passwordContext),
              );
              return (
                <PasswordField
                  id="password"
                  label={t("profile:fields.newPassword")}
                  required
                  autoComplete="new-password"
                  error={passwordErrors.password?.message}
                  {...reg}
                />
              );
            })()}
            <PasswordField
              id="confirmPassword"
              label={t("profile:fields.confirmPassword")}
              required
              autoComplete="new-password"
              error={
                passwordErrors.confirmPassword && !confirmPasswordValue
                  ? passwordErrors.confirmPassword.message
                  : undefined
              }
              {...registerPassword("confirmPassword", {
                required: t("validation:password.confirmNew"),
                validate: (v) => v === passwordValue || t("validation:password.mismatch"),
              })}
            />
          </div>
          <PasswordMatch password={passwordValue} confirm={confirmPasswordValue} />
          <PasswordRequirements password={passwordValue} context={passwordContext} />

          {passwordFeedback && (
            <div
              role="status"
              className={
                "rounded-md border px-md py-sm text-small " +
                (passwordFeedback.kind === "success"
                  ? "border-success/40 bg-success/10 text-foreground"
                  : "border-danger/40 bg-danger/10 text-danger")
              }
            >
              {passwordFeedback.message}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="primary"
              loading={savingPassword}
              className="w-full sm:w-auto"
            >
              {savingPassword
                ? t("profile:actions.changingPassword")
                : t("profile:actions.changePassword")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
