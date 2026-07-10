import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { accountService } from "@/services/account-service";
import { ConfirmDialog } from "@/components";
import { Button, Card, inputBaseClasses } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { getPendingEmail, savePendingEmail } from "@/utils/storage";
import { RESEND_COOLDOWN_KEY, RESEND_COOLDOWN_MS } from "@/utils/constants";
import { authFieldError, authFieldHint, authFormTitle } from "./_ui";

type EmailFormFields = { email: string };

function mapResendError(err: unknown): { title: string; text: string; status?: number } {
  const error = err as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };
  const status = error.response?.status;
  const backendMsg = error.response?.data?.message;
  if (status === 429) {
    return {
      status,
      title: "Muitas solicitações",
      text: backendMsg ?? "Aguarde alguns instantes antes de tentar novamente.",
    };
  }
  if (status && status >= 500) {
    return {
      status,
      title: "Serviço indisponível",
      text: "Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos.",
    };
  }
  if (!error.response) {
    return {
      title: "Falha de conexão",
      text: "Verifique sua internet e tente novamente.",
    };
  }
  return {
    status,
    title: "Erro ao reenviar",
    text:
      backendMsg ?? "Não foi possível reenviar o e-mail de ativação. Tente novamente mais tarde.",
  };
}

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
    setValue,
    formState: { errors },
  } = useForm<EmailFormFields>({
    defaultValues: { email: email ?? "" },
  });

  const startCooldown = (ms: number = RESEND_COOLDOWN_MS) => {
    const until = Date.now() + ms;
    window.localStorage.setItem(RESEND_COOLDOWN_KEY, String(until));
    setRemaining(Math.ceil(ms / 1000));
  };

  useEffect(() => {
    const raw = window.localStorage.getItem(RESEND_COOLDOWN_KEY);
    if (raw) {
      const diff = Number(raw) - Date.now();
      if (diff > 0) setRemaining(Math.ceil(diff / 1000));
      else window.localStorage.removeItem(RESEND_COOLDOWN_KEY);
    }
    tickRef.current = window.setInterval(() => {
      const r = window.localStorage.getItem(RESEND_COOLDOWN_KEY);
      if (!r) {
        setRemaining(0);
        return;
      }
      const diff = Number(r) - Date.now();
      if (diff <= 0) {
        window.localStorage.removeItem(RESEND_COOLDOWN_KEY);
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
      await accountService.resendActivation(targetEmail);
      if (isNewEmail) {
        savePendingEmail(targetEmail);
        setEmail(targetEmail);
        setValue("email", targetEmail);
      }
      startCooldown();
      await alerts.success(
        "E-mail reenviado",
        "Enviamos um novo link de ativação. Verifique sua caixa de entrada e também a pasta de spam.",
      );
    } catch (err) {
      const info = mapResendError(err);
      if (info.status === 429) {
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
      ? "Reenviando..."
      : remaining > 0
        ? `Reenviar em ${remaining}s`
        : "Reenviar e-mail"
    : sending
      ? "Enviando..."
      : remaining > 0
        ? `Aguarde ${remaining}s`
        : "Enviar novo e-mail de ativação";

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
              <h2 className={authFormTitle}>Ative sua conta</h2>
              <p className={`${authFieldHint} text-center`}>
                Enviamos um e-mail de ativação. Acesse sua caixa de entrada e clique no link
                enviado. Se não encontrar, verifique também a pasta de spam.
              </p>
            </>
          ) : (
            <>
              <h2 className={authFormTitle}>Não encontramos um cadastro pendente</h2>
              <p className={`${authFieldHint} text-center`}>
                Isto pode acontecer caso você tenha limpado os dados do navegador ou esteja
                utilizando outro dispositivo. Informe seu e-mail para solicitar um novo link de
                ativação.
              </p>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="activation-email" className="sr-only">
              E-mail
            </label>
            <input
              id="activation-email"
              type="email"
              autoComplete="email"
              className={inputBaseClasses}
              placeholder="Email"
              aria-label="E-mail"
              aria-describedby="resend-cooldown-hint"
              disabled={sending}
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
              disabled={sending}
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
              ? `Você poderá solicitar um novo e-mail em ${remaining} segundo${
                  remaining === 1 ? "" : "s"
                }.`
              : "\u00A0"}
          </p>
        </form>
      </Card>

      <ConfirmDialog
        open={showLeaveModal}
        title="Você já clicou no link enviado para seu e-mail?"
        description={
          <p className="m-0">
            Após confirmar sua conta pelo e-mail recebido, você poderá entrar normalmente no
            sistema.
          </p>
        }
        cancelLabel="Ainda não"
        confirmLabel="Já confirmei minha conta"
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
