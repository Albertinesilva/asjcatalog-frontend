import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user-service";
import {
  LoadingState,
  ErrorState,
  PasswordField,
  PasswordMatch,
  PasswordRequirements,
} from "@/components";
import { getApiErrorMessage } from "@/utils/api-error";
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
    defaultValues: { password: "", confirmPassword: "" },
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

  const currentRoleIds = (user.roles ?? []).map((r) => r.id);

  const onSaveProfile = async (data: ProfileFields) => {
    setProfileFeedback(null);
    try {
      await userService.update(user.id, {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        roleIds: currentRoleIds,
      });
      await refreshUser();
      setProfileFeedback({ kind: "success", message: t("profile:successProfileMessage") });
      await alerts.success(t("profile:successProfileTitle"), t("profile:successProfileMessage"));
    } catch (err) {
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
      await userService.update(user.id, {
        password: data.password,
        roleIds: currentRoleIds,
      });
      passwordForm.reset({ password: "", confirmPassword: "" });
      setPasswordFeedback({ kind: "success", message: t("profile:successPasswordMessage") });
      await alerts.success(t("profile:successPasswordTitle"), t("profile:successPasswordMessage"));
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) =>
          passwordForm.setError(name as keyof PasswordFields, error),
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

  return (
    <div className="flex flex-col gap-lg">
      <p className="text-body text-foreground-muted m-0">
        {t("profile:intro")}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <Card padding="lg" className="lg:col-span-7 flex flex-col gap-md">
          <h2 className="m-0 font-heading font-bold text-h3 text-foreground">
            {t("profile:sections.personal")}
          </h2>
          <form
            onSubmit={handleProfileSubmit(onSaveProfile)}
            noValidate
            className="flex flex-col gap-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
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
            </div>
            <Input
              label={t("profile:fields.email")}
              id="email"
              type="email"
              required
              error={profileErrors.email?.message}
              {...registerProfile("email", {
                required: t("validation:emailRequired"),
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("validation:emailInvalid") },
                maxLength: { value: 255, message: t("validation:maxChars", { count: 255 }) },
              })}
            />

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

            <div className="pt-sm">
              <Button type="submit" variant="primary" loading={savingProfile}>
                {savingProfile ? t("profile:actions.savingProfile") : t("profile:actions.saveProfile")}
              </Button>
            </div>
          </form>
        </Card>

        <Card padding="lg" className="lg:col-span-5 flex flex-col gap-md">
          <h2 className="m-0 font-heading font-bold text-h3 text-foreground">
            {t("profile:sections.password")}
          </h2>
          <form
            onSubmit={handlePasswordSubmit(onChangePassword)}
            noValidate
            className="flex flex-col gap-md"
          >
            {(() => {
              const reg = registerPassword("password", buildPasswordValidation(t));
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
            <PasswordRequirements password={passwordValue} />

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
                {savingPassword ? t("profile:actions.changingPassword") : t("profile:actions.changePassword")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
