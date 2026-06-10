export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8080";

export const CLIENT_ID =
  (import.meta.env.VITE_CLIENT_ID as string | undefined) ?? "myclientid";

export const CLIENT_SECRET =
  (import.meta.env.VITE_CLIENT_SECRET as string | undefined) ??
  "myclientsecret";

export const TOKEN_KEY = "authData";

export const ENDPOINTS = {
  token: "/oauth2/token",
  users: "/api/v1/users",
  usersRegister: "/api/v1/users/register",
  products: "/api/v1/products",
  categories: "/api/v1/categories",
  accountsRegister: "/api/v1/accounts/register",
  accountsActivate: "/api/v1/accounts/activate",
  accountsResend: "/api/v1/accounts/resend-activation",
} as const;

export const PENDING_EMAIL_KEY = "pendingActivationEmail";