import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProductItemAdmin } from "@/components";
import { productService } from "@/services/product-service";
import type { Product, SpringPage } from "@/types";
import styles from "@/styles/pages/dashboardProducts.module.css";

export default function ProductListPage() {
  const [data, setData] = useState<SpringPage<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = () => {
    setIsLoading(true);
    productService
      .findAll({ page: 0, size: 24 })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadProducts, []);

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      productService
        .delete(id)
        .then(loadProducts)
        .catch((err: Error) => setError(err.message));
    }
  };

  return (
    <div className={styles.productListContainer}>
      <Link
        to="/admin/products/new"
        className={`btn btn-primary ${styles.add}`}
      >
        Adicionar
      </Link>
      <div className="d-flex flex-column container-fluid">
        {isLoading && <p className="p-3">Carregando produtos...</p>}
        {error && (
          <p className="p-3 text-danger">
            Erro ao carregar produtos: {error}
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