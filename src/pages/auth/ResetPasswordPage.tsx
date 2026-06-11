import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { accountApi } from "@/api/account-api";
import { alerts } from "@/utils/alerts";
import styles from "@/styles/pages/auth.module.css";

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
      alerts.loading("Redefinindo senha...");
      await accountApi.resetPassword(token, data.password);
      alerts.close();
      await alerts.success(
        "Senha redefinida",
        "Faça login com sua nova senha.",
      );
      navigate("/auth/login");
    } catch (err) {
      alerts.close();
      const error = err as { response?: { data?: { message?: string } } };
      await alerts.error(
        "Falha ao redefinir",
        error.response?.data?.message ?? "Token inválido ou expirado.",
      );
    }
  };

  return (
    <div className={`card-base ${styles.authCard}`}>
      <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
        <h2 className={styles.formTitle}>REDEFINIR SENHA</h2>

        {!token && (
          <p className={styles.fieldError}>
            Token de redefinição não informado na URL.
          </p>
        )}

        <div className={styles.fieldGroup}>
          <input
            type="password"
            className={`form-control ${styles.inputBase}`}
            placeholder="Nova senha"
            {...register("password", { required: true, minLength: 6 })}
          />
          {errors.password?.type === "required" && (
            <p className={styles.fieldError}>A senha é obrigatória</p>
          )}
          {errors.password?.type === "minLength" && (
            <p className={styles.fieldError}>Mínimo de 6 caracteres</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <input
            type="password"
            className={`form-control ${styles.inputBase}`}
            placeholder="Confirmar nova senha"
            {...register("confirmPassword", {
              required: true,
              validate: (v) => v === passwordValue || "As senhas não coincidem",
            })}
          />
          {errors.confirmPassword?.type === "required" && (
            <p className={styles.fieldError}>Confirme a senha</p>
          )}
          {errors.confirmPassword?.type === "validate" && (
            <p className={styles.fieldError}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className={styles.recoverActions}>
          <Link to="/auth/login" className={`btn ${styles.cancelBtn}`}>
            CANCELAR
          </Link>
          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isSubmitting || !token}
          >
            {isSubmitting ? "ENVIANDO..." : "REDEFINIR"}
          </button>
        </div>
      </form>
    </div>
  );
}