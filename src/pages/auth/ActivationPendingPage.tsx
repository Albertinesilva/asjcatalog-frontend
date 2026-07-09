import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { accountService } from "@/services/account-service";
import { ConfirmDialog } from "@/components";
import { Button, Card, inputBaseClasses } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { getPendingEmail, savePendingEmail } from "@/utils/storage";
import { authFieldError, authFieldHint, authFormTitle } from "./_ui";

const COOLDOWN_KEY = "activationResendAvailableAt";
const COOLDOWN_MS = 60_000;

type EmailFormFields = { email: string };

export default function ActivationPendingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(() => getPendingEmail());
  const [sending, setSending] = useState(false);
  const [remaining, setRemaining] = useState<number>(0);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const tickRef = useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormFields>();

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

  const doResend = async (targetEmail: string, isNewEmail = false) => {
    if (sending || remaining > 0) return;
    try {
      setSending(true);
      alerts.loading("Reenviando...");
      await accountService.resendActivation(targetEmail);
      alerts.close();
      if (isNewEmail) {
        savePendingEmail(targetEmail);
        setEmail(targetEmail);
      }
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

  const handleResend = () => {
    if (!email) return;
    void doResend(email);
  };

  const onSubmitEmail = handleSubmit(async (data) => {
    await doResend(data.email, true);
  });

  return (
    <>
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

          {email ? (
            <>
              <h2 className={authFormTitle}>Ative sua conta</h2>

              <p className={`${authFieldHint} text-center`}>
                Enviamos um e-mail de ativação para:
              </p>
              <p className="text-center text-body font-semibold text-foreground m-0 -mt-xs mb-sm">
                {email}
              </p>
              <p className={`${authFieldHint} text-center`}>
                Acesse sua caixa de entrada e clique no link de ativação enviado.
              </p>
              <p className={`${authFieldHint} text-center`}>
                Caso não encontre o e-mail, verifique também sua pasta de spam.
              </p>

              <div className="flex gap-sm mt-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => setShowLeaveModal(true)}
                  className="flex-1"
                >
                  Ir para login
                </Button>
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
            </>
          ) : (
            <>
              <h2 className={authFormTitle}>Reenviar ativação</h2>
              <p className={`${authFieldHint} text-center`}>
                Não encontramos um cadastro pendente neste navegador.
              </p>
              <p className={`${authFieldHint} text-center`}>
                Informe seu e-mail para solicitar um novo link de ativação.
              </p>

              <form className="flex flex-col gap-md" onSubmit={onSubmitEmail} noValidate>
                <div className="flex flex-col gap-1.5">
                  <input
                    type="email"
                    autoComplete="email"
                    className={inputBaseClasses}
                    placeholder="Email"
                    aria-label="Email"
                    {...register("email", {
                      required: true,
                      pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
                    })}
                  />
                  {errors.email?.type === "required" && (
                    <p className={authFieldError}>Informe seu e-mail</p>
                  )}
                  {errors.email?.type === "pattern" && (
                    <p className={authFieldError}>Insira um e-mail válido</p>
                  )}
                </div>

                <div className="flex gap-sm">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowLeaveModal(true)}
                    className="flex-1"
                  >
                    Ir para login
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
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
              </form>
            </>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={showLeaveModal}
        title="Você já ativou sua conta?"
        description={
          <>
            <p className="m-0 mb-sm">
              Caso você já tenha clicado no link enviado por e-mail, agora já pode acessar sua conta.
            </p>
            <p className="m-0">
              Se ainda não recebeu o e-mail, permaneça nesta tela para solicitar um novo envio
              quando disponível.
            </p>
          </>
        }
        cancelLabel="Ainda não"
        confirmLabel="Já ativei"
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
