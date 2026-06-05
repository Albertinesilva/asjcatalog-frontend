import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import imageBackground from "../assets/auth_image.png";
import styles from "../styles/pages/auth.module.css";

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
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormFields>();

  const passwordValue = watch("password");

  const onSubmit = async (_data: RegisterFormFields) => {
    // TODO: integrar com backend de cadastro quando disponível
    navigate("/admin/auth");
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
          <h2 className={styles.formTitle}>CADASTRO</h2>

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
            <input
              type="password"
              className={`form-control ${styles.inputBase}`}
              placeholder="Digite aqui a Senha"
              {...register("password", {
                required: true,
                minLength: 8,
                pattern: /^(?=.*\d).{8,}$/,
              })}
            />
            <p className={styles.passwordHint}>
              A sua senha deve ter pelo menos 8 caracteres e conter pelo menos
              uma número
            </p>
            {errors.password?.type === "required" && (
              <p className={styles.fieldError}>A senha é obrigatória</p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <input
              type="password"
              className={`form-control ${styles.inputBase}`}
              placeholder="Repita aqui a Senha"
              {...register("passwordConfirm", {
                required: true,
                validate: (value) =>
                  value === passwordValue || "As senhas não coincidem",
              })}
            />
            {errors.passwordConfirm?.type === "required" && (
              <p className={styles.fieldError}>Confirme a senha</p>
            )}
            {errors.passwordConfirm?.type === "validate" && (
              <p className={styles.fieldError}>
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          <div className={styles.registerActions}>
            <Link
              to="/admin/auth"
              className={`btn ${styles.cancelBtn}`}
            >
              CANCELAR
            </Link>
            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "CADASTRANDO..." : "CADASTRAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}