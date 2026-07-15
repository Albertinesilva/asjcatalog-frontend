import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { accountService } from "@/services/account-service";
import { Button, Card } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { getPendingEmail, removePendingEmail } from "@/utils/storage";
import { authFieldError, authFieldHint, authFormTitle } from "./_ui";
import { parseApiError } from "@/utils/api-error";

type Status = "loading" | "success" | "expired" | "invalid" | "already" | "missing" | "error";

export default function ActivateAccountPage() {
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
        "E-mail não encontrado",
        "Não encontramos um cadastro pendente neste dispositivo. Informe seu e-mail para solicitar um novo link.",
      );
      navigate("/auth/activation-pending");
      return;
    }
    if (resending) return;
    try {
      setResending(true);
      await accountService.resendActivation(email);
      await alerts.success("Novo e-mail enviado!", `Verifique sua caixa de entrada (${email}).`);
      navigate("/auth/activation-pending");
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.status === 429) {
        await alerts.warning(
          "Aguarde alguns instantes",
          parsed.message || "Você solicitou um novo e-mail recentemente.",
        );
      } else {
        await alerts.error(
          "Falha ao reenviar",
          parsed.message || "Tente novamente em instantes.",
        );
      }
    } finally {
      setResending(false);
    }
  };

  const hintCenter = `${authFieldHint} text-center`;

  const renderActions = (resendLabel: string): ReactNode => (
    <div className="flex gap-sm mt-sm">
      <Link to="/auth/login" className="flex-1">
        <Button type="button" variant="outline" size="lg" fullWidth disabled={resending}>
          Ir para login
        </Button>
      </Link>
      <Button
        type="button"
        size="lg"
        onClick={resend}
        loading={resending}
        disabled={resending}
        className="flex-1"
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
            <h2 className={authFormTitle}>Ativando sua conta</h2>
            <p className={hintCenter}>Validando seu token, aguarde...</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className={authFormTitle}>Conta ativada com sucesso</h2>
            <p className={hintCenter}>Sua conta foi ativada. Agora você pode realizar login.</p>
            <Link to="/auth/login" className="w-full">
              <Button type="button" size="lg" fullWidth>
                Ir para login
              </Button>
            </Link>
          </>
        )}

        {status === "expired" && (
          <>
            <h2 className={authFormTitle}>Link expirado</h2>
            <p className={hintCenter}>{errorMsg ?? "O link de ativação expirou."}</p>
            {renderActions("Reenviar e-mail")}
          </>
        )}

        {status === "invalid" && (
          <>
            <h2 className={authFormTitle}>Link inválido</h2>
            <p className={hintCenter}>O link utilizado não é válido.</p>
            {renderActions("Solicitar novo e-mail")}
          </>
        )}

        {status === "already" && (
          <>
            <h2 className={authFormTitle}>Conta já ativada</h2>
            <p className={hintCenter}>
              Sua conta já está ativa. Você pode realizar login normalmente.
            </p>
            <Link to="/auth/login" className="w-full">
              <Button type="button" size="lg" fullWidth>
                Ir para login
              </Button>
            </Link>
          </>
        )}

        {status === "missing" && (
          <>
            <h2 className={authFormTitle}>Link inválido</h2>
            <p className={authFieldError}>Link de ativação inválido: token não informado.</p>
            {renderActions("Solicitar novo e-mail")}
          </>
        )}

        {status === "error" && (
          <>
            <h2 className={authFormTitle}>Falha na ativação</h2>
            <p className={authFieldError}>
              {errorMsg ?? "Não foi possível ativar sua conta no momento."}
            </p>
            {renderActions("Reenviar e-mail")}
          </>
        )}
      </div>
    </Card>
  );
}
