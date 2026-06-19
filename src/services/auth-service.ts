import { requestToken } from "@/api/auth-api";
import { userApi } from "@/api/user-api";
import { getAuthData, removeAuthData, saveAuthData } from "@/utils/storage";
import { decodeToken, isTokenValid } from "@/utils/permissions";
import type { LoginRequest, User } from "@/types";

export const authService = {
  async login(credentials: LoginRequest) {
    const data = await requestToken(credentials);
    saveAuthData(data);
    return data;
  },

  logout() {
    removeAuthData();
  },

  isAuthenticated(): boolean {
    const data = getAuthData();
    return !!data?.access_token && isTokenValid();
  },

  async getCurrentUser(): Promise<User | null> {
    const decoded = decodeToken();
    if (!decoded?.username) return null;
    try {
      const page = await userApi.findAll({ size: 1000 });
      const list = Array.isArray(page) ? page : page.content;
      return list.find((u) => u.email === decoded.username) ?? null;
    } catch {
      return null;
    }
  },
};
