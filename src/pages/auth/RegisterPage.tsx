import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { accountService } from "@/services/account-service";
import { PasswordInput } from "@/components";
import { alerts } from "@/utils/alerts";
import { savePendingEmail } from "@/utils/storage";
import styles from "@/styles/pages/auth.module.css";

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
    <div className={`card-base ${styles.authCard}`}>
      <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
        <h2 className={styles.formTitle}>Criar conta</h2>

        <div className={styles.fieldGroup}>
          <input
            type="text"
            className={`form-control ${styles.inputBase}`}
            placeholder="Nome"
            {...register("firstName", { required: true, maxLength: 80 })}
          />
          {errors.firstName?.type === "required" && (
            <p className={styles.fieldError}>O nome é obrigatório</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <input
            type="text"
            className={`form-control ${styles.inputBase}`}
            placeholder="Sobrenome"
            {...register("lastName", { required: true, maxLength: 80 })}
          />
          {errors.lastName?.type === "required" && (
            <p className={styles.fieldError}>O sobrenome é obrigatório</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <input
            type="text"
            className={`form-control ${styles.inputBase}`}
            placeholder="Email"
            {...register("email", {
              required: true,
              pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
            })}
          />
          {errors.email?.type === "required" && (
            <p className={styles.fieldError}>O email é obrigatório</p>
          )}
          {errors.email?.type === "pattern" && (
            <p className={styles.fieldError}>Insira um email válido!</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <PasswordInput
            className={`form-control ${styles.inputBase}`}
            placeholder="Digite aqui a Senha"
            {...register("password", {
              required: true,
              minLength: 8,
              pattern: /^(?=.*\d).{8,}$/,
            })}
          />
          <p className={styles.passwordHint}>
            A sua senha deve ter pelo menos 8 caracteres e conter pelo menos um número
          </p>
          {errors.password?.type === "required" && (
            <p className={styles.fieldError}>A senha é obrigatória</p>
          )}
          {(errors.password?.type === "minLength" || errors.password?.type === "pattern") && (
            <p className={styles.fieldError}>
              A senha deve ter no mínimo 8 caracteres e conter pelo menos um número
            </p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <PasswordInput
            className={`form-control ${styles.inputBase}`}
            placeholder="Repita aqui a Senha"
            {...register("passwordConfirm", {
              required: true,
              validate: (value) => value === passwordValue || "As senhas não coincidem",
            })}
          />
          {errors.passwordConfirm?.type === "required" && (
            <p className={styles.fieldError}>Confirme a senha</p>
          )}
          {errors.passwordConfirm?.type === "validate" && (
            <p className={styles.fieldError}>{errors.passwordConfirm.message}</p>
          )}
        </div>

        <div className={styles.registerActions}>
          <Link to="/auth/login" className={`btn ${styles.cancelBtn}`}>
            Cancelar
          </Link>
          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
