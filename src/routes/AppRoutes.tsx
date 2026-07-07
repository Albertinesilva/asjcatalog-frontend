import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import CatalogLayout from "@/layouts/CatalogLayout";
import AuthLayout from "@/layouts/AuthLayout";

import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";

import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/catalog/CatalogPage";
import ProductDetailsPage from "@/pages/catalog/ProductDetailsPage";

import { LoadingState } from "@/components";
import NotFoundPage from "@/pages/NotFoundPage";

// Lazy-loaded chunks: authenticated area and auth flow are loaded on demand
// to keep the initial bundle focused on the public catalog experience.
const DashboardLayout = lazy(() => import("@/layouts/DashboardLayout"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const RecoverPage = lazy(() => import("@/pages/auth/RecoverPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const ActivationPendingPage = lazy(() => import("@/pages/auth/ActivationPendingPage"));
const ActivateAccountPage = lazy(() => import("@/pages/auth/ActivateAccountPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const ProductListPage = lazy(() => import("@/pages/dashboard/products/ProductListPage"));
const ProductForm = lazy(() => import("@/pages/dashboard/products/ProductForm"));
const CategoryListPage = lazy(() => import("@/pages/dashboard/categories/CategoryListPage"));
const CategoryForm = lazy(() => import("@/pages/dashboard/categories/CategoryForm"));
const UserListPage = lazy(() => import("@/pages/dashboard/users/UserListPage"));
const UserForm = lazy(() => import("@/pages/dashboard/users/UserForm"));
const UserDetailsPage = lazy(() => import("@/pages/dashboard/users/UserDetailsPage"));
const ProfilePage = lazy(() => import("@/pages/account/ProfilePage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState />}>
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

            <Route element={<RoleRoute roles={["ROLE_ADMIN"]} redirectTo="/dashboard" />}>
              <Route path="/dashboard/users" element={<UserListPage />} />
              <Route path="/dashboard/users/new" element={<UserForm mode="create" />} />
              <Route path="/dashboard/users/:id" element={<UserDetailsPage />} />
              <Route path="/dashboard/users/:id/edit" element={<UserForm mode="edit" />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
