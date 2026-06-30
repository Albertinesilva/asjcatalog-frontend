import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAdmin } = useRoles();

  const greetingName = user?.firstName ?? user?.email ?? "bem-vindo(a)";

  const items: { to: string; title: string; desc: string; show?: boolean }[] = [
    {
      to: "/admin/products",
      title: "Produtos",
      desc: "Listar, criar, editar e excluir produtos.",
    },
    {
      to: "/admin/categories",
      title: "Categorias",
      desc: "Gerenciar categorias do catálogo.",
    },
    {
      to: "/admin/users",
      title: "Usuários",
      desc: "Gerenciar usuários e permissões.",
      show: isAdmin,
    },
  ];

  return (
    <div className="container py-4">
      <h3 className="mb-1">Olá, {greetingName} 👋</h3>
      <p className="text-muted mb-4">Bem-vindo ao painel administrativo do ASJ Catalog.</p>
      <div className="row g-3">
        {items
          .filter((i) => i.show !== false)
          .map((i) => (
            <div key={i.to} className="col-md-4">
              <Link
                to={i.to}
                className="card-base border-radius-10 p-4 d-block text-decoration-none text-dark h-100"
              >
                <h5 className="fw-bold mb-2">{i.title}</h5>
                <p className="text-muted m-0">{i.desc}</p>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}
