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
  roles: UserRole[];
};

export type UserRegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type UserCreateRequest = UserRegisterRequest & {
  roles: { id: number }[];
};

export type UserUpdateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  roles: { id: number }[];
};