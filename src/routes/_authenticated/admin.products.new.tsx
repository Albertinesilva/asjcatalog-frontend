import { createFileRoute } from "@tanstack/react-router";
import ProductForm from "../../features/admin/ProductForm";

export const Route = createFileRoute("/_authenticated/admin/products/new")({
  component: () => <ProductForm mode="create" />,
});