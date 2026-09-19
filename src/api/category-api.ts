import { http } from "./axios";
import { ENDPOINTS } from "@/utils/constants";
import type { Category, CategoryRequest, Paginated, SpringPage } from "@/types";

export type CategoryQueryParams = {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
};

export const categoryApi = {
  /**
   * Retorna sempre um array de categorias, normalizando o formato
   * retornado pelo backend (Spring Page ou lista pura).
   */
  findAll: (): Promise<Category[]> =>
    http
      .get<{ content: Category[] } | Category[]>(ENDPOINTS.categories)
      .then((r) => (Array.isArray(r.data) ? r.data : (r.data?.content ?? []))),

  /**
   * Página de categorias (`GET /categories?name&page&size&sort` → `Page<CategoryResponse>`).
   * Lista pura (endpoint não paginado) é normalizada para uma única página.
   */
  findPage: (params: CategoryQueryParams = {}): Promise<Paginated<Category>> => {
    const { name, ...rest } = params;
    return http
      .get<SpringPage<Category> | Category[]>(ENDPOINTS.categories, {
        params: { page: 0, size: 10, sort: "name,asc", ...rest, name: name || undefined },
      })
      .then((r) => {
        const data = r.data;
        if (Array.isArray(data)) {
          return {
            content: data,
            totalElements: data.length,
            totalPages: 1,
            number: 0,
            size: data.length,
          } satisfies SpringPage<Category>;
        }
        return data;
      });
  },

  findById: (id: number) => http.get<Category>(`${ENDPOINTS.categories}/${id}`).then((r) => r.data),

  create: (data: CategoryRequest) =>
    http.post<Category>(ENDPOINTS.categories, data).then((r) => r.data),

  update: (id: number, data: Category) =>
    http.put<Category>(`${ENDPOINTS.categories}/${id}`, data).then((r) => r.data),

  delete: (id: number) => http.delete<void>(`${ENDPOINTS.categories}/${id}`).then((r) => r.data),
};
