/**
 * Button style tokens — kept in a non-component module so that
 * `src/components/ui/Button/index.tsx` exports only the component
 * (required for React Fast Refresh).
 *
 * Consumes only semantic tokens from `src/styles/globals.css`.
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export const buttonBaseClasses =
  "inline-flex items-center justify-center gap-2 font-heading font-semibold whitespace-nowrap " +
  "select-none rounded-md border transition-colors ease-standard " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed";

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground border-transparent hover:bg-primary-hover active:bg-primary-hover",
  secondary: "bg-surface text-foreground border-border hover:bg-surface-hover",
  outline: "bg-transparent text-primary border-primary hover:bg-primary/10",
  danger: "bg-danger text-primary-foreground border-transparent hover:bg-danger/90",
  ghost: "bg-transparent text-foreground border-transparent hover:bg-surface-hover",
};

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-small",
  md: "h-10 px-4 text-small",
  lg: "h-12 px-6 text-body",
  icon: "h-10 w-10 p-0",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return `${buttonBaseClasses} ${buttonVariantClasses[variant]} ${buttonSizeClasses[size]}`;
}
