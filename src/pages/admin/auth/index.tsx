import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ButtonIcon } from "../components";
import { loginRequest } from "@/utils/api";
import {
  saveSessionData,
  isAuthenticated as checkAuth,
} from "@/utils/auth";
import imageBackground from "../assets/auth_image.png";
import styles from "../styles/pages/auth.module.css";

type AuthFormFields = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormFields>();

  useEffect(() => {
    if (checkAuth()) {
      navigate("/admin");
    }
  }, [navigate]);

  const onSubmit = async (data: AuthFormFields) => {
    try {
      const session = await loginRequest(data.username, data.password);
      saveSessionData(session);
      navigate("/admin");
    } catch (err) {
      console.error("Falha no login", err);
      setError("root", {
        message: "Usuário ou senha inválidos",
      });
    }
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
            <input
              type="password"
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

          <Link to="/admin/recover" className={styles.loginLinkRecover}>
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
            <Link to="/admin/register" className={styles.loginLinkRegister}>
              CADASTRAR
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}