import RoleRoute from "./RoleRoute";

/**
 * Compat: mantém o nome AdminRoute como wrapper fino sobre RoleRoute.
 * Novos guards devem preferir <RoleRoute roles={[...]} />.
 */
export default function AdminRoute() {
  return <RoleRoute roles={["ROLE_ADMIN"]} redirectTo="/dashboard" />;
}
