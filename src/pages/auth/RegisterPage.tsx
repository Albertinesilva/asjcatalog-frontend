import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { accountService } from "@/services/account-service";
import { PasswordField, PasswordMatch, PasswordRequirements } from "@/components";
import { Button, Card, inputBaseClasses } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { savePendingEmail, startResendCooldown } from "@/utils/storage";
import { handleApiError } from "@/utils/api-error-handler";
import { buildPasswordValidation } from "@/utils/password";
import { authFieldError, authFormTitle } from "./_ui";

type RegisterFormFields = {
  firstName: string; lastName: string; email: string; password: string; passwordConfirm: string;
};

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } =
    useForm<RegisterFormFields>();
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

  const onSubmit = async (data: RegisterFormFields) => {
    try {
      await accountService.register({
        firstName: data.firstName, lastName: data.lastName,
        email: data.email, password: data.password,
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
      if (!handled) await alerts.error(t("auth:register.failTitle"), t("auth:register.failMessage"));
    }
  };

  return (
    <Card padding="lg" elevated bordered className="w-full max-w-[440px]">
      <form className="flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className={authFormTitle}>{t("auth:register.title")}</h2>

        <div className="flex flex-col gap-1.5">
          <input type="text" autoComplete="given-name" className={inputBaseClasses}
            placeholder={t("auth:register.firstName")} aria-label={t("auth:register.firstName")}
            {...register("firstName", {
              required: t("validation:firstNameRequired"),
              maxLength: { value: 80, message: t("validation:maxChars", { count: 80 }) },
            })} />
          {errors.firstName?.message && (<p className={authFieldError}>{errors.firstName.message}</p>)}
        </div>

        <div className="flex flex-col gap-1.5">
          <input type="text" autoComplete="family-name" className={inputBaseClasses}
            placeholder={t("auth:register.lastName")} aria-label={t("auth:register.lastName")}
            {...register("lastName", {
              required: t("validation:lastNameRequired"),
              maxLength: { value: 80, message: t("validation:maxChars", { count: 80 }) },
            })} />
          {errors.lastName?.message && (<p className={authFieldError}>{errors.lastName.message}</p>)}
        </div>

        <div className="flex flex-col gap-1.5">
          <input type="email" autoComplete="email" className={inputBaseClasses}
            placeholder={t("auth:register.email")} aria-label={t("auth:register.email")}
            {...register("email", {
              required: t("validation:email.requiredShort"),
              pattern: { value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, message: t("validation:emailInvalid") },
            })} />
          {errors.email?.message && (<p className={authFieldError}>{errors.email.message}</p>)}
        </div>

        <div className="flex flex-col gap-sm">
          {(() => {
            const reg = register("password", {
              ...buildPasswordValidation(t, () => passwordContext),
              onBlur: () => { if (passwordValue.length === 0) setRequirementsOpen(false); },
            });
            return (
              <PasswordField placeholder={t("auth:register.password")}
                autoComplete="new-password" aria-label={t("auth:register.password")}
                {...reg} onFocus={() => setRequirementsOpen(true)} />
            );
          })()}
          {errors.password?.message && (<p className={authFieldError}>{errors.password.message}</p>)}
          <PasswordRequirements password={passwordValue} collapsible
            open={requirementsOpen} onOpenChange={setRequirementsOpen}
            context={passwordContext} />
        </div>

        <div className="flex flex-col gap-1.5">
          <PasswordField placeholder={t("auth:register.confirm")}
            autoComplete="new-password" aria-label={t("auth:register.confirmAria")}
            {...register("passwordConfirm", {
              required: t("validation:password.confirm"),
              validate: (value) => value === passwordValue || t("validation:password.mismatch"),
            })} />
          <PasswordMatch password={passwordValue} confirm={confirmValue} />
          {errors.passwordConfirm?.message && !confirmValue && (
            <p className={authFieldError}>{errors.passwordConfirm.message}</p>
          )}
          {errors.passwordConfirm?.type === "server" && confirmValue && (
            <p className={authFieldError}>{errors.passwordConfirm.message}</p>
          )}
        </div>

        <div className="flex gap-sm mt-sm">
          <Link to="/auth/login" className="flex-1">
            <Button type="button" variant="outline" size="lg" fullWidth>{t("auth:register.cancel")}</Button>
          </Link>
          <Button type="submit" size="lg" loading={isSubmitting} className="flex-1">
            {isSubmitting ? t("auth:register.submitting") : t("auth:register.submit")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
