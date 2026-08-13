import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { accountService } from "@/services/account-service";
import { ConfirmDialog } from "@/components";
import { Button, Card, Input } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { parseApiError } from "@/utils/api-error";
import {
  getPendingEmail,
  getResendCooldownRemainingMs,
  savePendingEmail,
  startResendCooldown,
} from "@/utils/storage";
import { authFieldError, authFieldHint, authFormTitle } from "./_ui";

type EmailFormFields = { email: string };

export default function ActivationPendingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(() => getPendingEmail());
  const [sending, setSending] = useState(false);
  const [remaining, setRemaining] = useState<number>(0);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const tickRef = useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EmailFormFields>({
    defaultValues: { email: email ?? "" },
  });

  const startCooldown = () => {
    startResendCooldown();
    setRemaining(Math.ceil(getResendCooldownRemainingMs() / 1000));
  };

  useEffect(() => {
    setRemaining(Math.ceil(getResendCooldownRemainingMs() / 1000));
    tickRef.current = window.setInterval(() => {
      setRemaining(Math.ceil(getResendCooldownRemainingMs() / 1000));
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const mapResendError = (err: unknown) => {
    const parsed = parseApiError(err);
    if (parsed.status === 429) {
      return {
        title: t("auth:activationPending.rateLimitTitle"),
        text: parsed.message || t("auth:activationPending.rateLimitDefault"),
      };
    }
    if (parsed.status && parsed.status >= 500) {
      return {
        title: t("auth:activationPending.unavailableTitle"),
        text: t("auth:activationPending.unavailableMessage"),
      };
    }
    if (!parsed.status) {
      return {
        title: t("auth:activationPending.networkTitle"),
        text: t("auth:activationPending.networkMessage"),
      };
    }
    return {
      title: t("auth:activationPending.errorTitle"),
      text: parsed.message || t("auth:activationPending.errorMessage"),
    };
  };

  const doResend = async (targetEmail: string, isNewEmail = false) => {
    if (sending || remaining > 0) return;
    try {
      setSending(true);
      await accountService.resendActivation(targetEmail);
      if (isNewEmail) {
        savePendingEmail(targetEmail);
        setEmail(targetEmail);
        setValue("email", targetEmail);
      }
      startCooldown();
      await alerts.success(
        t("auth:activationPending.successTitle"),
        t("auth:activationPending.successMessage"),
      );
    } catch (err) {
      const info = mapResendError(err);
      if (parseApiError(err).status === 429) {
        startCooldown();
        await alerts.warning(info.title, info.text);
      } else {
        await alerts.error(info.title, info.text);
      }
    } finally {
      setSending(false);
    }
  };

  const onSubmitEmail = handleSubmit(async (data) => {
    const isNew = data.email !== email;
    await doResend(data.email, isNew);
  });

  const cooldownUrgent = remaining > 0 && remaining <= 10;

  const submitLabel = email
    ? sending
      ? t("auth:activationPending.resending")
      : remaining > 0
        ? t("auth:activationPending.resendIn", { seconds: remaining })
        : t("auth:activationPending.resendEmail")
    : sending
      ? t("auth:activationPending.sending")
      : remaining > 0
        ? t("auth:activationPending.waitSeconds", { seconds: remaining })
        : t("auth:activationPending.sendNew");

  return (
    <>
      <Card padding="lg" elevated bordered className="w-full max-w-[440px]">
        <form className="flex flex-col gap-md" onSubmit={onSubmitEmail} noValidate>
          <div className="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
              aria-hidden
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          {email ? (
            <>
              <h2 className={authFormTitle}>{t("auth:activationPending.titleWithEmail")}</h2>
              <p className={`${authFieldHint} text-center`}>
                {t("auth:activationPending.hintWithEmail")}
              </p>
            </>
          ) : (
            <>
              <h2 className={authFormTitle}>{t("auth:activationPending.titleNoEmail")}</h2>
              <p className={`${authFieldHint} text-center`}>
                {t("auth:activationPending.hintNoEmail")}
              </p>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="activation-email" className="sr-only">
              {t("auth:activationPending.emailLabel")}
            </label>
            <Input
              id="activation-email"
              type="email"
              autoComplete="email"
              placeholder={t("auth:activationPending.emailPlaceholder")}
              aria-label={t("auth:activationPending.emailAria")}
              aria-describedby="resend-cooldown-hint"
              disabled={sending}
              error={
                errors.email?.type === "required"
                  ? t("auth:activationPending.emailRequired")
                  : errors.email?.type === "pattern"
                    ? t("auth:activationPending.emailInvalid")
                    : undefined
              }
              {...register("email", {
                required: true,
                pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
              })}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-sm">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowLeaveModal(true)}
              disabled={sending}
              className="flex-1 min-w-0 px-4"
            >
              {t("auth:activationPending.goToLogin")}
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={sending || remaining > 0}
              loading={sending}
              className="flex-1 min-w-0 px-4"
            >
              {submitLabel}
            </Button>
          </div>

          <p
            id="resend-cooldown-hint"
            aria-live="polite"
            className={`text-center text-small m-0 min-h-[1.25rem] ${
              cooldownUrgent ? "text-danger font-semibold" : "text-foreground-muted"
            }`}
          >
            {remaining > 0
              ? t("auth:activationPending.cooldownHint", { count: remaining })
              : "\u00A0"}
          </p>
        </form>
      </Card>

      <ConfirmDialog
        open={showLeaveModal}
        title={t("auth:activationPending.leaveTitle")}
        description={<p className="m-0">{t("auth:activationPending.leaveDescription")}</p>}
        cancelLabel={t("auth:activationPending.leaveCancel")}
        confirmLabel={t("auth:activationPending.leaveConfirm")}
        variant="primary"
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => {
          setShowLeaveModal(false);
          navigate("/auth/login");
        }}
      />
    </>
  );
}
