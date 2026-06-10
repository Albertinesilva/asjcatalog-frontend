import { http } from "./axios";
import { ENDPOINTS } from "@/utils/constants";
import type { User, UserRegisterRequest } from "@/types";

export const accountApi = {
  register: (data: UserRegisterRequest) =>
    http.post<User>(ENDPOINTS.accountsRegister, data).then((r) => r.data),

  activate: (token: string) =>
    http
      .get<void>(ENDPOINTS.accountsActivate, { params: { token } })
      .then((r) => r.data),

  resendActivation: (email: string) =>
    http
      .post<void>(ENDPOINTS.accountsResend, { email })
      .then((r) => r.data),
};