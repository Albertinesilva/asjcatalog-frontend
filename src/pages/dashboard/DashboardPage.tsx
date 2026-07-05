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

  const greetingName = user?.firstName ?? user?.email ?? "usuário(a)";

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
      to: "/dashboard/products/new",
      title: "Novo produto",
      desc: "Adicionar um novo produto ao catálogo.",
    },
    {
      to: "/dashboard/categories/new",
      title: "Nova categoria",
      desc: "Criar uma categoria para organizar o catálogo.",
    },
    {
      to: "/dashboard/users/new",
      title: "Novo usuário",
      desc: "Cadastrar um usuário com acesso à plataforma.",
      show: isAdmin,
    },
    {
      to: "/catalog",
      title: "Ver catálogo público",
      desc: "Visualizar o catálogo como um visitante.",
    },
  ].filter((i) => i.show !== false);

  return (
    <div>
      <p className="text-muted mb-4">
        Olá, {greetingName}. Bem-vindo(a) ao painel de gestão do ASJ Catalog.
      </p>

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
              to="/dashboard/products"
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <MetricCard
              label="Categorias"
              value={state.categories}
              hint="Categorias disponíveis"
              loading={state.loading}
              to="/dashboard/categories"
            />
          </div>
          {isAdmin && (
            <div className="col-12 col-sm-6 col-lg-4">
              <MetricCard
                label="Usuários"
                value={state.users}
                hint="Contas administrativas ativas"
                loading={state.loading}
                to="/dashboard/users"
              />
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="shortcuts-title" className="mb-4">
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

      <section aria-labelledby="activity-title">
        <h5 id="activity-title" className="fw-bold mb-3">
          Atividade recente
        </h5>
        <div className="card-base border-radius-10 p-4 text-muted">
          <p className="mb-1 fw-semibold">Acompanhamento em preparação</p>
          <p className="m-0 small">
            Em breve esta área exibirá o histórico de alterações no catálogo, cadastros
            recentes e notificações da plataforma.
          </p>
        </div>
      </section>
    </div>
  );
}
