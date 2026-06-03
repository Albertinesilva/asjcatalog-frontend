import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductItemAdmin } from "../../components";
import { api } from "../../lib/api";
import type { ProductsPage } from "../../lib/types";
import styles from "../../styles/pages/dashboardProducts.module.css";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsAdminPage,
});

function ProductsAdminPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const res = await api.get<ProductsPage>("/products", {
        params: { page: 0, size: 24, sort: "name,asc" },
      });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className={styles.productListContainer}>
      <Link to="/admin/products/new" className={`btn btn-primary ${styles.add}`}>
        Adicionar
      </Link>
      <div className="d-flex flex-column container-fluid">
        {isLoading && <p className="p-3">Carregando produtos...</p>}
        {isError && (
          <p className="p-3 text-danger">
            Erro ao carregar produtos: {(error as Error).message}
          </p>
        )}
        {data?.content.map((product) => (
          <ProductItemAdmin
            key={product.id}
            {...product}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}