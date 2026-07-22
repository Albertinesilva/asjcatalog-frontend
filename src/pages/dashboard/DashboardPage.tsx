import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import { userService } from "@/services/user-service";
import { getApiErrorMessage } from "@/utils/api-error";
import { Badge, Card } from "@/components/ui";

type MetricState = {
  products: number | null;
  categories: number | null;
  users: number | null;
  loading: boolean;
  error: string | null;
};

const INITIAL: MetricState = {
  products: null,
  categories: null,
  users: null,
  loading: true,
  error: null,
};

type IconName = "box" | "tag" | "users" | "plus" | "eye";

const Icon = ({ name, className = "" }: { name: IconName; className?: string }) => {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  switch (name) {
    case "box":
      return (
        <svg {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
  }
};

function MetricCard({
  label,
  value,
  hint,
  loading,
  to,
  icon,
}: {
  label: string;
  value: number | null;
  hint: string;
  loading: boolean;
  to: string;
  icon: IconName;
}) {
  return (
    <Link
      to={to}
      className="group block rounded-lg border border-border bg-card text-card-foreground shadow-md p-lg transition-all duration-DEFAULT ease-standard hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-start justify-between mb-md">
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <span className="font-heading text-caption uppercase tracking-wider text-foreground-muted">
          {label}
        </span>
      </div>
      <div className="font-heading text-h1 text-foreground leading-none" aria-live="polite">
        {loading ? "…" : (value ?? "—")}
      </div>
      <p className="mt-xs text-small text-foreground-muted m-0">{hint}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation(["dashboard", "common"]);
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const [state, setState] = useState<MetricState>(INITIAL);

  const greetingName = user?.firstName ?? user?.email ?? t("dashboard:greetingFallback");

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    const productsP = productService.findAll({ page: 0, size: 1 });
    const categoriesP = categoryService.findAll();
    const usersP = isAdmin ? userService.findAll({ page: 0, size: 1 }) : Promise.resolve(null);

    Promise.all([productsP, categoriesP, usersP])
      .then(([products, categories, users]) => {
        if (cancelled) return;
        setState({
          products: products.totalElements,
          categories: categories.length,
          users: users ? users.totalElements : null,
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          products: null,
          categories: null,
          users: null,
          loading: false,
          error: getApiErrorMessage(err, t("dashboard:metricsError")),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, t]);

  type Shortcut = { to: string; titleKey: string; descKey: string; icon: IconName; show?: boolean };
  const shortcuts: Shortcut[] = (
    [
      {
        to: "/dashboard/products/new",
        titleKey: "dashboard:shortcuts.newProduct.title",
        descKey: "dashboard:shortcuts.newProduct.desc",
        icon: "plus" as IconName,
      },
      {
        to: "/dashboard/categories/new",
        titleKey: "dashboard:shortcuts.newCategory.title",
        descKey: "dashboard:shortcuts.newCategory.desc",
        icon: "tag" as IconName,
      },
      {
        to: "/dashboard/users/new",
        titleKey: "dashboard:shortcuts.newUser.title",
        descKey: "dashboard:shortcuts.newUser.desc",
        icon: "users" as IconName,
        show: isAdmin,
      },
      {
        to: "/catalog",
        titleKey: "dashboard:shortcuts.viewCatalog.title",
        descKey: "dashboard:shortcuts.viewCatalog.desc",
        icon: "eye" as IconName,
      },
    ] as Shortcut[]
  ).filter((i) => i.show !== false);

  return (
    <div className="flex flex-col gap-xl">
      <p className="text-body text-foreground-muted m-0">
        {t("dashboard:greeting", { name: greetingName })}
      </p>

      {state.error && (
        <Card padding="md" className="border-warning/40 bg-warning/10">
          <p className="m-0 text-small text-foreground">{state.error}</p>
        </Card>
      )}

      <section aria-labelledby="metrics-title" className="flex flex-col gap-md">
        <h2 id="metrics-title" className="font-heading font-bold text-h3 text-foreground m-0">
          {t("dashboard:metricsTitle")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          <MetricCard
            label={t("dashboard:cards.products")}
            value={state.products}
            hint={t("dashboard:hints.products")}
            loading={state.loading}
            to="/dashboard/products"
            icon="box"
          />
          <MetricCard
            label={t("dashboard:cards.categories")}
            value={state.categories}
            hint={t("dashboard:hints.categories")}
            loading={state.loading}
            to="/dashboard/categories"
            icon="tag"
          />
          {isAdmin && (
            <MetricCard
              label={t("dashboard:cards.users")}
              value={state.users}
              hint={t("dashboard:hints.users")}
              loading={state.loading}
              to="/dashboard/users"
              icon="users"
            />
          )}
        </div>
      </section>

      <section aria-labelledby="shortcuts-title" className="flex flex-col gap-md">
        <h2 id="shortcuts-title" className="font-heading font-bold text-h3 text-foreground m-0">
          {t("dashboard:shortcutsTitle")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {shortcuts.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              className="group block rounded-lg border border-border bg-card text-card-foreground shadow-md p-lg transition-all duration-DEFAULT ease-standard hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground mb-md">
                <Icon name={i.icon} className="h-5 w-5" />
              </span>
              <h3 className="font-heading font-semibold text-subtitle text-foreground m-0 mb-xs">
                {t(i.titleKey)}
              </h3>
              <p className="text-small text-foreground-muted m-0">{t(i.descKey)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="activity-title" className="flex flex-col gap-md">
        <div className="flex items-center gap-sm">
          <h2 id="activity-title" className="font-heading font-bold text-h3 text-foreground m-0">
            {t("dashboard:activityTitle")}
          </h2>
          <Badge variant="outline">{t("dashboard:activitySoon")}</Badge>
        </div>
        <Card padding="lg">
          <p className="mb-xs font-heading font-semibold text-subtitle text-foreground">
            {t("dashboard:activityPreparing")}
          </p>
          <p className="m-0 text-small text-foreground-muted">
            {t("dashboard:activityDescription")}
          </p>
        </Card>
      </section>
    </div>
  );
}
