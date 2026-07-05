import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { accountService } from "@/services/account-service";
import { Button, Card } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { getPendingEmail } from "@/utils/storage";
import { authFieldHint, authFormTitle } from "./_ui";

const COOLDOWN_KEY = "activationResendAvailableAt";
const COOLDOWN_MS = 60_000;

export default function ActivationPendingPage() {
  const navigate = useNavigate();
  const email = getPendingEmail();
  const [sending, setSending] = useState(false);
  const [remaining, setRemaining] = useState<number>(0);
  const tickRef = useRef<number | null>(null);

  const startCooldown = (ms: number = COOLDOWN_MS) => {
    const until = Date.now() + ms;
    window.localStorage.setItem(COOLDOWN_KEY, String(until));
    setRemaining(Math.ceil(ms / 1000));
  };

  useEffect(() => {
    const raw = window.localStorage.getItem(COOLDOWN_KEY);
    if (raw) {
      const diff = Number(raw) - Date.now();
      if (diff > 0) setRemaining(Math.ceil(diff / 1000));
      else window.localStorage.removeItem(COOLDOWN_KEY);
    }
    tickRef.current = window.setInterval(() => {
      const r = window.localStorage.getItem(COOLDOWN_KEY);
      if (!r) {
        setRemaining(0);
        return;
      }
      const diff = Number(r) - Date.now();
      if (diff <= 0) {
        window.localStorage.removeItem(COOLDOWN_KEY);
        setRemaining(0);
      } else {
        setRemaining(Math.ceil(diff / 1000));
      }
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const handleResend = async () => {
    if (sending || remaining > 0) return;
    if (!email) {
      await alerts.warning(
        "E-mail não encontrado",
        "Faça o cadastro novamente para reenviar a ativação.",
      );
      navigate("/auth/register");
      return;
    }
    try {
      setSending(true);
      alerts.loading("Reenviando...");
      await accountService.resendActivation(email);
      alerts.close();
      startCooldown();
      await alerts.success(
        "E-mail enviado",
        "Um novo link de ativação foi enviado para seu e-mail.",
      );
    } catch (err) {
      alerts.close();
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (error.response?.status === 429) {
        startCooldown();
        await alerts.warning(
          "Aguarde um momento",
          error.response?.data?.message ??
            "Você solicitou um novo e-mail recentemente. Tente novamente em alguns instantes.",
        );
      } else {
        await alerts.error(
          "Erro ao reenviar",
          error.response?.data?.message ??
            "Não foi possível reenviar o e-mail de ativação. Tente novamente mais tarde.",
        );
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Card padding="lg" elevated bordered className="w-full max-w-[440px]">
      <div className="flex flex-col gap-md">
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

        <h2 className={authFormTitle}>Ative sua conta</h2>

        <p className={`${authFieldHint} text-center`}>Enviamos um e-mail de ativação para:</p>
        <p className="text-center text-body font-semibold text-foreground m-0 -mt-xs mb-sm">
          {email ?? "(e-mail não informado)"}
        </p>
        <p className={`${authFieldHint} text-center`}>
          Acesse sua caixa de entrada e clique no link de ativação enviado.
        </p>
        <p className={`${authFieldHint} text-center`}>
          Caso não encontre o e-mail, verifique também sua pasta de spam.
        </p>

        <div className="flex gap-sm mt-sm">
          <Link to="/auth/login" className="flex-1">
            <Button type="button" variant="outline" size="lg" fullWidth>
              Ir para login
            </Button>
          </Link>
          <Button
            type="button"
            size="lg"
            onClick={handleResend}
            disabled={sending || remaining > 0}
            loading={sending}
            className="flex-1"
          >
            {sending
              ? "Reenviando..."
              : remaining > 0
                ? `Reenviar em ${remaining}s`
                : "Reenviar e-mail"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
