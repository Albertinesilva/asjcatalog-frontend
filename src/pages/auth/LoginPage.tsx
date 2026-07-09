import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ConfirmDialog, PasswordInput } from "@/components";
import { Button, Card, cn, inputBaseClasses } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { alerts } from "@/utils/alerts";
import { authFieldError, authFormTitle } from "./_ui";

type AuthFormFields = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated, login } = useAuth();
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [inactiveAccount, setInactiveAccount] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormFields>();

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  useEffect(() => {
    if (authenticated) navigate(redirectTo, { replace: true });
  }, [authenticated, navigate, redirectTo]);

  const onSubmit = async (data: AuthFormFields) => {
    try {
      setInactiveAccount(false);
      await login(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const error = err as {
        response?: { status?: number; data?: { message?: string; code?: string } };
      };
      const status = error.response?.status;
      const code = error.response?.data?.code;
      // Estrutura preparada: caso o backend passe a sinalizar conta inativa
      // (ex.: HTTP 403 ou code "ACCOUNT_NOT_ACTIVATED"), exibimos uma mensagem
      // específica com CTA de reenvio de ativação. Enquanto isso não existir,
      // o fluxo cai no ramo genérico atual.
      if (status === 403 || code === "ACCOUNT_NOT_ACTIVATED") {
        setInactiveAccount(true);
        setError("root", {
          message:
            "Sua conta ainda não foi ativada. Verifique seu e-mail ou solicite um novo envio.",
        });
      } else {
        setError("root", { message: "Usuário ou senha inválidos" });
        await alerts.error("Falha no login", "Verifique seu e-mail e senha e tente novamente.");
      }
    }
  };

  return (
    <Card padding="lg" elevated bordered className="w-full max-w-[440px]">
      <form className="flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className={authFormTitle}>Entrar</h2>

        <div className="flex flex-col gap-1.5">
          <input
            type="email"
            autoComplete="email"
            className={inputBaseClasses}
            placeholder="Email"
            aria-label="Email"
            {...register("username", {
              required: true,
              pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
            })}
          />
          {errors.username?.type === "required" && (
            <p className={authFieldError}>O preenchimento do email é obrigatório</p>
          )}
          {errors.username?.type === "pattern" && (
            <p className={authFieldError}>Insira um email válido!</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <PasswordInput
            className={cn(inputBaseClasses)}
            placeholder="Senha"
            autoComplete="current-password"
            aria-label="Senha"
            {...register("password", { required: true })}
          />
          {errors.password?.type === "required" && (
            <p className={authFieldError}>O preenchimento da senha é obrigatório</p>
          )}
        </div>

        <div className="flex flex-col gap-xs items-start">
          <Link
            to="/auth/recover"
            className="text-small font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Esqueci a senha?
          </Link>
          <button
            type="button"
            onClick={() => setShowActivationModal(true)}
            className="text-small font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm bg-transparent p-0"
          >
            Não recebeu o e-mail de ativação?
          </button>
        </div>

        {errors.root && <p className={authFieldError}>{errors.root.message}</p>}
        {inactiveAccount && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => setShowActivationModal(true)}
          >
            Reenviar ativação
          </Button>
        )}

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>

        <p className="text-center text-small text-foreground-muted m-0">
          Ainda não tem conta?{" "}
          <Link
            to="/auth/register"
            className="font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Cadastrar
          </Link>
        </p>
      </form>

      <ConfirmDialog
        open={showActivationModal}
        title="Ativar conta"
        description={
          <>
            <p className="m-0 mb-sm">
              Você já realizou seu cadastro, mas ainda não conseguiu ativar sua conta?
            </p>
            <p className="m-0">
              Podemos reenviar um novo e-mail de ativação caso ainda não o tenha recebido.
            </p>
          </>
        }
        cancelLabel="Cancelar"
        confirmLabel="Continuar"
        variant="primary"
        onCancel={() => setShowActivationModal(false)}
        onConfirm={() => {
          setShowActivationModal(false);
          navigate("/auth/activation-pending");
        }}
      />
    </Card>
  );
}
