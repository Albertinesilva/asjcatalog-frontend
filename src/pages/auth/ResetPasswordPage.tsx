import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { accountService } from "@/services/account-service";
import { PasswordField, PasswordMatch, PasswordRequirements } from "@/components";
import { Button, Card } from "@/components/ui";
import { alerts } from "@/utils/alerts";
import { COMMON_PASSWORD_INLINE_MESSAGE, isCommonPasswordError } from "@/utils/password";
import { authFieldError, authFormTitle } from "./_ui";

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

  const passwordValue = watch("password") ?? "";
  const confirmValue = watch("confirmPassword") ?? "";
  const [passwordIssue, setPasswordIssue] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const onSubmit = async (data: FormFields) => {
    setPasswordIssue(null);
    if (!token) {
      await alerts.error("Token inválido", "O link de redefinição é inválido.");
      return;
    }
    try {
      await accountService.resetPassword(token, data.password);
      await alerts.success("Senha redefinida", "Faça login com sua nova senha.");
      navigate("/auth/login");
    } catch (err) {
      if (isCommonPasswordError(err)) {
        setPasswordIssue(COMMON_PASSWORD_INLINE_MESSAGE);
        passwordRef.current?.focus();
        return;
      }
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

        <div className="flex flex-col gap-sm">
          {(() => {
            const reg = register("password", {
              required: true,
              minLength: 8,
              pattern: /^(?=.*\d).{8,}$/,
              onChange: () => {
                if (passwordIssue) setPasswordIssue(null);
              },
            });
            return (
              <PasswordField
                placeholder="Nova senha"
                autoComplete="new-password"
                aria-label="Nova senha"
                {...reg}
                ref={(el) => {
                  passwordRef.current = el;
                  reg.ref(el);
                }}
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
          <PasswordRequirements password={passwordValue} issue={passwordIssue} />
        </div>

        <div className="flex flex-col gap-1.5">
          <PasswordField
            placeholder="Confirmar nova senha"
            autoComplete="new-password"
            aria-label="Confirmar nova senha"
            {...register("confirmPassword", {
              required: true,
              validate: (v) => v === passwordValue || "As senhas não coincidem",
            })}
          />
          <PasswordMatch password={passwordValue} confirm={confirmValue} />
          {errors.confirmPassword?.type === "required" && (
            <p className={authFieldError}>Confirme a senha</p>
          )}
          {errors.confirmPassword?.type === "validate" && !confirmValue && (
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
