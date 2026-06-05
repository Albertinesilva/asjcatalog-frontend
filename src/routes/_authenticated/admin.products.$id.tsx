import { useParams } from "react-router-dom";
import ProductForm from "../../features/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductForm mode="edit" productId={id} />;
}