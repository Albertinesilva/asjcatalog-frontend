import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "@/services/user-service";
import type { Role } from "@/types";

const AVAILABLE_ROLES: { id: number; authority: Role }[] = [
  { id: 1, authority: "ROLE_OPERATOR" },
  { id: 2, authority: "ROLE_ADMIN" },
];

type FormFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleIds: string[];
};

type Props = { mode: "create" | "edit" };

export default function UserForm({ mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roleIds: [],
    },
  });

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    userService
      .findById(Number(id))
      .then((u) =>
        reset({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          password: "",
          roleIds: u.roles.map((r) => String(r.id)),
        }),
      )
      .catch((err: Error) => setSaveError(err.message));
  }, [mode, id, reset]);

  const onSubmit = async (data: FormFields) => {
    setSaveError(null);
    const roles = data.roleIds.map((rid) => ({ id: Number(rid) }));
    try {
      if (mode === "create") {
        await userService.create({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          roles,
        });
      } else if (id) {
        await userService.update(Number(id), {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          roles,
        });
      }
      navigate("/admin/users");
    } catch (err) {
      setSaveError((err as Error).message);
    }
  };

  return (
    <div className="container py-4">
      <div className="card-base p-4 border-radius-10">
        <h3 className="mb-4">
          {mode === "create" ? "Adicionar Usuário" : "Editar Usuário"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nome</label>
              <input
                className="form-control"
                {...register("firstName", { required: "Nome é obrigatório" })}
              />
              {errors.firstName && (
                <small className="text-danger">
                  {errors.firstName.message}
                </small>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label">Sobrenome</label>
              <input
                className="form-control"
                {...register("lastName", {
                  required: "Sobrenome é obrigatório",
                })}
              />
              {errors.lastName && (
                <small className="text-danger">
                  {errors.lastName.message}
                </small>
              )}
            </div>
            <div className="col-12">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                {...register("email", { required: "Email é obrigatório" })}
              />
              {errors.email && (
                <small className="text-danger">{errors.email.message}</small>
              )}
            </div>
            {mode === "create" && (
              <div className="col-12">
                <label className="form-label">Senha</label>
                <input
                  type="password"
                  className="form-control"
                  {...register("password", {
                    required: "Senha é obrigatória",
                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                  })}
                />
                {errors.password && (
                  <small className="text-danger">
                    {errors.password.message}
                  </small>
                )}
              </div>
            )}
            <div className="col-12">
              <label className="form-label">Permissões</label>
              <select
                multiple
                className="form-select"
                size={AVAILABLE_ROLES.length}
                {...register("roleIds", {
                  validate: (v) =>
                    v.length > 0 || "Selecione pelo menos uma permissão",
                })}
              >
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.authority}
                  </option>
                ))}
              </select>
              {errors.roleIds && (
                <small className="text-danger">
                  {errors.roleIds.message as string}
                </small>
              )}
            </div>
          </div>
          {saveError && <p className="text-danger mt-3">Erro: {saveError}</p>}
          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/admin/users")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}