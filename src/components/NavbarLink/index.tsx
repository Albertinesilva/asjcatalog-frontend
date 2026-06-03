import { Link } from "@tanstack/react-router";
import type { NavLinkProps } from "../../lib/types";

export default function NavbarLink({ target, label }: NavLinkProps) {
  return (
    <Link
      to={target}
      activeProps={{ className: "active" }}
      activeOptions={{ exact: target === "/" }}
    >
      {label}
    </Link>
  );
}
