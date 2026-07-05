import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { accountService } from "@/services/account-service";
import { PasswordInput } from "@/components";
import { Button, Card, inputBaseClasses } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { savePendingEmail } from "@/utils/storage";
import { authFieldError, authFieldHint, authFormTitle } from "./_ui";

type RegisterFormFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormFields>();

  const passwordValue = watch("password");

  const onSubmit = async (data: RegisterFormFields) => {
    try {
      await accountService.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      savePendingEmail(data.email);
      window.localStorage.setItem("activationResendAvailableAt", String(Date.now() + 60_000));
      await alerts.success(
        "Cadastro realizado!",
        `Enviamos um e-mail de ativação para:\n${data.email}\n\nVerifique sua caixa de entrada para ativar sua conta.`,
      );
      navigate("/auth/activation-pending");
    } catch (err) {
      const error = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            errors?: { fieldName: string; message: string }[];
          };
        };
        message?: string;
      };
      const fieldErrors = error.response?.data?.errors;
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        fieldErrors.forEach((fe) => {
          setError(fe.fieldName as keyof RegisterFormFields, {
            type: "server",
            message: fe.message,
          });
        });
        await alerts.error("Dados inválidos", "Confira os campos destacados e tente novamente.");
      } else {
        await alerts.error(
          "Falha no cadastro",
          error.response?.data?.message ?? error.message ?? "Não foi possível concluir o cadastro.",
        );
      }
    }
  };

  return (
    <Card padding="lg" elevated bordered className="w-full max-w-[440px]">
      <form className="flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className={authFormTitle}>Criar conta</h2>

        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            autoComplete="given-name"
            className={inputBaseClasses}
            placeholder="Nome"
            aria-label="Nome"
            {...register("firstName", { required: true, maxLength: 80 })}
          />
          {errors.firstName?.type === "required" && (
            <p className={authFieldError}>O nome é obrigatório</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            autoComplete="family-name"
            className={inputBaseClasses}
            placeholder="Sobrenome"
            aria-label="Sobrenome"
            {...register("lastName", { required: true, maxLength: 80 })}
          />
          {errors.lastName?.type === "required" && (
            <p className={authFieldError}>O sobrenome é obrigatório</p>
          )}
        </div>

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
            <p className={authFieldError}>O email é obrigatório</p>
          )}
          {errors.email?.type === "pattern" && (
            <p className={authFieldError}>Insira um email válido!</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <PasswordInput
            className={inputBaseClasses}
            placeholder="Digite aqui a senha"
            autoComplete="new-password"
            aria-label="Senha"
            {...register("password", {
              required: true,
              minLength: 8,
              pattern: /^(?=.*\d).{8,}$/,
            })}
          />
          <p className={authFieldHint}>
            A sua senha deve ter pelo menos 8 caracteres e conter pelo menos um número
          </p>
          {errors.password?.type === "required" && (
            <p className={authFieldError}>A senha é obrigatória</p>
          )}
          {(errors.password?.type === "minLength" || errors.password?.type === "pattern") && (
            <p className={authFieldError}>
              A senha deve ter no mínimo 8 caracteres e conter pelo menos um número
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <PasswordInput
            className={inputBaseClasses}
            placeholder="Repita a senha"
            autoComplete="new-password"
            aria-label="Confirmar senha"
            {...register("passwordConfirm", {
              required: true,
              validate: (value) => value === passwordValue || "As senhas não coincidem",
            })}
          />
          {errors.passwordConfirm?.type === "required" && (
            <p className={authFieldError}>Confirme a senha</p>
          )}
          {errors.passwordConfirm?.type === "validate" && (
            <p className={authFieldError}>{errors.passwordConfirm.message}</p>
          )}
        </div>

        <div className="flex gap-sm mt-sm">
          <Link to="/auth/login" className="flex-1">
            <Button type="button" variant="outline" size="lg" fullWidth>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" size="lg" loading={isSubmitting} className="flex-1">
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
