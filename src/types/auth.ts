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

/**
 * Payload exato do Access Token emitido pelo backend (OAuth2 / Spring Authorization Server).
 * `sub` e `aud` referem-se ao *client* OAuth2; a identidade do usuário vem de
 * `userId` (identificador) e `username` (login/e-mail).
 */
export type JwtPayload = {
  sub: string;
  aud: string | string[];
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
  jti: string;
  userId: number;
  username: string;
  authorities: Role[];
};

/** Alias mantido para compatibilidade com o restante da aplicação. */
export type AccessToken = JwtPayload;

export type AuthContextData = {
  authenticated: boolean;
  loading: boolean;
  user: User | null;
  token: AccessToken | null;
  /** Identificador do usuário autenticado, vindo do claim `userId` do JWT. */
  userId: number | null;
  /** Login (e-mail) do usuário autenticado, vindo do claim `username`. */
  username: string | null;
  roles: Role[];
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: Role) => boolean;
  refreshUser: () => Promise<void>;
};
