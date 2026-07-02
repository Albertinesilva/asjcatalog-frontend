import { http } from "./axios";
import { ENDPOINTS } from "@/utils/constants";
import type {
  SpringPage,
  User,
  UserDetails,
  UserCreateRequest,
  UserRegisterRequest,
  UserUpdateRequest,
} from "@/types";

export const userApi = {
  register: (data: UserRegisterRequest) =>
    http.post<User>(ENDPOINTS.usersRegister, data).then((r) => r.data),

  create: (data: UserCreateRequest) => http.post<User>(ENDPOINTS.users, data).then((r) => r.data),

  update: (id: number, data: UserUpdateRequest) =>
    http.put<User>(`${ENDPOINTS.users}/${id}`, data).then((r) => r.data),

  findById: (id: number) => http.get<UserDetails>(`${ENDPOINTS.users}/${id}`).then((r) => r.data),

  /**
   * Retorna sempre um SpringPage<User>, normalizando quando o backend
   * responde apenas com um array (endpoint não paginado).
   */
  findAll: (
    params: {
      page?: number;
      size?: number;
      sort?: string;
      firstName?: string;
    } = {},
  ): Promise<SpringPage<User>> => {
    const merged = { page: 0, size: 20, sort: "firstName,asc", ...params };
    return http
      .get<SpringPage<User> | User[]>(ENDPOINTS.users, { params: merged })
      .then((r) => {
        const data = r.data;
        if (Array.isArray(data)) {
          return {
            content: data,
            totalElements: data.length,
            totalPages: 1,
            number: 0,
            size: data.length,
          } satisfies SpringPage<User>;
        }
        return data;
      });
  },

  activate: (id: number) =>
    http.patch<User>(`${ENDPOINTS.users}/${id}/activate`).then((r) => r.data),

  deactivate: (id: number) =>
    http.patch<User>(`${ENDPOINTS.users}/${id}/deactivate`).then((r) => r.data),

  delete: (id: number) => http.delete<void>(`${ENDPOINTS.users}/${id}`).then((r) => r.data),
};
