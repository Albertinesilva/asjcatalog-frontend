import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { accountService } from "@/services/account-service";
import { alerts } from "@/utils/alerts";
import { getPendingEmail } from "@/utils/storage";
import styles from "@/styles/pages/auth.module.css";

export default function ActivationPendingPage() {
  const navigate = useNavigate();
  const email = getPendingEmail();
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      await alerts.warning(
        "E-mail não encontrado",
        "Faça o cadastro novamente para reenviar a ativação.",
      );
      navigate("/auth/register");
      return;
    }
    try {
      setSending(true);
      alerts.loading("Reenviando e-mail...");
      await accountService.resendActivation(email);
      alerts.close();
      await alerts.success(
        "E-mail reenviado!",
        `Enviamos um novo link de ativação para ${email}.`,
      );
    } catch (err) {
      alerts.close();
      const error = err as { response?: { data?: { message?: string } } };
      await alerts.error(
        "Falha ao reenviar",
        error.response?.data?.message ??
          "Não foi possível reenviar o e-mail. Tente novamente em instantes.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`card-base ${styles.authCard}`}>
      <div className={styles.loginForm}>
        <h2 className={styles.formTitle}>ATIVE SUA CONTA</h2>
        <p className={styles.passwordHint}>
          Enviamos um e-mail com o link de ativação para:
        </p>
        <p style={{ fontWeight: 700, textAlign: "center", margin: "8px 0 24px" }}>
          {email ?? "(e-mail não informado)"}
        </p>
        <p className={styles.passwordHint}>
          Acesse sua caixa de entrada e clique no link para concluir seu
          cadastro. Se não encontrar, verifique também o spam.
        </p>

        <div className={styles.registerActions}>
          <Link to="/auth/login" className={`btn ${styles.cancelBtn}`}>
            IR PARA LOGIN
          </Link>
          <button
            type="button"
            className={`btn btn-primary ${styles.submitBtn}`}
            onClick={handleResend}
            disabled={sending}
          >
            {sending ? "REENVIANDO..." : "REENVIAR E-MAIL"}
          </button>
        </div>
      </div>
    </div>
  );
}