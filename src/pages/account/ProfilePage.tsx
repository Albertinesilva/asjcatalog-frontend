import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user-service";
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
import { Button, Card, Input } from "@/components/ui";
import { handleApiError } from "@/utils/api-error-handler";
import { buildPasswordValidation } from "@/utils/password";

type ProfileFields = {
  firstName: string;
  lastName: string;
  email: string;
};

type PasswordFields = {
  currentPassword: string;
  password: string;
  confirmPassword: string;
};

type Feedback = { kind: "success" | "error"; message: string } | null;

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, loading, refreshUser } = useAuth();
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  const profileForm = useForm<ProfileFields>({
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  const passwordForm = useForm<PasswordFields>({
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
      });
    }
  }, [user, profileForm]);

  if (loading && !user) {
    return <LoadingState message={t("profile:loading")} />;
  }

  if (!user) {
    return <ErrorState message={t("profile:loadError")} />;
  }

  const onSaveProfile = async (data: ProfileFields) => {
    setProfileFeedback(null);
    const emailChanged = data.email.trim() !== (user.email ?? "");
    try {
      await userService.updateAuthenticatedUser({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
      });
      await refreshUser();
      const message = emailChanged
        ? `${t("profile:successProfileMessage")} ${t("profile:emailChangeNotice")}`
        : t("profile:successProfileMessage");
      setProfileFeedback({ kind: "success", message });
      await alerts.success(t("profile:successProfileTitle"), message);
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
        setError: (name, error) => profileForm.setError(name as keyof ProfileFields, error),
        fallbackTitle: t("profile:failProfileTitle"),
        fallbackMessage: t("profile:failProfileMessage"),
      });
      if (!handled) {
        setProfileFeedback({
          kind: "error",
          message: getApiErrorMessage(err, t("profile:failProfileMessage")),
        });
      }
    }
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

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = profileForm;

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = passwordForm;

  const passwordValue = watchPassword("password") ?? "";
  const confirmPasswordValue = watchPassword("confirmPassword") ?? "";
  const passwordContext = {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
  };

  return (
    <div className="flex w-full max-w-3xl flex-col gap-md">
      <p className="text-small text-foreground-muted m-0">{t("profile:intro")}</p>

      <div className="flex flex-col gap-md">
        <Card padding="md" className="flex flex-col gap-sm">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 font-heading font-semibold text-h4 text-foreground">
              {t("profile:sections.personal")}
            </h2>
            <p className="m-0 text-small text-foreground-muted">{t("profile:sections.personalHint")}</p>
          </div>
          <form
            onSubmit={handleProfileSubmit(onSaveProfile)}
            noValidate
            className="flex flex-col gap-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
              <Input
                label={t("profile:fields.firstName")}
                id="firstName"
                required
                error={profileErrors.firstName?.message}
                {...registerProfile("firstName", {
                  required: t("validation:firstNameRequired"),
                  maxLength: { value: 100, message: t("validation:maxChars", { count: 100 }) },
                })}
              />
              <Input
                label={t("profile:fields.lastName")}
                id="lastName"
                required
                error={profileErrors.lastName?.message}
                {...registerProfile("lastName", {
                  required: t("validation:lastNameRequired"),
                  maxLength: { value: 100, message: t("validation:maxChars", { count: 100 }) },
                })}
              />
              <div className="sm:col-span-2">
                <Input
                  label={t("profile:fields.email")}
                  id="email"
                  type="email"
                  required
                  error={profileErrors.email?.message}
                  {...registerProfile("email", {
                    required: t("validation:emailRequired"),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t("validation:emailInvalid"),
                    },
                    maxLength: { value: 255, message: t("validation:maxChars", { count: 255 }) },
                  })}
                />
              </div>
            </div>

            {profileFeedback && (
              <div
                role="status"
                className={
                  "rounded-md border px-md py-sm text-small " +
                  (profileFeedback.kind === "success"
                    ? "border-success/40 bg-success/10 text-foreground"
                    : "border-danger/40 bg-danger/10 text-danger")
                }
              >
                {profileFeedback.message}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button type="submit" variant="primary" loading={savingProfile} className="w-full sm:w-auto">
                {savingProfile
                  ? t("profile:actions.savingProfile")
                  : t("profile:actions.saveProfile")}
              </Button>
            </div>
          </form>
        </Card>

        <Card padding="md" className="flex flex-col gap-sm">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 font-heading font-semibold text-h4 text-foreground">
              {t("profile:sections.security")}
            </h2>
            <p className="m-0 text-small text-foreground-muted">{t("profile:sections.securityHint")}</p>
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
            <PasswordRequirements password={passwordValue} context={passwordContext} />

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
            <PasswordMatch password={passwordValue} confirm={confirmPasswordValue} />

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

            <div className="pt-sm">
              <Button type="submit" variant="primary" loading={savingPassword}>
                {savingPassword
                  ? t("profile:actions.changingPassword")
                  : t("profile:actions.changePassword")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
