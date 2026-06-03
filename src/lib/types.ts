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

export type Category = {
  id: number;
  name: string;
};

export type ProductItemProps = {
  id: number;
  name: string;
  description: string;
  price: number;
  imgUrl: string;
  date: string;
  categories: Category[];
};

export type ProductsPage = {
  content: ProductItemProps[];
  totalElements: number;
  totalPages: number;
  number: number;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  userFirstName?: string;
  userId?: number;
};

export type Role = "ROLE_OPERATOR" | "ROLE_ADMIN";

export type AccessToken = {
  exp: number;
  user_name: string;
  authorities: Role[];
};

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: { id: number; authority: Role }[];
};