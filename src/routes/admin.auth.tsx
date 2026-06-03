import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ButtonIcon } from "../components";
import { loginRequest } from "../lib/api";
import {
  saveSessionData,
  isAuthenticated as checkAuth,
} from "../lib/auth";
import imageBackground from "../assets/auth_image.png";
import styles from "../styles/pages/auth.module.css";

type AuthFormFields = {
  username: string;
  password: string;
};

export const Route = createFileRoute("/admin/auth")({
  head: () => ({ meta: [{ title: "Login — DS Catalog" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormFields>();

  useEffect(() => {
    if (checkAuth()) {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  const onSubmit = async (data: AuthFormFields) => {
    try {
      const session = await loginRequest(data.username, data.password);
      saveSessionData(session);
      navigate({ to: "/admin" });
    } catch (err) {
      console.error("Falha no login", err);
      setError("root", {
        message: "Usuário ou senha inválidos",
      });
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`d-none d-lg-block ${styles.authInfo}`}>
        <h1 className={styles.authInfoTitle}>
          Divulgue seus produtos <br /> no DS Catalog
        </h1>
        <p className={styles.authInfoSubtitle}>
          Faça parte do nosso catálogo de divulgação e <br /> aumente a venda
          dos seus produtos.
        </p>
        <img src={imageBackground} alt="Background Login" />
      </div>
      <div className={`card-base ${styles.authCard}`}>
        <div className={styles.authContent}>
          <form
            className={`d-flex flex-column align-items-center justify-content-between ${styles.loginForm}`}
            onSubmit={handleSubmit(onSubmit)}
          >
            <h2 className={`text-center mb-5 ${styles.formTitle}`}>Login</h2>

            <input
              type="text"
              className="form-control input-base"
              placeholder="Email"
              {...register("username", {
                required: true,
                pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
              })}
            />
            {errors.username?.type === "required" && (
              <p className="login-form-error">
                O preenchimento do email é obrigatório
              </p>
            )}
            {errors.username?.type === "pattern" && (
              <p className="login-form-error">Insira um email válido!</p>
            )}

            <input
              type="password"
              className="form-control input-base"
              placeholder="Senha"
              {...register("password", { required: true })}
            />
            {errors.password?.type === "required" && (
              <p className="login-form-error">
                O preenchimento da senha é obrigatório
              </p>
            )}

            {errors.root && (
              <p className="login-form-error">{errors.root.message}</p>
            )}

            <Link to="/" className={styles.loginLinkRecover}>
              Esqueci a senha?
            </Link>
            <div className="text-center">
              <ButtonIcon
                label={isSubmitting ? "entrando..." : "fazer login"}
                type="submit"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}