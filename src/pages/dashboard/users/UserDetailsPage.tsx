import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { userService } from "@/services/user-service";
import { LoadingState, ErrorState } from "@/components";
import { getApiErrorMessage } from "@/utils/api-error";
import type { UserDetails } from "@/types";
import { Card, buttonClasses } from "@/components/ui";
import UserRoleBadge from "./components/UserRoleBadge";

export default function UserDetailsPage() {
  const { t } = useTranslation(["users"]);
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    userService
      .findById(Number(id))
      .then(setUser)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [id]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!user) return null;

  return (
    <Card padding="lg" className="max-w-3xl flex flex-col gap-md">
      <div>
        <h2 className="m-0 font-heading font-bold text-h2 text-foreground">
          {user.firstName} {user.lastName}
        </h2>
        <p className="mt-xs mb-0 text-body text-foreground-muted">{user.email}</p>
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
