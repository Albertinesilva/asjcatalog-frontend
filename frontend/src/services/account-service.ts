import { accountApi } from "@/api/account-api";
import type { AuthenticatedPasswordUpdateRequest } from "@/types";
export const accountService = accountApi;

/** Alteração da própria senha: PATCH /api/v1/accounts/me/password */
export async function updateOwnPassword(data: AuthenticatedPasswordUpdateRequest) {
  return accountApi.updatePassword(data);
}
