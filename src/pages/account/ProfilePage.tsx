import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user-service";
import { PasswordInput, LoadingState, ErrorState } from "@/components";
import { getApiErrorMessage } from "@/utils/api-errors";
import { alerts } from "@/utils/alerts";
import { Button, Card, Input } from "@/components/ui";
import { inputBaseClasses } from "@/components/ui/Input";

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
    return <LoadingState message="Carregando perfil..." />;
  }

  if (!user) {
    return <ErrorState message="Não foi possível carregar seu perfil." />;
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
      await alerts.success("Perfil atualizado", "Perfil atualizado com sucesso.");
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
      await alerts.success("Senha alterada", "Senha alterada com sucesso.");
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
    <div className="flex flex-col gap-lg">
      <p className="text-body text-foreground-muted m-0">
        Gerencie seus dados pessoais e credenciais de acesso.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <Card padding="lg" className="lg:col-span-7 flex flex-col gap-md">
          <h2 className="m-0 font-heading font-bold text-h3 text-foreground">Dados pessoais</h2>
          <form
            onSubmit={handleProfileSubmit(onSaveProfile)}
            noValidate
            className="flex flex-col gap-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <Input
                label="Nome"
                id="firstName"
                required
                error={profileErrors.firstName?.message}
                {...registerProfile("firstName", {
                  required: "Nome é obrigatório",
                  maxLength: { value: 100, message: "Máximo 100 caracteres" },
                })}
              />
              <Input
                label="Sobrenome"
                id="lastName"
                required
                error={profileErrors.lastName?.message}
                {...registerProfile("lastName", {
                  required: "Sobrenome é obrigatório",
                  maxLength: { value: 100, message: "Máximo 100 caracteres" },
                })}
              />
            </div>
            <Input
              label="Email"
              id="email"
              type="email"
              required
              error={profileErrors.email?.message}
              {...registerProfile("email", {
                required: "Email é obrigatório",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" },
                maxLength: { value: 255, message: "Máximo 255 caracteres" },
              })}
            />

            {profileFeedback && (
              <div
                role="status"
                className={
                  "rounded-md border px-md py-sm text-small " +
                  (profileFeedback.kind === "success"
                    ? "border-success/40 bg-success/10 text-foreground"
                    : "border-danger/40 bg-danger/10 text-danger")
                }
              >
                {profileFeedback.message}
              </div>
            )}

            <div className="pt-sm">
              <Button type="submit" variant="primary" loading={savingProfile}>
                {savingProfile ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </Card>

        <Card padding="lg" className="lg:col-span-5 flex flex-col gap-md">
          <h2 className="m-0 font-heading font-bold text-h3 text-foreground">Alterar senha</h2>
          <form
            onSubmit={handlePasswordSubmit(onChangePassword)}
            noValidate
            className="flex flex-col gap-md"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-small font-medium text-foreground">
                Nova senha{" "}
                <span aria-hidden="true" className="text-danger ml-0.5">
                  *
                </span>
              </label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                className={inputBaseClasses}
                {...registerPassword("password", {
                  required: "Informe a nova senha",
                  minLength: { value: 8, message: "Mínimo 8 caracteres" },
                  maxLength: { value: 72, message: "Máximo 72 caracteres" },
                  pattern: {
                    value: /^(?=.*\d).{8,}$/,
                    message:
                      "A senha deve ter no mínimo 8 caracteres e conter pelo menos um número",
                  },
                })}
              />
              {passwordErrors.password ? (
                <p className="text-small text-danger">{passwordErrors.password.message}</p>
              ) : (
                <p className="text-small text-foreground-muted">
                  A senha deve ter no mínimo 8 caracteres e conter pelo menos um número.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-small font-medium text-foreground">
                Confirmar senha{" "}
                <span aria-hidden="true" className="text-danger ml-0.5">
                  *
                </span>
              </label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                className={inputBaseClasses}
                {...registerPassword("confirmPassword", { required: "Confirme a nova senha" })}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-small text-danger">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            {passwordFeedback && (
              <div
                role="status"
                className={
                  "rounded-md border px-md py-sm text-small " +
                  (passwordFeedback.kind === "success"
                    ? "border-success/40 bg-success/10 text-foreground"
                    : "border-danger/40 bg-danger/10 text-danger")
                }
              >
                {passwordFeedback.message}
              </div>
            )}

            <div className="pt-sm">
              <Button type="submit" variant="primary" loading={savingPassword}>
                {savingPassword ? "Alterando..." : "Alterar senha"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
