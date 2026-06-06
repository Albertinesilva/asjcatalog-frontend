import type { Category } from "./category";

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  imgUrl: string;
  date: string;
  categories: Category[];
};

export type ProductRequest = {
  name: string;
  description: string;
  price: number;
  imgUrl: string;
  categories: { id: number }[];
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};