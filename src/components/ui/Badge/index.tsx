import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

/**
 * Badge — ASJ Design System (Phase 10.2)
 *
 * Compact status/label token. Consumes only semantic tokens.
 */
export type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "outline";

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children?: ReactNode;
};

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-hover text-foreground border-transparent",
  primary: "bg-primary text-primary-foreground border-transparent",
  success: "bg-success text-primary-foreground border-transparent",
  warning: "bg-warning text-foreground border-transparent",
  danger: "bg-danger text-primary-foreground border-transparent",
  outline: "bg-transparent text-foreground border-border",
};

export default function Badge({ variant = "default", className, children, ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 " +
          "text-caption font-medium leading-none whitespace-nowrap",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
