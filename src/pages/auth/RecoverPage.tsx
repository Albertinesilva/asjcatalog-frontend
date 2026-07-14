import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { accountService } from "@/services/account-service";
import { Button, Card, inputBaseClasses } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { handleApiError } from "@/utils/api-error-handler";
import { authFieldError, authFormTitle } from "./_ui";

type RecoverFormFields = {
  email: string;
  emailConfirm: string;
};

export default function RecoverPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecoverFormFields>();

  const emailValue = watch("email");

  const onSubmit = async (data: RecoverFormFields) => {
    try {
      await accountService.requestPasswordRecovery(data.email);
      await alerts.success(
        "E-mail enviado",
        "Verifique sua caixa de entrada para redefinir sua senha.",
      );
      navigate("/auth/login");
    } catch (err) {
      const handled = await handleApiError(err, {
        setError: (name, error) => setError(name as keyof RecoverFormFields, error),
        fallbackTitle: "Falha ao enviar",
        fallbackMessage: "Não foi possível enviar o e-mail de recuperação.",
      });
      if (!handled) {
        await alerts.error(
          "Falha ao enviar",
          "Não foi possível enviar o e-mail de recuperação.",
        );
      }
    }
  };

  return (
    <Card padding="lg" elevated bordered className="w-full max-w-[440px]">
      <form className="flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className={authFormTitle}>Recuperar senha</h2>

        <div className="flex flex-col gap-1.5">
          <input
            type="email"
            autoComplete="email"
            className={inputBaseClasses}
            placeholder="Digite o email cadastrado"
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
          <input
            type="email"
            autoComplete="email"
            className={inputBaseClasses}
            placeholder="Repita o email cadastrado"
            aria-label="Confirmar email"
            {...register("emailConfirm", {
              required: true,
              validate: (value) => value === emailValue || "Os emails não coincidem",
            })}
          />
          {errors.emailConfirm?.type === "required" && (
            <p className={authFieldError}>Confirme o email</p>
          )}
          {errors.emailConfirm?.type === "validate" && (
            <p className={authFieldError}>{errors.emailConfirm.message}</p>
          )}
        </div>

        <div className="flex gap-sm mt-sm">
          <Link to="/auth/login" className="flex-1">
            <Button type="button" variant="outline" size="lg" fullWidth>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" size="lg" loading={isSubmitting} className="flex-1">
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
