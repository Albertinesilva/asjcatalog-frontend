import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import styles from "@/styles/pages/auth.module.css";

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
    formState: { errors, isSubmitting },
  } = useForm<RecoverFormFields>();

  const emailValue = watch("email");

  const onSubmit = async (_data: RecoverFormFields) => {
    // TODO: integrar com endpoint de recuperação quando disponível
    navigate("/auth/login");
  };

  return (
    <div className={`card-base ${styles.authCard}`}>
      <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
        <h2 className={styles.formTitle}>RECUPERAÇÃO</h2>

        <div className={styles.fieldGroup}>
          <input
            type="text"
            className={`form-control ${styles.inputBase}`}
            placeholder="Digite o Email Cadastrado"
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
          <input
            type="text"
            className={`form-control ${styles.inputBase}`}
            placeholder="Repita o Email Cadastrado"
            {...register("emailConfirm", {
              required: true,
              validate: (value) =>
                value === emailValue || "Os emails não coincidem",
            })}
          />
          {errors.emailConfirm?.type === "required" && (
            <p className={styles.fieldError}>Confirme o email</p>
          )}
          {errors.emailConfirm?.type === "validate" && (
            <p className={styles.fieldError}>{errors.emailConfirm.message}</p>
          )}
        </div>

        <div className={styles.recoverActions}>
          <Link to="/auth/login" className={`btn ${styles.cancelBtn}`}>
            CANCELAR
          </Link>
          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "ENVIANDO..." : "ENVIAR"}
          </button>
        </div>
      </form>
    </div>
  );
}