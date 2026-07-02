import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import { userService } from "@/services/user-service";
import { getApiErrorMessage } from "@/utils/api-errors";

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

function MetricCard({
  label,
  value,
  hint,
  loading,
  to,
}: {
  label: string;
  value: number | null;
  hint: string;
  loading: boolean;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="card-base border-radius-10 p-4 d-block text-decoration-none text-dark h-100"
    >
      <div className="text-muted text-uppercase small fw-bold mb-2">{label}</div>
      <div className="display-6 fw-bold mb-1" aria-live="polite">
        {loading ? "…" : (value ?? "—")}
      </div>
      <div className="text-muted small">{hint}</div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const [state, setState] = useState<MetricState>(INITIAL);

  const greetingName = user?.firstName ?? user?.email ?? "bem-vindo(a)";

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    const productsP = productService.findAll({ page: 0, size: 1 });
    const categoriesP = categoryService.findAll();
    const usersP = isAdmin
      ? userService.findAll({ page: 0, size: 1 })
      : Promise.resolve(null);

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
          error: getApiErrorMessage(err, "Não foi possível carregar as métricas."),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const shortcuts: { to: string; title: string; desc: string; show?: boolean }[] = [
    {
      to: "/admin/products/new",
      title: "Novo produto",
      desc: "Cadastrar um produto no catálogo.",
    },
    {
      to: "/admin/categories/new",
      title: "Nova categoria",
      desc: "Criar uma categoria para organizar produtos.",
    },
    {
      to: "/admin/users/new",
      title: "Novo usuário",
      desc: "Adicionar um novo usuário administrativo.",
      show: isAdmin,
    },
    {
      to: "/catalog",
      title: "Ver catálogo",
      desc: "Abrir a visão pública do catálogo.",
    },
  ].filter((i) => i.show !== false);

  return (
    <div className="container py-4">
      <h3 className="mb-1">Olá, {greetingName} 👋</h3>
      <p className="text-muted mb-4">Bem-vindo ao painel administrativo do ASJ Catalog.</p>

      {state.error && (
        <div className="alert alert-warning" role="alert">
          {state.error}
        </div>
      )}

      <section aria-labelledby="metrics-title" className="mb-4">
        <h5 id="metrics-title" className="fw-bold mb-3">
          Visão geral
        </h5>
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-lg-4">
            <MetricCard
              label="Produtos"
              value={state.products}
              hint="Total cadastrado no catálogo"
              loading={state.loading}
              to="/admin/products"
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <MetricCard
              label="Categorias"
              value={state.categories}
              hint="Categorias disponíveis"
              loading={state.loading}
              to="/admin/categories"
            />
          </div>
          {isAdmin && (
            <div className="col-12 col-sm-6 col-lg-4">
              <MetricCard
                label="Usuários"
                value={state.users}
                hint="Contas administrativas ativas"
                loading={state.loading}
                to="/admin/users"
              />
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="shortcuts-title">
        <h5 id="shortcuts-title" className="fw-bold mb-3">
          Atalhos
        </h5>
        <div className="row g-3">
          {shortcuts.map((i) => (
            <div key={i.to} className="col-12 col-sm-6 col-lg-3">
              <Link
                to={i.to}
                className="card-base border-radius-10 p-4 d-block text-decoration-none text-dark h-100"
              >
                <h6 className="fw-bold mb-2">{i.title}</h6>
                <p className="text-muted m-0 small">{i.desc}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
