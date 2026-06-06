import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function PrivateRoute() {
  const { authenticated } = useAuth();
  const location = useLocation();

  if (!authenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }
  return <Outlet />;
}