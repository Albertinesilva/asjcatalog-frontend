import { Navigate, Route, Routes } from "react-router-dom";

import CatalogLayout from "@/layouts/CatalogLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";

import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/catalog/CatalogPage";
import ProductDetailsPage from "@/pages/catalog/ProductDetailsPage";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import RecoverPage from "@/pages/auth/RecoverPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import ActivationPendingPage from "@/pages/auth/ActivationPendingPage";
import ActivateAccountPage from "@/pages/auth/ActivateAccountPage";

import DashboardPage from "@/pages/admin/DashboardPage";
import ProductListPage from "@/pages/admin/products/ProductListPage";
import ProductForm from "@/pages/admin/products/ProductForm";
import CategoryListPage from "@/pages/admin/categories/CategoryListPage";
import CategoryForm from "@/pages/admin/categories/CategoryForm";
import UserListPage from "@/pages/admin/users/UserListPage";
import UserForm from "@/pages/admin/users/UserForm";
import UserDetailsPage from "@/pages/admin/users/UserDetailsPage";
import ProfilePage from "@/pages/account/ProfilePage";

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1>404</h1>
      <p>Página não encontrada.</p>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CatalogLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/:productId" element={<ProductDetailsPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/recover" element={<RecoverPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/activation-pending" element={<ActivationPendingPage />} />
        <Route path="/activate-account" element={<ActivateAccountPage />} />
        <Route path="/activation-pending" element={<ActivationPendingPage />} />
        <Route path="/forgot-password" element={<RecoverPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/admin/auth" element={<Navigate to="/auth/login" replace />} />
      <Route path="/admin/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="/admin/recover" element={<Navigate to="/auth/recover" replace />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
          <Route path="/admin/products" element={<ProductListPage />} />
          <Route path="/admin/products/new" element={<ProductForm mode="create" />} />
          <Route path="/admin/products/:id" element={<ProductForm mode="edit" />} />
          <Route path="/admin/categories" element={<CategoryListPage />} />
          <Route path="/admin/categories/new" element={<CategoryForm mode="create" />} />
          <Route path="/admin/categories/:id" element={<CategoryForm mode="edit" />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin/users" element={<UserListPage />} />
            <Route path="/admin/users/new" element={<UserForm mode="create" />} />
            <Route path="/admin/users/:id" element={<UserDetailsPage />} />
            <Route path="/admin/users/:id/edit" element={<UserForm mode="edit" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
