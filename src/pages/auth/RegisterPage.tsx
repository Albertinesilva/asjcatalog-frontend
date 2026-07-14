import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { accountService } from "@/services/account-service";
import { PasswordField, PasswordMatch, PasswordRequirements } from "@/components";
import { Button, Card, inputBaseClasses } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { savePendingEmail, startResendCooldown } from "@/utils/storage";
import { handleApiError } from "@/utils/api-error-handler";
import { authFieldError, authFormTitle } from "./_ui";

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

  const passwordValue = watch("password") ?? "";
  const confirmValue = watch("passwordConfirm") ?? "";
  const [requirementsOpen, setRequirementsOpen] = useState(false);

  const onSubmit = async (data: RegisterFormFields) => {
    try {
      await accountService.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      savePendingEmail(data.email);
      startResendCooldown();
      await alerts.success(
        "Cadastro realizado!",
        `Enviamos um e-mail de ativação para:\n${data.email}\n\nVerifique sua caixa de entrada para ativar sua conta.`,
      );
      navigate("/auth/activation-pending");
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof RegisterFormFields, error),
        fallbackTitle: "Falha no cadastro",
        fallbackMessage: "Não foi possível concluir o cadastro.",
      });
      if (!handled) {
        await alerts.error("Falha no cadastro", "Não foi possível concluir o cadastro.");
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

        <div className="flex flex-col gap-sm">
          {(() => {
            const reg = register("password", {
              required: true,
              minLength: 8,
              pattern: /^(?=.*\d).{8,}$/,
              onBlur: () => {
                if (passwordValue.length === 0) setRequirementsOpen(false);
              },
            });
            return (
              <PasswordField
                placeholder="Digite aqui a senha"
                autoComplete="new-password"
                aria-label="Senha"
                {...reg}
                onFocus={() => setRequirementsOpen(true)}
              />
            );
          })()}
          {errors.password?.type === "required" && (
            <p className={authFieldError}>A senha é obrigatória</p>
          )}
          {(errors.password?.type === "minLength" || errors.password?.type === "pattern") && (
            <p className={authFieldError}>
              A senha deve ter no mínimo 8 caracteres e conter pelo menos um número
            </p>
          )}
          {errors.password?.type === "server" && (
            <p className={authFieldError}>{errors.password.message}</p>
          )}
          <PasswordRequirements
            password={passwordValue}
            collapsible
            open={requirementsOpen}
            onOpenChange={setRequirementsOpen}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <PasswordField
            placeholder="Repita a senha"
            autoComplete="new-password"
            aria-label="Confirmar senha"
            {...register("passwordConfirm", {
              required: true,
              validate: (value) => value === passwordValue || "As senhas não coincidem",
            })}
          />
          <PasswordMatch password={passwordValue} confirm={confirmValue} />
          {errors.passwordConfirm?.type === "required" && (
            <p className={authFieldError}>Confirme a senha</p>
          )}
          {errors.passwordConfirm?.type === "validate" && !confirmValue && (
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
