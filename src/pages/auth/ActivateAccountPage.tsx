import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { accountService } from "@/services/account-service";
import { Button, Card } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { getPendingEmail, removePendingEmail } from "@/utils/storage";
import { authFieldError, authFieldHint, authFormTitle } from "./_ui";

type Status = "loading" | "success" | "expired" | "invalid" | "already" | "missing" | "error";

export default function ActivateAccountPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
        const error = err as {
          response?: { status?: number; data?: { message?: string } };
        };
        const s = error.response?.status;
        const msg = error.response?.data?.message ?? null;
        setErrorMsg(msg);
        if (s === 410 || s === 400) setStatus("expired");
        else if (s === 409) setStatus("already");
        else if (s === 404 || s === 422) setStatus("invalid");
        else setStatus("error");
      }
    })();
  }, [token]);

  const resend = async () => {
    const email = getPendingEmail();
    if (!email) {
      await alerts.warning(
        "E-mail não encontrado",
        "Faça o cadastro novamente para receber um novo link.",
      );
      navigate("/auth/register");
      return;
    }
    try {
      alerts.loading("Reenviando...");
      await accountService.resendActivation(email);
      alerts.close();
      await alerts.success("Novo e-mail enviado!", `Verifique sua caixa de entrada (${email}).`);
      navigate("/activation-pending");
    } catch (err) {
      alerts.close();
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (error.response?.status === 429) {
        await alerts.warning(
          "Aguarde alguns instantes",
          error.response?.data?.message ?? "Você solicitou um novo e-mail recentemente.",
        );
      } else {
        await alerts.error(
          "Falha ao reenviar",
          error.response?.data?.message ?? "Tente novamente em instantes.",
        );
      }
    }
  };

  const hintCenter = `${authFieldHint} text-center`;

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
            <div className="flex gap-sm mt-sm">
              <Link to="/auth/login" className="flex-1">
                <Button type="button" variant="outline" size="lg" fullWidth>
                  Ir para login
                </Button>
              </Link>
              <Button type="button" size="lg" onClick={resend} className="flex-1">
                Reenviar novo e-mail
              </Button>
            </div>
          </>
        )}

        {status === "invalid" && (
          <>
            <h2 className={authFormTitle}>Link inválido</h2>
            <p className={hintCenter}>O link utilizado não é válido.</p>
            <div className="flex gap-sm mt-sm">
              <Link to="/auth/login" className="flex-1">
                <Button type="button" variant="outline" size="lg" fullWidth>
                  Ir para login
                </Button>
              </Link>
              <Button type="button" size="lg" onClick={resend} className="flex-1">
                Solicitar novo e-mail
              </Button>
            </div>
          </>
        )}

        {status === "already" && (
          <>
            <h2 className={authFormTitle}>Conta já ativada</h2>
            <p className={hintCenter}>Sua conta já está ativa. Você pode realizar login normalmente.</p>
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
            <div className="flex gap-sm mt-sm">
              <Link to="/auth/login" className="flex-1">
                <Button type="button" variant="outline" size="lg" fullWidth>
                  Ir para login
                </Button>
              </Link>
              <Button type="button" size="lg" onClick={resend} className="flex-1">
                Solicitar novo e-mail
              </Button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className={authFormTitle}>Falha na ativação</h2>
            <p className={authFieldError}>
              {errorMsg ?? "Não foi possível ativar sua conta no momento."}
            </p>
            <div className="flex gap-sm mt-sm">
              <Link to="/auth/login" className="flex-1">
                <Button type="button" variant="outline" size="lg" fullWidth>
                  Ir para login
                </Button>
              </Link>
              <Button type="button" size="lg" onClick={resend} className="flex-1">
                Reenviar e-mail
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
