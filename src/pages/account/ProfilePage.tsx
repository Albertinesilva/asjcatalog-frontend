import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user-service";
import { PasswordInput, LoadingState, ErrorState } from "@/components";
import { getApiErrorMessage } from "@/utils/api-errors";

type ProfileFields = {
  firstName: string;
  lastName: string;
  email: string;
};

type PasswordFields = {
  password: string;
  confirmPassword: string;
};

type Feedback = { kind: "success" | "error"; message: string } | null;

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  const profileForm = useForm<ProfileFields>({
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  const passwordForm = useForm<PasswordFields>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
      });
    }
  }, [user, profileForm]);

  if (loading && !user) {
    return (
      <div className="container py-4">
        <LoadingState label="Carregando perfil..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-4">
        <ErrorState message="Não foi possível carregar seu perfil." />
      </div>
    );
  }

  const currentRoleIds = (user.roles ?? []).map((r) => r.id);

  const onSaveProfile = async (data: ProfileFields) => {
    setProfileFeedback(null);
    try {
      await userService.update(user.id, {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        roleIds: currentRoleIds,
      });
      await refreshUser();
      setProfileFeedback({ kind: "success", message: "Perfil atualizado com sucesso." });
    } catch (err) {
      setProfileFeedback({
        kind: "error",
        message: getApiErrorMessage(err, "Não foi possível atualizar o perfil."),
      });
    }
  };

  const onChangePassword = async (data: PasswordFields) => {
    setPasswordFeedback(null);
    if (data.password !== data.confirmPassword) {
      setPasswordFeedback({ kind: "error", message: "As senhas não coincidem." });
      return;
    }
    try {
      await userService.update(user.id, {
        password: data.password,
        roleIds: currentRoleIds,
      });
      passwordForm.reset({ password: "", confirmPassword: "" });
      setPasswordFeedback({ kind: "success", message: "Senha alterada com sucesso." });
    } catch (err) {
      setPasswordFeedback({
        kind: "error",
        message: getApiErrorMessage(err, "Não foi possível alterar a senha."),
      });
    }
  };

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = profileForm;

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = passwordForm;

  return (
    <div className="container py-4">
      <h3 className="mb-1">Meu Perfil</h3>
      <p className="text-muted mb-4">Gerencie seus dados pessoais e credenciais de acesso.</p>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card-base border-radius-10 p-4">
            <h5 className="fw-bold mb-3">Dados pessoais</h5>
            <form onSubmit={handleProfileSubmit(onSaveProfile)} noValidate>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="firstName">
                    Nome
                  </label>
                  <input
                    id="firstName"
                    className="form-control"
                    {...registerProfile("firstName", {
                      required: "Nome é obrigatório",
                      maxLength: { value: 100, message: "Máximo 100 caracteres" },
                    })}
                  />
                  {profileErrors.firstName && (
                    <small className="text-danger">{profileErrors.firstName.message}</small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="lastName">
                    Sobrenome
                  </label>
                  <input
                    id="lastName"
                    className="form-control"
                    {...registerProfile("lastName", {
                      required: "Sobrenome é obrigatório",
                      maxLength: { value: 100, message: "Máximo 100 caracteres" },
                    })}
                  />
                  {profileErrors.lastName && (
                    <small className="text-danger">{profileErrors.lastName.message}</small>
                  )}
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    {...registerProfile("email", {
                      required: "Email é obrigatório",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Email inválido",
                      },
                      maxLength: { value: 255, message: "Máximo 255 caracteres" },
                    })}
                  />
                  {profileErrors.email && (
                    <small className="text-danger">{profileErrors.email.message}</small>
                  )}
                </div>
              </div>

              {profileFeedback && (
                <div
                  className={`alert mt-3 mb-0 ${
                    profileFeedback.kind === "success" ? "alert-success" : "alert-danger"
                  }`}
                  role="status"
                >
                  {profileFeedback.message}
                </div>
              )}

              <div className="mt-4">
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card-base border-radius-10 p-4">
            <h5 className="fw-bold mb-3">Alterar senha</h5>
            <form onSubmit={handlePasswordSubmit(onChangePassword)} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="password">
                  Nova senha
                </label>
                <PasswordInput
                  id="password"
                  className="form-control"
                  autoComplete="new-password"
                  {...registerPassword("password", {
                    required: "Informe a nova senha",
                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                    maxLength: { value: 72, message: "Máximo 72 caracteres" },
                  })}
                />
                {passwordErrors.password && (
                  <small className="text-danger">{passwordErrors.password.message}</small>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirmar senha
                </label>
                <PasswordInput
                  id="confirmPassword"
                  className="form-control"
                  autoComplete="new-password"
                  {...registerPassword("confirmPassword", {
                    required: "Confirme a nova senha",
                  })}
                />
                {passwordErrors.confirmPassword && (
                  <small className="text-danger">{passwordErrors.confirmPassword.message}</small>
                )}
              </div>

              {passwordFeedback && (
                <div
                  className={`alert mt-3 mb-0 ${
                    passwordFeedback.kind === "success" ? "alert-success" : "alert-danger"
                  }`}
                  role="status"
                >
                  {passwordFeedback.message}
                </div>
              )}

              <div className="mt-4">
                <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                  {savingPassword ? "Alterando..." : "Alterar senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}