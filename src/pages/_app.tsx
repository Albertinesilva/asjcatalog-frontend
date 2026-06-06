import { useEffect } from "react";
import {BrowserRouter,Navigate,Outlet,Route,Routes,} from "react-router-dom";
import { Navbar, Sidebar } from "./components";
import { isAuthenticated } from "@/utils/auth";
import HomePage from "./routes";
import LoginPage from "./routes/admin.auth";
import RecoverPage from "./routes/admin.recover";
import RegisterPage from "./routes/admin.register";
import CatalogPage from "./routes/catalog.index";
import ProductDetails from "./routes/catalog.product.$product";
import ProductsAdminPage from "./routes/_authenticated/admin.products";
import NewProductPage from "./routes/_authenticated/admin.products.new";
import EditProductPage from "./routes/_authenticated/admin.products.$id";
import CategoriesAdminPage from "./routes/_authenticated/admin.categories";
import UsersAdminPage from "./routes/_authenticated/admin.users";

function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/admin/auth" replace />;
}

function AdminLayout() {
  return (
    <div className="d-flex flex-column flex-lg-row">
      <Sidebar />
      <div className="flex-grow-1">
        <Outlet />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1>404</h1>
      <p>Página não encontrada.</p>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    void import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/product/:product" element={<ProductDetails />} />
        <Route path="/admin/auth" element={<LoginPage />} />
        <Route path="/admin/recover" element={<RecoverPage />} />
        <Route path="/admin/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/products" replace />} />
            <Route path="products" element={<ProductsAdminPage />} />
            <Route path="products/new" element={<NewProductPage />} />
            <Route path="products/:id" element={<EditProductPage />} />
            <Route path="categories" element={<CategoriesAdminPage />} />
            <Route path="users" element={<UsersAdminPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}