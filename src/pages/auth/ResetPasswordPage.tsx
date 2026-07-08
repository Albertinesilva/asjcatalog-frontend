import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { accountApi } from "@/api/account-api";
import { PasswordInput } from "@/components";
import { Button, Card, inputBaseClasses } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { authFieldError, authFieldHint, authFormTitle } from "./_ui";

type FormFields = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>();

  const passwordValue = watch("password");

  const onSubmit = async (data: FormFields) => {
    if (!token) {
      await alerts.error("Token inválido", "O link de redefinição é inválido.");
      return;
    }
    try {
      await accountApi.resetPassword(token, data.password);
      await alerts.success("Senha redefinida", "Faça login com sua nova senha.");
      navigate("/auth/login");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      await alerts.error(
        "Falha ao redefinir",
        error.response?.data?.message ?? "Token inválido ou expirado.",
      );
    }
  };

  return (
    <Card padding="lg" elevated bordered className="w-full max-w-[440px]">
      <form className="flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className={authFormTitle}>Redefinir senha</h2>

        {!token && <p className={authFieldError}>Token de redefinição não informado na URL.</p>}

        <div className="flex flex-col gap-1.5">
          <PasswordInput
            className={inputBaseClasses}
            placeholder="Nova senha"
            autoComplete="new-password"
            aria-label="Nova senha"
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
            placeholder="Confirmar nova senha"
            autoComplete="new-password"
            aria-label="Confirmar nova senha"
            {...register("confirmPassword", {
              required: true,
              validate: (v) => v === passwordValue || "As senhas não coincidem",
            })}
          />
          {errors.confirmPassword?.type === "required" && (
            <p className={authFieldError}>Confirme a senha</p>
          )}
          {errors.confirmPassword?.type === "validate" && (
            <p className={authFieldError}>{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex gap-sm mt-sm">
          <Link to="/auth/login" className="flex-1">
            <Button type="button" variant="outline" size="lg" fullWidth>
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting || !token}
            className="flex-1"
          >
            {isSubmitting ? "Enviando..." : "Redefinir"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
