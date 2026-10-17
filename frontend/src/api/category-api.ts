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
   * Retorna TODAS as categorias, não apenas a primeira página.
   *
   * `GET /categories` sem `size` cai no tamanho de página padrão do Spring
   * Data Web (20): a resposta é sempre um `Page<CategoryResponse>`, mesmo sem
   * paginação explícita. Por isso a primeira página é buscada com um `size`
   * generoso e, se `totalPages` indicar mais páginas (backend aplicou um
   * teto menor, por exemplo), as demais são buscadas e concatenadas — sem
   * depender de um número mágico coincidir com o total real de categorias.
   */
  findAll: async (): Promise<Category[]> => {
    const first = await categoryApi.findPage({ page: 0, size: 200, sort: "name,asc" });
    if (first.totalPages <= 1) return first.content;
    const rest = await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, i) =>
        categoryApi.findPage({ page: i + 1, size: first.size, sort: "name,asc" }),
      ),
    );
    return [first.content, ...rest.map((p) => p.content)].flat();
  },

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

  /**
   * Atualização (`PATCH /categories/{id}` → `CategoryResponse`). Apesar do verbo,
   * não é parcial: o backend exige `name`; `description` ausente mantém a atual.
   */
  update: (id: number, data: CategoryRequest) =>
    http.patch<Category>(`${ENDPOINTS.categories}/${id}`, data).then((r) => r.data),

  delete: (id: number) => http.delete<void>(`${ENDPOINTS.categories}/${id}`).then((r) => r.data),
};
