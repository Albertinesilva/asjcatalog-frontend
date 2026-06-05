import { NavLink } from "react-router-dom";
import type { NavLinkProps } from "../../lib/types";

export default function NavbarLink({ target, label }: NavLinkProps) {
  return (
    <NavLink
      to={target}
      className={({ isActive }: { isActive: boolean }) =>
        isActive ? "active" : undefined
      }
      end={target === "/"}
    >
      {label}
    </NavLink>
  );
}
