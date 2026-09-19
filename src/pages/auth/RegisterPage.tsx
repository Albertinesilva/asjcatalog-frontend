import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { accountService } from "@/services/account-service";
import { PasswordField, PasswordMatch, PasswordRequirements } from "@/components";
import { Button, Card, Input } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { savePendingEmail, startResendCooldown } from "@/utils/storage";
import { handleApiError } from "@/utils/api-error-handler";
import { buildPasswordValidation } from "@/utils/password";
import { authFormTitle } from "./_ui";

type RegisterFormFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormFields>();
  const passwordValue = watch("password") ?? "";
  const confirmValue = watch("passwordConfirm") ?? "";
  const firstNameValue = watch("firstName") ?? "";
  const lastNameValue = watch("lastName") ?? "";
  const emailValue = watch("email") ?? "";
  const passwordContext = {
    firstName: firstNameValue,
    lastName: lastNameValue,
    email: emailValue,
  };
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  // A mensagem só aparece no campo quando está vazio (obrigatório) ou vem do servidor;
  // a divergência entre as senhas é comunicada em tempo real por <PasswordMatch>.
  const confirmError =
    errors.passwordConfirm?.message && (!confirmValue || errors.passwordConfirm.type === "server")
      ? errors.passwordConfirm.message
      : undefined;

  const onSubmit = async (data: RegisterFormFields) => {
    try {
      await accountService.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      savePendingEmail(data.email);
      startResendCooldown();
      await alerts.success(
        t("auth:register.successTitle"),
        t("auth:register.successMessage", { email: data.email }),
      );
      navigate("/auth/activation-pending");
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof RegisterFormFields, error),
        fallbackTitle: t("auth:register.failTitle"),
        fallbackMessage: t("auth:register.failMessage"),
      });
      if (!handled)
        await alerts.error(t("auth:register.failTitle"), t("auth:register.failMessage"));
    }
  };

  return (
    <Card padding="lg" elevated bordered className="w-full max-w-[440px]">
      <form className="flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className={authFormTitle}>{t("auth:register.title")}</h2>

        <Input
          type="text"
          autoComplete="given-name"
          placeholder={t("auth:register.firstName")}
          aria-label={t("auth:register.firstName")}
          error={errors.firstName?.message}
          {...register("firstName", {
            required: t("validation:firstNameRequired"),
            maxLength: { value: 80, message: t("validation:maxChars", { count: 80 }) },
          })}
        />

        <Input
          type="text"
          autoComplete="family-name"
          placeholder={t("auth:register.lastName")}
          aria-label={t("auth:register.lastName")}
          error={errors.lastName?.message}
          {...register("lastName", {
            required: t("validation:lastNameRequired"),
            maxLength: { value: 80, message: t("validation:maxChars", { count: 80 }) },
          })}
        />

        <Input
          type="email"
          autoComplete="email"
          placeholder={t("auth:register.email")}
          aria-label={t("auth:register.email")}
          error={errors.email?.message}
          {...register("email", {
            required: t("validation:email.requiredShort"),
            pattern: {
              value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: t("validation:emailInvalid"),
            },
          })}
        />

        <div className="flex flex-col gap-sm">
          {(() => {
            const reg = register("password", {
              ...buildPasswordValidation(t, () => passwordContext),
              onBlur: () => {
                if (passwordValue.length === 0) setRequirementsOpen(false);
              },
            });
            return (
              <PasswordField
                placeholder={t("auth:register.password")}
                autoComplete="new-password"
                aria-label={t("auth:register.password")}
                error={errors.password?.message}
                {...reg}
                onFocus={() => setRequirementsOpen(true)}
              />
            );
          })()}
          <PasswordRequirements
            password={passwordValue}
            collapsible
            open={requirementsOpen}
            onOpenChange={setRequirementsOpen}
            context={passwordContext}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <PasswordField
            placeholder={t("auth:register.confirm")}
            autoComplete="new-password"
            aria-label={t("auth:register.confirmAria")}
            error={confirmError}
            {...register("passwordConfirm", {
              required: t("validation:password.confirm"),
              validate: (value) => value === passwordValue || t("validation:password.mismatch"),
            })}
          />
          <PasswordMatch password={passwordValue} confirm={confirmValue} />
        </div>

        <div className="flex gap-sm mt-sm">
          <Link to="/auth/login" className="flex-1">
            <Button type="button" variant="outline" size="lg" fullWidth>
              {t("auth:register.cancel")}
            </Button>
          </Link>
          <Button type="submit" size="lg" loading={isSubmitting} className="flex-1">
            {isSubmitting ? t("auth:register.submitting") : t("auth:register.submit")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
