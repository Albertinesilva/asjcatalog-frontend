import axios from "axios";
import qs from "query-string";
import { getSessionData, logout } from "./auth";
import type { LoginResponse } from "@/@types";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8080";

export const CLIENT_ID =
  (import.meta.env.VITE_CLIENT_ID as string | undefined) ?? "myclientid";

export const CLIENT_SECRET =
  (import.meta.env.VITE_CLIENT_SECRET as string | undefined) ??
  "myclientsecret";

function isLovablePreview(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.includes("lovable.app");
}

function basicAuthHeader(): string {
  const encoder =
    typeof btoa === "function"
      ? btoa
      : (s: string) => Buffer.from(s).toString("base64");
  return `Basic ${encoder(`${CLIENT_ID}:${CLIENT_SECRET}`)}`;
}

export const api = axios.create({
  baseURL: isLovablePreview() ? "/api/proxy" : API_BASE_URL,
});


api.interceptors.request.use((config) => {
  const session = getSessionData();
  if (session?.access_token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization =
      `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 && getSessionData()) {
      logout();
    }
    return Promise.reject(error);
  },
);

export async function loginRequest(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const body = qs.stringify({
    username,
    password,
    grant_type: "password",
  });

  const loginUrl = isLovablePreview()
    ? "/api/proxy/oauth2/token"
    : `${API_BASE_URL}/oauth2/token`;

  const res = await axios.post<LoginResponse>(loginUrl, body, {
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return res.data;
}