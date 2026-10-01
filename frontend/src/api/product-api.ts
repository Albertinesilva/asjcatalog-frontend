import { http } from "./axios";
import { ENDPOINTS } from "@/utils/constants";
import type { Paginated, ProductResponse, ProductRequest, SpringPage } from "@/types";

export type ProductQueryParams = {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
  categoryIds?: string;
};

export const productApi = {
  findAll: (params: ProductQueryParams = {}): Promise<Paginated<ProductResponse>> => {
    const merged = {
      page: 0,
      size: 12,
      sort: "name,asc",
      name: "",
      categoryIds: "0",
      ...params,
    };
    return http
      .get<SpringPage<ProductResponse> | ProductResponse[]>(ENDPOINTS.products, {
        params: merged,
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
          } satisfies SpringPage<ProductResponse>;
        }
        return data;
      });
  },

  findById: (id: number) =>
    http.get<ProductResponse>(`${ENDPOINTS.products}/${id}`).then((r) => r.data),

  create: (data: ProductRequest) =>
    http.post<ProductResponse>(ENDPOINTS.products, data).then((r) => r.data),

  update: (id: number, data: ProductRequest) =>
    http.put<ProductResponse>(`${ENDPOINTS.products}/${id}`, data).then((r) => r.data),

  delete: (id: number) => http.delete<void>(`${ENDPOINTS.products}/${id}`).then((r) => r.data),
};
