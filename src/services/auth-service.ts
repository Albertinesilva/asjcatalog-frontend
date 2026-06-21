import { requestToken } from "@/api/auth-api";
import { accountApi } from "@/api/account-api";
import { getAuthData, removeAuthData, saveAuthData } from "@/utils/storage";
import { isTokenValid } from "@/utils/permissions";
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
    try {
      return await accountApi.me();
    } catch {
      return null;
    }
  },
};
