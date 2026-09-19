import { NavLink } from "react-router-dom";
import type { NavLinkProps } from "@/types";
import { cn } from "@/components/ui";

/**
 * NavbarLink — Fase 10.3.
 *
 * Link de topo com estados hover/active/focus usando tokens semânticos.
 * A cor base é herdada do container (Navbar aplica cor sobre superfície
 * `bg-primary`), portanto usamos utilitários de opacidade sobre `current`.
 */
export default function NavbarLink({ target, label }: NavLinkProps) {
  return (
    <NavLink
      to={target}
      end={target === "/"}
      className={({ isActive }: { isActive: boolean }) =>
        cn(
          "relative inline-flex items-center px-xs py-sm text-small font-heading font-semibold",
          "transition-colors ease-standard",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60 rounded-sm",
          "after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:rounded-full",
          "after:bg-primary-foreground after:transition-transform after:ease-standard",
          isActive
            ? "text-primary-foreground after:scale-x-100"
            : "text-primary-foreground/60 hover:text-primary-foreground after:scale-x-0 hover:after:scale-x-100",
        )
      }
    >
      {label}
    </NavLink>
  );
}
