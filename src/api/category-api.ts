import { http } from "./axios";
import { ENDPOINTS } from "@/utils/constants";
import type { Category, CategoryRequest } from "@/types";

export const categoryApi = {
  /**
   * Retorna sempre um array de categorias, normalizando o formato
   * retornado pelo backend (Spring Page ou lista pura).
   */
  findAll: (): Promise<Category[]> =>
    http
      .get<{ content: Category[] } | Category[]>(ENDPOINTS.categories)
      .then((r) => (Array.isArray(r.data) ? r.data : (r.data?.content ?? []))),

  findById: (id: number) => http.get<Category>(`${ENDPOINTS.categories}/${id}`).then((r) => r.data),

  create: (data: CategoryRequest) =>
    http.post<Category>(ENDPOINTS.categories, data).then((r) => r.data),

  update: (id: number, data: Category) =>
    http.put<Category>(`${ENDPOINTS.categories}/${id}`, data).then((r) => r.data),

  delete: (id: number) => http.delete<void>(`${ENDPOINTS.categories}/${id}`).then((r) => r.data),
};
