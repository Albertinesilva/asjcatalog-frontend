import { accountApi } from "@/api/account-api";
export const accountService = accountApi;

/**
 * Ponte direta com o backend para ativação de conta.
 * GET /api/v1/accounts/activate?token=...
 */
export async function activateAccount(token: string) {
  return accountApi.activate(token);
}

export async function resendActivation(email: string) {
  return accountApi.resendActivation(email);
}