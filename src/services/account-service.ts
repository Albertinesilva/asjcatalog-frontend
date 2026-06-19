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

export async function requestPasswordRecovery(email: string) {
  return accountApi.requestPasswordRecovery(email);
}

export async function resetPassword(token: string, password: string) {
  return accountApi.resetPassword(token, password);
}
