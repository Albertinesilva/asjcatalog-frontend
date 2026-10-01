import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

/**
 * Card — ASJ Design System.
 *
 * Standard surface primitive of the ASJ Design System.
 */
type Padding = "none" | "sm" | "md" | "lg";

type Props = HTMLAttributes<HTMLDivElement> & {
  padding?: Padding;
  bordered?: boolean;
  elevated?: boolean;
  children?: ReactNode;
};

const paddings: Record<Padding, string> = {
  none: "",
  sm: "p-sm",
  md: "p-md",
  lg: "p-lg",
};

export default function Card({
  padding = "md",
  bordered = true,
  elevated = true,
  className,
  children,
  ...rest
}: Props) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-lg",
        bordered && "border border-border",
        elevated && "shadow-md",
        paddings[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
