import { http } from "./axios";
import { ENDPOINTS } from "@/utils/constants";
import type {
  SpringPage,
  User,
  UserCreateRequest,
  UserRegisterRequest,
  UserUpdateRequest,
} from "@/types";

export const userApi = {
  register: (data: UserRegisterRequest) =>
    http.post<User>(ENDPOINTS.usersRegister, data).then((r) => r.data),

  create: (data: UserCreateRequest) =>
    http.post<User>(ENDPOINTS.users, data).then((r) => r.data),

  update: (id: number, data: UserUpdateRequest) =>
    http.put<User>(`${ENDPOINTS.users}/${id}`, data).then((r) => r.data),

  findById: (id: number) =>
    http.get<User>(`${ENDPOINTS.users}/${id}`).then((r) => r.data),

  findAll: (params: { page?: number; size?: number; sort?: string } = {}) =>
    http
      .get<SpringPage<User> | User[]>(ENDPOINTS.users, {
        params: { page: 0, size: 20, sort: "firstName,asc", ...params },
      })
      .then((r) => r.data),

  activate: (id: number) =>
    http.patch<User>(`${ENDPOINTS.users}/${id}/activate`).then((r) => r.data),

  deactivate: (id: number) =>
    http.patch<User>(`${ENDPOINTS.users}/${id}/deactivate`).then((r) => r.data),

  delete: (id: number) =>
    http.delete<void>(`${ENDPOINTS.users}/${id}`).then((r) => r.data),
};