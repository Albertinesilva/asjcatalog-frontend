import { useParams } from "react-router-dom";
import ProductForm from "./ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductForm mode="edit" productId={id} />;
}