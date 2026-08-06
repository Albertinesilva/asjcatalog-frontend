import type { Role } from "./auth";

export type UserRole = {
  id: number;
  authority: Role;
};

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  roles?: UserRole[];
};

export type UserDetails = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  roles: UserRole[];
};

export type UserRegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type UserCreateRequest = UserRegisterRequest & {
  roleIds: number[];
};

export type UserUpdateRequest = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  roleIds?: number[];
};

export type AuthenticatedUserUpdateRequest = {
  firstName: string;
  lastName: string;
  email: string;
};
