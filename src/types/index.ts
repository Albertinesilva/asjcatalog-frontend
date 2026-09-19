export * from "./auth";
export * from "./user";
export * from "./category";
export * from "./product";

import type { SpringPage } from "./product";

/**
 * Alias de aplicação para SpringPage<T>.
 * Vocabulário desacoplado do backend; use em novas assinaturas.
 */
export type Paginated<T> = SpringPage<T>;

export type NavLinkProps = {
  target: string;
  label: string;
};

export type ProductPriceProps = {
  price: string;
};

export type { ProductResponse as ProductItemProps } from "./product";
