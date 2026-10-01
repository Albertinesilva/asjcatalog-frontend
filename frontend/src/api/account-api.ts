import { http } from "./axios";
import { ENDPOINTS } from "@/utils/constants";
import type {
  AuthenticatedPasswordUpdateRequest,
  AuthenticatedUserUpdateRequest,
  User,
  UserRegisterRequest,
} from "@/types";

export const accountApi = {
  me: () => http.get<User>(ENDPOINTS.accountsMe).then((r) => r.data),

  updateMe: (data: AuthenticatedUserUpdateRequest) =>
    http.put<User>(ENDPOINTS.accountsMe, data).then((r) => r.data),

  /** PATCH /api/v1/accounts/me/password — nunca envia id, roles ou email. */
  updatePassword: (data: AuthenticatedPasswordUpdateRequest) =>
    http.patch<void>(ENDPOINTS.accountsMePassword, data).then((r) => r.data),

  register: (data: UserRegisterRequest) =>
    http.post<User>(ENDPOINTS.accountsRegister, data).then((r) => r.data),

  activate: (token: string) =>
    http.get<void>(ENDPOINTS.accountsActivate, { params: { token } }).then((r) => r.data),

  resendActivation: (email: string) =>
    http.post<void>(ENDPOINTS.accountsResend, { email }).then((r) => r.data),

  requestPasswordRecovery: (email: string) =>
    http.post<void>(ENDPOINTS.accountsPasswordRecovery, { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    http.post<void>(ENDPOINTS.accountsResetPassword, { token, password }).then((r) => r.data),
};
