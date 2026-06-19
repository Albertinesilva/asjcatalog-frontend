import { http } from "./axios";
import { ENDPOINTS } from "@/utils/constants";
import type { Product, ProductRequest, SpringPage } from "@/types";

export const productApi = {
  findAll: (
    params: {
      page?: number;
      size?: number;
      sort?: string;
      name?: string;
      categoryId?: string;
    } = {},
  ) =>
    http
      .get<SpringPage<Product>>(ENDPOINTS.products, {
        params: {
          page: 0,
          size: 12,
          sort: "name,asc",
          name: "",
          categoryId: "0",
          ...params,
        },
      })
      .then((r) => r.data),

  findById: (id: number | string) =>
    http.get<Product>(`${ENDPOINTS.products}/${id}`).then((r) => r.data),

  create: (data: ProductRequest) =>
    http.post<Product>(ENDPOINTS.products, data).then((r) => r.data),

  update: (id: number | string, data: ProductRequest) =>
    http.put<Product>(`${ENDPOINTS.products}/${id}`, data).then((r) => r.data),

  delete: (id: number | string) =>
    http.delete<void>(`${ENDPOINTS.products}/${id}`).then((r) => r.data),
};