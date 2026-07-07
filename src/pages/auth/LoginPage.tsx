import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { PasswordInput } from "@/components";
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
      await login(data);
      navigate(redirectTo, { replace: true });
    } catch {
      setError("root", { message: "Usuário ou senha inválidos" });
      await alerts.error("Falha no login", "Verifique seu e-mail e senha e tente novamente.");
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

        <Link
          to="/auth/recover"
          className="self-start text-small font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Esqueci a senha?
        </Link>

        {errors.root && <p className={authFieldError}>{errors.root.message}</p>}

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
    </Card>
  );
}
