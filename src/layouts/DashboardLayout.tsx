import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navbar, Sidebar } from "@/components";

type Crumb = { label: string; to?: string };

function resolveBreadcrumb(
  pathname: string,
  t: (k: string) => string,
): { title: string; crumbs: Crumb[] } {
  const base: Crumb = { label: t("navigation:breadcrumbs.root"), to: "/dashboard" };

  // Products
  if (pathname.startsWith("/dashboard/products/new")) {
    return {
      title: t("navigation:breadcrumbs.titles.productNew"),
      crumbs: [
        base,
        { label: t("navigation:breadcrumbs.products"), to: "/dashboard/products" },
        { label: t("navigation:breadcrumbs.new") },
      ],
    };
  }
  if (/^\/dashboard\/products\/\d+/.test(pathname)) {
    return {
      title: t("navigation:breadcrumbs.titles.productEdit"),
      crumbs: [
        base,
        { label: t("navigation:breadcrumbs.products"), to: "/dashboard/products" },
        { label: t("navigation:breadcrumbs.edit") },
      ],
    };
  }
  if (pathname.startsWith("/dashboard/products")) {
    return {
      title: t("navigation:breadcrumbs.titles.products"),
      crumbs: [base, { label: t("navigation:breadcrumbs.products") }],
    };
  }

  // Categories
  if (pathname.startsWith("/dashboard/categories/new")) {
    return {
      title: t("navigation:breadcrumbs.titles.categoryNew"),
      crumbs: [
        base,
        { label: t("navigation:breadcrumbs.categories"), to: "/dashboard/categories" },
        { label: t("navigation:breadcrumbs.newFem") },
      ],
    };
  }
  if (/^\/dashboard\/categories\/\d+/.test(pathname)) {
    return {
      title: t("navigation:breadcrumbs.titles.categoryEdit"),
      crumbs: [
        base,
        { label: t("navigation:breadcrumbs.categories"), to: "/dashboard/categories" },
        { label: t("navigation:breadcrumbs.edit") },
      ],
    };
  }
  if (pathname.startsWith("/dashboard/categories")) {
    return {
      title: t("navigation:breadcrumbs.titles.categories"),
      crumbs: [base, { label: t("navigation:breadcrumbs.categories") }],
    };
  }

  // Users
  if (pathname.startsWith("/dashboard/users/new")) {
    return {
      title: t("navigation:breadcrumbs.titles.userNew"),
      crumbs: [
        base,
        { label: t("navigation:breadcrumbs.users"), to: "/dashboard/users" },
        { label: t("navigation:breadcrumbs.new") },
      ],
    };
  }
  if (/^\/dashboard\/users\/\d+\/edit/.test(pathname)) {
    return {
      title: t("navigation:breadcrumbs.titles.userEdit"),
      crumbs: [
        base,
        { label: t("navigation:breadcrumbs.users"), to: "/dashboard/users" },
        { label: t("navigation:breadcrumbs.edit") },
      ],
    };
  }
  if (/^\/dashboard\/users\/\d+/.test(pathname)) {
    return {
      title: t("navigation:breadcrumbs.titles.userDetails"),
      crumbs: [
        base,
        { label: t("navigation:breadcrumbs.users"), to: "/dashboard/users" },
        { label: t("navigation:breadcrumbs.details") },
      ],
    };
  }
  if (pathname.startsWith("/dashboard/users")) {
    return {
      title: t("navigation:breadcrumbs.titles.users"),
      crumbs: [base, { label: t("navigation:breadcrumbs.users") }],
    };
  }

  // Profile
  if (pathname.startsWith("/account/profile")) {
    return {
      title: t("navigation:breadcrumbs.titles.profile"),
      crumbs: [base, { label: t("navigation:breadcrumbs.profile") }],
    };
  }

  return {
    title: t("navigation:breadcrumbs.titles.dashboard"),
    crumbs: [{ label: t("navigation:breadcrumbs.root") }],
  };
}

/**
 * DashboardLayout — Fase 10.3.
 *
 * Modernizado para linguagem SaaS: shell em `bg-background`, sidebar
 * lateral no desktop, header dedicado com breadcrumb elegante e área
 * principal com largura controlada. Sem Bootstrap. Sem CSS Module.
 * O contrato (Navbar + Sidebar + Outlet + breadcrumb) foi preservado.
 */
export default function DashboardLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { title, crumbs } = resolveBreadcrumb(pathname, t);
  const year = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex flex-col flex-1 min-w-0">
          <header className="bg-surface border-b border-border px-md py-md lg:px-xl lg:py-lg">
            <nav
              aria-label={t("navigation:breadcrumbs.label", { defaultValue: "Breadcrumb" })}
              className="flex flex-wrap items-center gap-xs text-caption uppercase tracking-wider text-foreground-muted"
            >
              {crumbs.map((c, i) => (
                <span key={`${c.label}-${i}`} className="inline-flex items-center gap-xs">
                  {i > 0 && (
                    <span aria-hidden className="text-border">
                      /
                    </span>
                  )}
                  {c.to ? (
                    <Link
                      to={c.to}
                      className="text-foreground-muted transition-colors duration-DEFAULT ease-standard hover:text-accent focus-visible:outline-none focus-visible:text-accent"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
            <div className="mt-sm flex flex-col md:flex-row md:items-center md:justify-between gap-sm">
              <h1 className="font-heading text-h2 text-foreground m-0">{title}</h1>
            </div>
          </header>

          <section className="flex-1 px-md py-md lg:px-xl lg:py-xl">
            <div className="mx-auto w-full max-w-[1200px]">
              <Outlet />
            </div>
          </section>

          <footer className="bg-surface border-t border-border px-md py-md lg:px-xl text-center text-caption text-foreground-muted">
            {t("navigation:footer", { year })}
          </footer>
        </main>
      </div>
    </div>
  );
}
