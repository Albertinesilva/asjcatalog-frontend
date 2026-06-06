import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";

export default function AdminRoute() {
  const { authenticated } = useAuth();
  const { isAdmin } = useRoles();

  if (!authenticated) return <Navigate to="/auth/login" replace />;
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return <Outlet />;
}