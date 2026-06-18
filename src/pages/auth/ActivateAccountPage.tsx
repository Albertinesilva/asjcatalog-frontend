import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { accountService } from "@/services/account-service";
import { alerts } from "@/utils/alerts";
import { getPendingEmail, removePendingEmail } from "@/utils/storage";
import styles from "@/styles/pages/auth.module.css";

type Status =
  | "loading"
  | "success"
  | "expired"
  | "invalid"
  | "already"
  | "missing"
  | "error";

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
      } catch (err) {
        const error = err as {
          response?: { status?: number; data?: { message?: string } };
        };
        const s = error.response?.status;
        const msg = error.response?.data?.message ?? null;
        setErrorMsg(msg);
        if (s === 410 || s === 400) setStatus("expired");
        else if (s === 409) setStatus("already");
        else if (s === 404 || s === 422) setStatus("invalid");
        else setStatus("error");
      }
    })();
  }, [token]);

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
      alerts.loading("Reenviando...");
      await accountService.resendActivation(email);
      alerts.close();
      await alerts.success(
        "Novo e-mail enviado!",
        `Verifique sua caixa de entrada (${email}).`,
      );
      navigate("/activation-pending");
    } catch (err) {
      alerts.close();
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (error.response?.status === 429) {
        await alerts.warning(
          "Aguarde alguns instantes",
          error.response?.data?.message ??
            "Você solicitou um novo e-mail recentemente.",
        );
      } else {
        await alerts.error(
          "Falha ao reenviar",
          error.response?.data?.message ?? "Tente novamente em instantes.",
        );
      }
    }
  };

  return (
    <div className={`card-base ${styles.authCard}`}>
      <div className={styles.loginForm}>
        {status === "loading" && (
          <>
            <h2 className={styles.formTitle}>ATIVANDO SUA CONTA</h2>
            <p className={styles.passwordHint} style={{ textAlign: "center" }}>
              Validando seu token, aguarde...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className={styles.formTitle}>CONTA ATIVADA COM SUCESSO!</h2>
            <p className={styles.passwordHint} style={{ textAlign: "center" }}>
              Sua conta foi ativada. Agora você pode realizar login.
            </p>
            <div className={styles.registerActions}>
              <Link
                to="/auth/login"
                className={`btn btn-primary ${styles.submitBtn}`}
              >
                IR PARA LOGIN
              </Link>
            </div>
          </>
        )}

        {status === "expired" && (
          <>
            <h2 className={styles.formTitle}>LINK EXPIRADO</h2>
            <p className={styles.passwordHint} style={{ textAlign: "center" }}>
              {errorMsg ?? "O link de ativação expirou."}
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
                REENVIAR NOVO E-MAIL
              </button>
            </div>
          </>
        )}

        {status === "invalid" && (
          <>
            <h2 className={styles.formTitle}>LINK INVÁLIDO</h2>
            <p className={styles.passwordHint} style={{ textAlign: "center" }}>
              O link utilizado não é válido.
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
                SOLICITAR NOVO E-MAIL
              </button>
            </div>
          </>
        )}

        {status === "already" && (
          <>
            <h2 className={styles.formTitle}>CONTA JÁ ATIVADA</h2>
            <p className={styles.passwordHint} style={{ textAlign: "center" }}>
              Sua conta já está ativa. Você pode realizar login normalmente.
            </p>
            <div className={styles.registerActions}>
              <Link
                to="/auth/login"
                className={`btn btn-primary ${styles.submitBtn}`}
              >
                IR PARA LOGIN
              </Link>
            </div>
          </>
        )}

        {status === "missing" && (
          <>
            <h2 className={styles.formTitle}>LINK INVÁLIDO</h2>
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
                SOLICITAR NOVO E-MAIL
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className={styles.formTitle}>FALHA NA ATIVAÇÃO</h2>
            <p className={styles.fieldError}>
              {errorMsg ?? "Não foi possível ativar sua conta no momento."}
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
      </div>
    </div>
  );
}