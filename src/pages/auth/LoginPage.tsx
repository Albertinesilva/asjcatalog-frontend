import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog, PasswordField } from "@/components";
import { Button, Card, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { alerts } from "@/utils/alerts";
import { parseApiError } from "@/utils/api-error";
import { getApiErrorCode, handleApiError } from "@/utils/api-error-handler";
import { getUiErrorMessage } from "@/utils/ui-error";
import { authFieldError, authFormTitle } from "./_ui";

type AuthFormFields = { username: string; password: string };

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated, login } = useAuth();
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [inactiveAccount, setInactiveAccount] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormFields>();

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  useEffect(() => {
    if (authenticated) navigate(redirectTo, { replace: true });
  }, [authenticated, navigate, redirectTo]);

  const onSubmit = async (data: AuthFormFields) => {
    try {
      setInactiveAccount(false);
      await login(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const code = getApiErrorCode(err);
      if (code === "ACCESS_DISABLED") {
        setInactiveAccount(true);
        setError("root", { message: t("auth:login.inactive.error") });
        return;
      }
      // OAuth2 password grant: credenciais inválidas retornam `error=invalid_grant`
      // sem o contrato próprio da aplicação (sem `code`/`message`), então
      // precisam ser reconhecidas aqui antes de cair no tratamento genérico.
      const parsed = parseApiError(err);
      if (parsed.error === "invalid_grant") {
        setError("root", { message: t("auth:login.invalid") });
        return;
      }
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof AuthFormFields, error),
        fallbackTitle: t("auth:login.failTitle"),
        fallbackMessage: t("auth:login.failMessage"),
      });
      if (!handled) {
        // Sem resposta HTTP (rede/timeout): não é falha de credenciais.
        const message = getUiErrorMessage(err, t("auth:login.failMessage"));
        setError("root", { message });
        await alerts.error(t("auth:login.failTitle"), message);
      }
    }
  };

  return (
    <Card padding="lg" elevated bordered className="w-full max-w-form">
      <form className="flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className={authFormTitle}>{t("auth:login.title")}</h2>

        <Input
          type="email"
          autoComplete="email"
          placeholder={t("auth:login.emailPlaceholder")}
          aria-label={t("auth:login.emailPlaceholder")}
          error={errors.username?.message}
          {...register("username", {
            required: t("validation:email.required"),
            pattern: {
              value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: t("validation:emailInvalid"),
            },
          })}
        />

        <PasswordField
          placeholder={t("auth:login.passwordPlaceholder")}
          autoComplete="current-password"
          aria-label={t("auth:login.passwordPlaceholder")}
          error={errors.password?.message}
          {...register("password", { required: t("validation:password.required") })}
        />

        <div className="flex flex-col gap-xs items-start">
          <Link
            to="/auth/recover"
            className="text-small font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {t("auth:login.forgot")}
          </Link>
          <button
            type="button"
            onClick={() => setShowActivationModal(true)}
            className="text-small font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm bg-transparent p-0"
          >
            {t("auth:login.resend")}
          </button>
        </div>

        {errors.root && (
          <p className={authFieldError} role="alert">
            {errors.root.message}
          </p>
        )}
        {inactiveAccount && (
          <Card padding="md" bordered className="bg-surface-hover">
            <div className="flex flex-col gap-sm">
              <h3 className="font-heading text-title text-foreground m-0">
                {t("auth:login.inactive.title")}
              </h3>
              <p className="text-small text-foreground-muted m-0">
                {t("auth:login.inactive.description")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => setShowActivationModal(true)}
              >
                {t("auth:login.inactive.resend")}
              </Button>
            </div>
          </Card>
        )}

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? t("auth:login.submitting") : t("auth:login.submit")}
        </Button>

        <p className="text-center text-small text-foreground-muted m-0">
          {t("auth:login.noAccount")}{" "}
          <Link
            to="/auth/register"
            className="font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {t("auth:login.register")}
          </Link>
        </p>
      </form>

      <ConfirmDialog
        open={showActivationModal}
        title={t("auth:login.activateModal.title")}
        description={
          <>
            <p className="m-0 mb-sm">{t("auth:login.activateModal.line1")}</p>
            <p className="m-0 mb-sm">{t("auth:login.activateModal.line2")}</p>
            <p className="m-0 text-small text-foreground-muted">
              {t("auth:login.activateModal.line3")}
            </p>
          </>
        }
        cancelLabel={t("common:actions.cancel")}
        confirmLabel={t("common:actions.continue")}
        variant="primary"
        onCancel={() => setShowActivationModal(false)}
        onConfirm={() => {
          setShowActivationModal(false);
          navigate("/auth/activation-pending");
        }}
      />
    </Card>
  );
}
