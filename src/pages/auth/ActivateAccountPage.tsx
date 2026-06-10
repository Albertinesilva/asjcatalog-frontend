import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { accountService } from "@/services/account-service";
import { alerts } from "@/utils/alerts";
import { getPendingEmail, removePendingEmail } from "@/utils/storage";
import styles from "@/styles/pages/auth.module.css";

type Status = "loading" | "success" | "error" | "missing";

export default function ActivateAccountPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus("missing");
      return;
    }

    (async () => {
      try {
        await accountService.activate(token);
        removePendingEmail();
        setStatus("success");
        await alerts.success(
          "Conta ativada!",
          "Sua conta foi ativada com sucesso. Faça login para continuar.",
        );
        navigate("/auth/login", { replace: true });
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        const msg =
          error.response?.data?.message ??
          "Token inválido ou expirado.";
        setErrorMsg(msg);
        setStatus("error");
        await alerts.error("Falha na ativação", msg);
      }
    })();
  }, [token, navigate]);

  const resend = async () => {
    const email = getPendingEmail();
    if (!email) {
      await alerts.warning(
        "E-mail não encontrado",
        "Faça o cadastro novamente para receber um novo link.",
      );
      navigate("/auth/register");
      return;
    }
    try {
      alerts.loading("Reenviando e-mail...");
      await accountService.resendActivation(email);
      alerts.close();
      await alerts.success(
        "E-mail reenviado!",
        `Enviamos um novo link de ativação para ${email}.`,
      );
      navigate("/auth/activation-pending");
    } catch (err) {
      alerts.close();
      const error = err as { response?: { data?: { message?: string } } };
      await alerts.error(
        "Falha ao reenviar",
        error.response?.data?.message ?? "Tente novamente em instantes.",
      );
    }
  };

  return (
    <div className={`card-base ${styles.authCard}`}>
      <div className={styles.loginForm}>
        <h2 className={styles.formTitle}>ATIVAÇÃO DE CONTA</h2>

        {status === "loading" && (
          <p className={styles.passwordHint} style={{ textAlign: "center" }}>
            Validando seu token, aguarde...
          </p>
        )}

        {status === "missing" && (
          <>
            <p className={styles.fieldError}>
              Link de ativação inválido: token não informado.
            </p>
            <div className={styles.registerActions}>
              <Link to="/auth/login" className={`btn ${styles.cancelBtn}`}>
                IR PARA LOGIN
              </Link>
              <button
                type="button"
                className={`btn btn-primary ${styles.submitBtn}`}
                onClick={resend}
              >
                REENVIAR E-MAIL
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <p className={styles.fieldError}>{errorMsg}</p>
            <div className={styles.registerActions}>
              <Link to="/auth/login" className={`btn ${styles.cancelBtn}`}>
                IR PARA LOGIN
              </Link>
              <button
                type="button"
                className={`btn btn-primary ${styles.submitBtn}`}
                onClick={resend}
              >
                REENVIAR E-MAIL
              </button>
            </div>
          </>
        )}

        {status === "success" && (
          <p className={styles.passwordHint} style={{ textAlign: "center" }}>
            Conta ativada com sucesso. Redirecionando...
          </p>
        )}
      </div>
    </div>
  );
}