import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import {
  buttonBaseClasses,
  buttonSizeClasses,
  buttonVariantClasses,
  type ButtonSize,
  type ButtonVariant,
} from "./styles";

/**
 * Button — ASJ Design System (Phase 10.2)
 *
 * The official button of the application. Consumes only semantic
 * tokens declared in Phase 10.1. Do NOT reintroduce Bootstrap `btn`
 * classes or hardcoded colors inside this component. Style tokens live
 * in `./styles` so this module exports only the component.
 */
type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  type?: "button" | "submit" | "reset";
};

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
