import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ButtonIcon, PasswordInput } from "@/components";
import { useAuth } from "@/hooks/useAuth";
import { alerts } from "@/utils/alerts";
import styles from "@/styles/pages/auth.module.css";

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

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/admin";

  useEffect(() => {
    if (authenticated) navigate(redirectTo, { replace: true });
  }, [authenticated, navigate, redirectTo]);

  const onSubmit = async (data: AuthFormFields) => {
    try {
      await login(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Falha no login", err);
      setError("root", { message: "Usuário ou senha inválidos" });
      await alerts.error(
        "Falha no login",
        "Verifique seu e-mail e senha e tente novamente.",
      );
    }
  };

  return (
    <div className={`card-base ${styles.authCard}`}>
      <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
        <h2 className={styles.formTitle}>LOGIN</h2>

        <div className={styles.fieldGroup}>
          <input
            type="text"
            className={`form-control ${styles.inputBase}`}
            placeholder="Email"
            {...register("username", {
              required: true,
              pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
            })}
          />
          {errors.username?.type === "required" && (
            <p className={styles.fieldError}>
              O preenchimento do email é obrigatório
            </p>
          )}
          {errors.username?.type === "pattern" && (
            <p className={styles.fieldError}>Insira um email válido!</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <PasswordInput
            className={`form-control ${styles.inputBase}`}
            placeholder="Senha"
            {...register("password", { required: true })}
          />
          {errors.password?.type === "required" && (
            <p className={styles.fieldError}>
              O preenchimento da senha é obrigatório
            </p>
          )}
        </div>

        <Link to="/auth/recover" className={styles.loginLinkRecover}>
          Esqueci a senha?
        </Link>

        {errors.root && (
          <p className={styles.fieldError}>{errors.root.message}</p>
        )}

        <div className={styles.submitWrap}>
          <ButtonIcon
            label={isSubmitting ? "entrando..." : "logar"}
            type="submit"
          />
        </div>

        <div className={styles.notRegisteredWrap}>
          <span className={styles.notRegistered}>Não tem Cadastro?</span>
          <Link to="/auth/register" className={styles.loginLinkRegister}>
            CADASTRAR
          </Link>
        </div>
      </form>
    </div>
  );
}