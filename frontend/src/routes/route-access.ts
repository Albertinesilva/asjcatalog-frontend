/**
 * Fonte única para saber se um caminho exige autenticação.
 * Espelha os prefixos protegidos por `PrivateRoute` em `AppRoutes.tsx`.
 */
const PRIVATE_PATH_PREFIXES = ["/dashboard", "/account"] as const;

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
