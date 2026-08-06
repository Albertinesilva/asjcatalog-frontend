import { userApi } from "@/api/user-api";
import { accountApi } from "@/api/account-api";
import type { AuthenticatedUserUpdateRequest } from "@/types";

export const userService = {
  ...userApi,

  /** Atualiza os dados do próprio usuário autenticado (PUT /api/v1/accounts/me). */
  updateAuthenticatedUser: (data: AuthenticatedUserUpdateRequest) => accountApi.updateMe(data),
};
