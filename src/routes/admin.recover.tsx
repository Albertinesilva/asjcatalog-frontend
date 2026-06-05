import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import imageBackground from "../assets/auth_image.png";
import styles from "../styles/pages/auth.module.css";

type RecoverFormFields = {
  email: string;
  emailConfirm: string;
};

export const Route = createFileRoute("/admin/recover")({
  ssr: false,
  head: () => ({ meta: [{ title: "Recuperação — DS Catalog" }] }),
  component: RecoverPage,
});

function RecoverPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecoverFormFields>();

  const emailValue = watch("email");

  const onSubmit = async (_data: RecoverFormFields) => {
    // TODO: integrar com backend de recuperação quando disponível
    navigate({ to: "/admin/auth" });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authInfo}>
        <h1 className={styles.authInfoTitle}>
          Divulgue seus produtos no DS Catalog
        </h1>
        <p className={styles.authInfoSubtitle}>
          Faça parte do nosso catálogo de divulgação e aumente a venda dos seus
          produtos.
        </p>
        <img
          src={imageBackground}
          alt="Pessoas divulgando produtos"
          className={styles.authInfoImage}
        />
      </div>

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
              <p className={styles.fieldError}>
                {errors.emailConfirm.message}
              </p>
            )}
          </div>

          <div className={styles.recoverActions}>
            <Link to="/admin/auth" className={`btn ${styles.cancelBtn}`}>
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
    </div>
  );
}