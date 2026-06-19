import { http } from "./axios";
import { ENDPOINTS } from "@/utils/constants";
import type { ProductResponse, ProductRequest, SpringPage } from "@/types";

export type ProductFilters = {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
  categoryIds?: string;
};

export const productApi = {
  findAll: (params: ProductFilters = {}) => {
    const merged = {
      page: 0,
      size: 12,
      sort: "name,asc",
      name: "",
      categoryIds: "0",
      ...params,
    };
    return http
      .get<SpringPage<ProductResponse>>(ENDPOINTS.products, { params: merged })
      .then((r) => r.data);
  },

  findById: (id: number | string) =>
    http.get<ProductResponse>(`${ENDPOINTS.products}/${id}`).then((r) => r.data),

  create: (data: ProductRequest) =>
    http.post<ProductResponse>(ENDPOINTS.products, data).then((r) => r.data),

  update: (id: number | string, data: ProductRequest) =>
    http.put<ProductResponse>(`${ENDPOINTS.products}/${id}`, data).then((r) => r.data),

  delete: (id: number | string) =>
    http.delete<void>(`${ENDPOINTS.products}/${id}`).then((r) => r.data),
};
