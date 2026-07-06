import { Navigate, Route, Routes } from "react-router-dom";

import CatalogLayout from "@/layouts/CatalogLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
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

import DashboardPage from "@/pages/dashboard/DashboardPage";
import ProductListPage from "@/pages/dashboard/products/ProductListPage";
import ProductForm from "@/pages/dashboard/products/ProductForm";
import CategoryListPage from "@/pages/dashboard/categories/CategoryListPage";
import CategoryForm from "@/pages/dashboard/categories/CategoryForm";
import UserListPage from "@/pages/dashboard/users/UserListPage";
import UserForm from "@/pages/dashboard/users/UserForm";
import UserDetailsPage from "@/pages/dashboard/users/UserDetailsPage";
import ProfilePage from "@/pages/account/ProfilePage";

function NotFound() {
  return (
    <div className="mx-auto max-w-[720px] py-3xl px-md text-center flex flex-col items-center gap-md animate-fade-in">
      <h1 className="font-heading text-display text-primary m-0">404</h1>
      <p className="text-body text-foreground-muted m-0">
        A página solicitada não existe ou foi movida no ASJ Catalog.
      </p>
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

      {/* Compatibilidade temporária: rotas legadas /admin/* redirecionam para /dashboard/* */}
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin/products/*" element={<Navigate to="/dashboard/products" replace />} />
      <Route path="/admin/categories/*" element={<Navigate to="/dashboard/categories" replace />} />
      <Route path="/admin/users/*" element={<Navigate to="/dashboard/users" replace />} />

      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route path="/dashboard/products" element={<ProductListPage />} />
          <Route path="/dashboard/products/new" element={<ProductForm mode="create" />} />
          <Route path="/dashboard/products/:id" element={<ProductForm mode="edit" />} />
          <Route path="/dashboard/categories" element={<CategoryListPage />} />
          <Route path="/dashboard/categories/new" element={<CategoryForm mode="create" />} />
          <Route path="/dashboard/categories/:id" element={<CategoryForm mode="edit" />} />

          <Route element={<AdminRoute />}>
            <Route path="/dashboard/users" element={<UserListPage />} />
            <Route path="/dashboard/users/new" element={<UserForm mode="create" />} />
            <Route path="/dashboard/users/:id" element={<UserDetailsPage />} />
            <Route path="/dashboard/users/:id/edit" element={<UserForm mode="edit" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
