import { Link } from "react-router-dom";
import { useRoles } from "@/hooks/useRoles";

export default function DashboardPage() {
  const { isAdmin } = useRoles();

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
      <h3 className="mb-4">Dashboard</h3>
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
