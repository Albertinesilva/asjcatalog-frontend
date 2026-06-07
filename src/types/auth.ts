import type { User } from "./user";

export type Role = "ROLE_ADMIN" | "ROLE_OPERATOR";

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  userFirstName?: string;
  userId?: number;
};

export type AccessToken = {
  exp: number;
  username: string;
  authorities: Role[];
};

export type AuthContextData = {
  authenticated: boolean;
  user: User | null;
  token: AccessToken | null;
  roles: Role[];
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
};