import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user-service";
import { LoadingState, ErrorState } from "@/components";
import { getUiErrorMessage } from "@/utils/ui-error";
import { alerts } from "@/utils/alerts";
import { Button, Card, Input } from "@/components/ui";
import { handleApiError } from "@/utils/api-error-handler";
import personalImage from "@/assets/account/profile-personal.jpg";

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
  const [retrying, setRetrying] = useState(false);

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

  if ((loading && !user) || retrying) {
    return <LoadingState message={t("profile:loading")} />;
  }

  if (!user) {
    return (
      <ErrorState
        message={t("profile:loadError")}
        onRetry={() => {
          setRetrying(true);
          void refreshUser().finally(() => setRetrying(false));
        }}
      />
    );
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
          message: getUiErrorMessage(err, t("profile:failProfileMessage")),
        });
      }
    }
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-md">
      <Link
        to="/account/profile"
        className="inline-flex min-h-6 items-center gap-xs self-start text-small text-foreground-muted transition-colors ease-standard hover:text-accent focus-visible:outline-none focus-visible:text-accent"
      >
        <span aria-hidden>&larr;</span>
        {t("profile:hub.back")}
      </Link>

      <Card
        padding="md"
        className="grid grid-cols-1 gap-md lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
      >
        <div className="order-1 overflow-hidden rounded-md bg-surface-hover lg:h-full">
          <img
            src={personalImage}
            alt={t("profile:hub.personalImageAlt")}
            loading="lazy"
            width={1200}
            height={800}
            className="h-40 w-full object-cover sm:h-56 lg:h-full lg:min-h-[320px]"
          />
        </div>
        <div className="order-2 flex min-w-0 flex-col gap-sm">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 font-heading text-title text-foreground">
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
        </div>
      </Card>
    </div>
  );
}
