import { Link, useParams } from "react-router-dom";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { userService } from "@/services/user-service";
import { LoadingState, ErrorState, NotFoundState } from "@/components";
import { useResource } from "@/hooks/useResource";
import { Card, buttonClasses } from "@/components/ui";
import UserRoleBadge from "./components/UserRoleBadge";

export default function UserDetailsPage() {
  const { t } = useTranslation(["users"]);
  const { id } = useParams<{ id: string }>();

  // Id não numérico nunca chega à API: é recurso inexistente.
  const userId = Number(id);
  const validId = Boolean(id) && !Number.isNaN(userId);
  const fetchUser = useCallback(() => userService.findById(userId), [userId]);
  const { state, reload } = useResource(validId ? fetchUser : null);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} onRetry={reload} />;
  if (state.status !== "success") {
    return (
      <NotFoundState
        backTo="/dashboard/users"
        backLabel={t("users:actions.back")}
        title={t("users:details.notFound")}
      />
    );
  }
  const user = state.data;

  return (
    <Card padding="lg" className="max-w-3xl flex flex-col gap-md">
      <div className="min-w-0">
        <h2 className="m-0 font-heading font-bold text-h2 text-foreground break-words">
          {user.firstName} {user.lastName}
        </h2>
        <p className="mt-xs mb-0 text-body text-foreground-muted break-words">{user.email}</p>
      </div>

      <div className="flex flex-col gap-xs">
        <span className="text-caption uppercase tracking-wider text-foreground-muted font-heading font-semibold">
          {t("users:fields.roles")}
        </span>
        {user.roles?.length ? (
          <div className="flex flex-wrap gap-xs">
            {user.roles.map((r) => (
              <UserRoleBadge key={r.id} role={r.authority} />
            ))}
          </div>
        ) : (
          <p className="m-0 text-small text-foreground-muted">—</p>
        )}
      </div>

      <div className="flex flex-wrap gap-sm pt-sm">
        <Link to={`/dashboard/users/${user.id}/edit`} className={buttonClasses("primary", "md")}>
          {t("users:actions.edit")}
        </Link>
        <Link to="/dashboard/users" className={buttonClasses("secondary", "md")}>
          {t("users:actions.back")}
        </Link>
      </div>
    </Card>
  );
}
