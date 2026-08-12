import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user-service";
import { LoadingState, ErrorState } from "@/components";
import { getApiErrorMessage } from "@/utils/api-error";
import { alerts } from "@/utils/alerts";
import { Button, Card, Input } from "@/components/ui";
import { handleApiError } from "@/utils/api-error-handler";

type ProfileFields = {
  firstName: string;
  lastName: string;
  email: string;
};

type Feedback = { kind: "success" | "error"; message: string } | null;

/**
 * PersonalProfilePage — /account/profile/personal.
 * Formulário de dados pessoais extraído da antiga ProfilePage,
 * sem alteração de regras de negócio, serviços ou contratos de API.
 */
export default function PersonalProfilePage() {
  const { t } = useTranslation();
  const { user, loading, refreshUser } = useAuth();
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);

  const profileForm = useForm<ProfileFields>({
    defaultValues: { firstName: "", lastName: "", email: "" },
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

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = profileForm;

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
            {t("profile:sections.personal")}
          </h2>
          <p className="m-0 text-small text-foreground-muted">
            {t("profile:sections.personalHint")}
          </p>
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
            <Button
              type="submit"
              variant="primary"
              loading={savingProfile}
              className="w-full sm:w-auto"
            >
              {savingProfile
                ? t("profile:actions.savingProfile")
                : t("profile:actions.saveProfile")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
