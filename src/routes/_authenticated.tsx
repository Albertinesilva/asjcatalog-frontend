import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { isAuthenticated } from "../lib/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    // SSR/prerender: no localStorage. Skip; the component-level effect
    // would re-check on hydration. In practice loaders here run client-side.
    if (typeof window === "undefined") return;
    if (!isAuthenticated()) {
      throw redirect({ to: "/admin/auth" });
    }
  },
  component: () => <Outlet />,
});