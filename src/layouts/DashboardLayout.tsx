import { Link, Outlet, useLocation } from "react-router-dom";
import { Navbar, Sidebar } from "@/components";

type Crumb = { label: string; to?: string };

function resolveBreadcrumb(pathname: string): { title: string; crumbs: Crumb[] } {
  const base: Crumb = { label: "Dashboard", to: "/dashboard" };

  // Products
  if (pathname.startsWith("/dashboard/products/new")) {
    return {
      title: "Novo produto",
      crumbs: [base, { label: "Produtos", to: "/dashboard/products" }, { label: "Novo" }],
    };
  }
  if (/^\/dashboard\/products\/\d+/.test(pathname)) {
    return {
      title: "Editar produto",
      crumbs: [base, { label: "Produtos", to: "/dashboard/products" }, { label: "Editar" }],
    };
  }
  if (pathname.startsWith("/dashboard/products")) {
    return { title: "Produtos", crumbs: [base, { label: "Produtos" }] };
  }

  // Categories
  if (pathname.startsWith("/dashboard/categories/new")) {
    return {
      title: "Nova categoria",
      crumbs: [base, { label: "Categorias", to: "/dashboard/categories" }, { label: "Nova" }],
    };
  }
  if (/^\/dashboard\/categories\/\d+/.test(pathname)) {
    return {
      title: "Editar categoria",
      crumbs: [base, { label: "Categorias", to: "/dashboard/categories" }, { label: "Editar" }],
    };
  }
  if (pathname.startsWith("/dashboard/categories")) {
    return { title: "Categorias", crumbs: [base, { label: "Categorias" }] };
  }

  // Users
  if (pathname.startsWith("/dashboard/users/new")) {
    return {
      title: "Novo usuário",
      crumbs: [base, { label: "Usuários", to: "/dashboard/users" }, { label: "Novo" }],
    };
  }
  if (/^\/dashboard\/users\/\d+\/edit/.test(pathname)) {
    return {
      title: "Editar usuário",
      crumbs: [base, { label: "Usuários", to: "/dashboard/users" }, { label: "Editar" }],
    };
  }
  if (/^\/dashboard\/users\/\d+/.test(pathname)) {
    return {
      title: "Detalhes do usuário",
      crumbs: [base, { label: "Usuários", to: "/dashboard/users" }, { label: "Detalhes" }],
    };
  }
  if (pathname.startsWith("/dashboard/users")) {
    return { title: "Usuários", crumbs: [base, { label: "Usuários" }] };
  }

  // Profile
  if (pathname.startsWith("/account/profile")) {
    return { title: "Meu Perfil", crumbs: [base, { label: "Meu Perfil" }] };
  }

  return { title: "Dashboard", crumbs: [{ label: "Dashboard" }] };
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
  const { pathname } = useLocation();
  const { title, crumbs } = resolveBreadcrumb(pathname);
  const year = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex flex-col flex-1 min-w-0">
          <header className="bg-surface border-b border-border px-md py-md lg:px-xl lg:py-lg">
            <nav
              aria-label="Breadcrumb"
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
            ASJ Catalog · © {year}
          </footer>
        </main>
      </div>
    </div>
  );
}
