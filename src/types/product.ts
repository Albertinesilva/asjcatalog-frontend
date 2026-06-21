import type { Category } from "./category";

export type ProductResponse = {
  id: number;
  name: string;
  description: string;
  price: number;
  imgUrl: string;
  categories: Category[];
};

export type ProductRequest = {
  name: string;
  description: string;
  price: number;
  imgUrl: string;
  categoryIds: number[];
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};
