import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ProductItem } from "../components";
import { api } from "../lib/api";
import type { ProductsPage } from "../lib/types";
import styles from "../styles/pages/catalog.module.css";

const productsQueryOptions = queryOptions({
  queryKey: ["catalog", "products", { page: 0, size: 12 }],
  queryFn: async () => {
    const res = await api.get<ProductsPage>("/products", {
      params: { page: 0, size: 12, sort: "name,asc" },
    });
    return res.data;
  },
});

export const Route = createFileRoute("/catalog/")({
  head: () => ({
    meta: [
      { title: "Catálogo — DS Catalog" },
      {
        name: "description",
        content: "Explore o catálogo completo de produtos.",
      },
    ],
  }),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(productsQueryOptions),
  component: CatalogPage,
});

function CatalogPage() {
  const { data } = useSuspenseQuery(productsQueryOptions);
  return (
    <div className="container">
      <h3 className="my-4">Catálogo de Produtos</h3>
      <div className={styles.catalogProducts}>
        {data.content.map((product) => (
          <ProductItem key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}