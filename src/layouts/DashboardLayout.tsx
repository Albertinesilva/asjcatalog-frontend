import { Link, Outlet, useLocation } from "react-router-dom";
import { Navbar, Sidebar } from "@/components";
import styles from "./dashboardLayout.module.css";

type Crumb = { label: string; to?: string };

function resolveBreadcrumb(pathname: string): { title: string; crumbs: Crumb[] } {
  const base: Crumb = { label: "Dashboard", to: "/dashboard" };

  // Products
  if (pathname.startsWith("/dashboard/products/new")) {
    return { title: "Novo produto", crumbs: [base, { label: "Produtos", to: "/dashboard/products" }, { label: "Novo" }] };
  }
  if (/^\/dashboard\/products\/\d+/.test(pathname)) {
    return { title: "Editar produto", crumbs: [base, { label: "Produtos", to: "/dashboard/products" }, { label: "Editar" }] };
  }
  if (pathname.startsWith("/dashboard/products")) {
    return { title: "Produtos", crumbs: [base, { label: "Produtos" }] };
  }

  // Categories
  if (pathname.startsWith("/dashboard/categories/new")) {
    return { title: "Nova categoria", crumbs: [base, { label: "Categorias", to: "/dashboard/categories" }, { label: "Nova" }] };
  }
  if (/^\/dashboard\/categories\/\d+/.test(pathname)) {
    return { title: "Editar categoria", crumbs: [base, { label: "Categorias", to: "/dashboard/categories" }, { label: "Editar" }] };
  }
  if (pathname.startsWith("/dashboard/categories")) {
    return { title: "Categorias", crumbs: [base, { label: "Categorias" }] };
  }

  // Users
  if (pathname.startsWith("/dashboard/users/new")) {
    return { title: "Novo usuário", crumbs: [base, { label: "Usuários", to: "/dashboard/users" }, { label: "Novo" }] };
  }
  if (/^\/dashboard\/users\/\d+\/edit/.test(pathname)) {
    return { title: "Editar usuário", crumbs: [base, { label: "Usuários", to: "/dashboard/users" }, { label: "Editar" }] };
  }
  if (/^\/dashboard\/users\/\d+/.test(pathname)) {
    return { title: "Detalhes do usuário", crumbs: [base, { label: "Usuários", to: "/dashboard/users" }, { label: "Detalhes" }] };
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

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const { title, crumbs } = resolveBreadcrumb(pathname);
  const year = new Date().getFullYear();

  return (
    <div className={styles.shell}>
      <Navbar />
      <div className={`${styles.body} d-flex flex-column flex-lg-row`}>
        <Sidebar />
        <main className={styles.main}>
          <header className={styles.header}>
            <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
              {crumbs.map((c, i) => (
                <span key={`${c.label}-${i}`}>
                  {i > 0 && <span className={styles.sep}>/</span>}
                  {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
                </span>
              ))}
            </nav>
            <div className={styles.headerRow}>
              <h1 className={styles.title}>{title}</h1>
            </div>
          </header>
          <section className={styles.content}>
            <Outlet />
          </section>
          <footer className={styles.footer}>ASJ Catalog · © {year}</footer>
        </main>
      </div>
    </div>
  );
}
