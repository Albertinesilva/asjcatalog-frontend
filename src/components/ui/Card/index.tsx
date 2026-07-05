import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

/**
 * Card — ASJ Design System (Phase 10.2)
 *
 * Standard surface primitive. Replaces (progressively) legacy classes
 * `card-base`, `border-radius-10` and `border-radius-20`.
 */
type Padding = "none" | "sm" | "md" | "lg";

type Props = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "article";
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
  as: Tag = "div",
  padding = "md",
  bordered = true,
  elevated = true,
  className,
  children,
  ...rest
}: Props) {
  return (
    <Tag
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
    </Tag>
  );
}