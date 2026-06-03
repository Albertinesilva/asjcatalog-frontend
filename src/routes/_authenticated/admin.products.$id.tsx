import { createFileRoute } from "@tanstack/react-router";
import ProductForm from "../../features/admin/ProductForm";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  return <ProductForm mode="edit" productId={id} />;
}