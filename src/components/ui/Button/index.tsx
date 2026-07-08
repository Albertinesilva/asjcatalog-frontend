import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

/**
 * Button — ASJ Design System (Phase 10.2)
 *
 * The official button of the application. Consumes only semantic
 * tokens declared in Phase 10.1. Do NOT reintroduce Bootstrap `btn`
 * classes or hardcoded colors inside this component.
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  type?: "button" | "submit" | "reset";
};

export const buttonBaseClasses =
  "inline-flex items-center justify-center gap-2 font-heading font-semibold whitespace-nowrap " +
  "select-none rounded-md border transition-colors duration-DEFAULT ease-standard " +
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

const Spinner = () => (
  <svg
    className="animate-spin"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
    <path
      d="M22 12a10 10 0 0 1-10 10"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    disabled,
    type = "button",
    children,
    "aria-busy": ariaBusy,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={(ariaBusy ?? loading) ? true : undefined}
      className={cn(
        buttonBaseClasses,
        buttonVariantClasses[variant],
        buttonSizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : leftIcon}
      {size !== "icon" && <span>{children}</span>}
      {size === "icon" && !loading && children}
      {!loading && rightIcon}
    </button>
  );
});

export default Button;
