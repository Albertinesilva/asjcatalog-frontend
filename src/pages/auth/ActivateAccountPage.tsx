import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { accountService } from "@/services/account-service";
import { Button, Card } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { getPendingEmail, removePendingEmail } from "@/utils/storage";
import { authFieldError, authFieldHint, authFormTitle } from "./_ui";
import { parseApiError } from "@/utils/api-error";

type Status = "loading" | "success" | "expired" | "invalid" | "already" | "missing" | "error";

export default function ActivateAccountPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus("missing");
      return;
    }

    (async () => {
      try {
        await accountService.activate(token);
        removePendingEmail();
        setStatus("success");
      } catch (err) {
        const parsed = parseApiError(err);
        setErrorMsg(parsed.message || null);
        switch (parsed.code) {
          case "INVALID_TOKEN":
            setStatus("expired");
            break;
          case "CONFLICT":
            setStatus("already");
            break;
          case "RESOURCE_NOT_FOUND":
          case "VALIDATION_ERROR":
            setStatus("invalid");
            break;
          default:
            setStatus("error");
        }
      }
    })();
  }, [token]);

  const resend = async () => {
    const email = getPendingEmail();
    if (!email) {
      await alerts.warning(
        t("auth:activate.noPendingTitle"),
        t("auth:activate.noPendingMessage"),
      );
      navigate("/auth/activation-pending");
      return;
    }
    if (resending) return;
    try {
      setResending(true);
      await accountService.resendActivation(email);
      await alerts.success(
        t("auth:activate.resendEmailSentTitle"),
        t("auth:activate.resendEmailSentMessage", { email }),
      );
      navigate("/auth/activation-pending");
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.status === 429) {
        await alerts.warning(
          t("auth:activate.resendCooldownTitle"),
          parsed.message || t("auth:activate.resendCooldownDefault"),
        );
      } else {
        await alerts.error(
          t("auth:activate.resendFailTitle"),
          parsed.message || t("auth:activate.resendFailDefault"),
        );
      }
    } finally {
      setResending(false);
    }
  };

  const hintCenter = `${authFieldHint} text-center`;

  const renderActions = (resendLabel: string): ReactNode => (
    <div className="flex flex-col sm:flex-row gap-sm mt-sm">
      <Link to="/auth/login" className="flex-1 min-w-0">
        <Button type="button" variant="outline" size="lg" fullWidth disabled={resending}>
          {t("auth:activate.goToLogin")}
        </Button>
      </Link>
      <Button
        type="button"
        size="lg"
        onClick={resend}
        loading={resending}
        disabled={resending}
        className="flex-1 min-w-0 px-4"
      >
        {resendLabel}
      </Button>
    </div>
  );

  return (
    <Card padding="lg" elevated bordered className="w-full max-w-[440px]">
      <div className="flex flex-col gap-md">
        {status === "loading" && (
          <>
            <h2 className={authFormTitle}>{t("auth:activate.loadingTitle")}</h2>
            <p className={hintCenter}>{t("auth:activate.loadingHint")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className={authFormTitle}>{t("auth:activate.successTitle")}</h2>
            <p className={hintCenter}>{t("auth:activate.successHint")}</p>
            <Link to="/auth/login" className="w-full">
              <Button type="button" size="lg" fullWidth>
                {t("auth:activate.goToLogin")}
              </Button>
            </Link>
          </>
        )}

        {status === "expired" && (
          <>
            <h2 className={authFormTitle}>{t("auth:activate.expiredTitle")}</h2>
            <p className={hintCenter}>{errorMsg ?? t("auth:activate.expiredDefault")}</p>
            {renderActions(t("auth:activate.resendEmail"))}
          </>
        )}

        {status === "invalid" && (
          <>
            <h2 className={authFormTitle}>{t("auth:activate.invalidTitle")}</h2>
            <p className={hintCenter}>{t("auth:activate.invalidHint")}</p>
            {renderActions(t("auth:activate.requestNewEmail"))}
          </>
        )}

        {status === "already" && (
          <>
            <h2 className={authFormTitle}>{t("auth:activate.alreadyTitle")}</h2>
            <p className={hintCenter}>{t("auth:activate.alreadyHint")}</p>
            <Link to="/auth/login" className="w-full">
              <Button type="button" size="lg" fullWidth>
                {t("auth:activate.goToLogin")}
              </Button>
            </Link>
          </>
        )}

        {status === "missing" && (
          <>
            <h2 className={authFormTitle}>{t("auth:activate.missingTitle")}</h2>
            <p className={authFieldError}>{t("auth:activate.missingHint")}</p>
            {renderActions(t("auth:activate.requestNewEmail"))}
          </>
        )}

        {status === "error" && (
          <>
            <h2 className={authFormTitle}>{t("auth:activate.errorTitle")}</h2>
            <p className={authFieldError}>
              {errorMsg ?? t("auth:activate.errorDefault")}
            </p>
            {renderActions(t("auth:activate.resendEmail"))}
          </>
        )}
      </div>
    </Card>
  );
}
