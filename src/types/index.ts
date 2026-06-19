export * from "./auth";
export * from "./user";
export * from "./category";
export * from "./product";

export type NavLinkProps = {
  target: string;
  label: string;
};

export type ButtonIconProps = {
  label: string;
  type: "button" | "submit";
};

export type ProductPriceProps = {
  price: string;
};

export type { Product as ProductItemProps } from "./product";
export type { SpringPage as ProductsPage } from "./product";
