import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

/**
 * Input — ASJ Design System (Phase 10.2)
 *
 * Standardized text input. Wraps the native <input> with an optional
 * label, helper text and error message. Consumes only semantic tokens.
 */
type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
};

export const inputBaseClasses =
  "block w-full h-11 px-4 rounded-md border bg-input text-foreground text-body " +
  "placeholder:text-foreground-muted border-input-border " +
  "transition-colors ease-standard " +
  "focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/40 " +
  "disabled:opacity-60 disabled:cursor-not-allowed read-only:bg-surface-hover";

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, helperText, error, required, wrapperClassName, inputClassName, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-small font-medium text-foreground">
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger ml-0.5">
              *
            </span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
        className={cn(
          inputBaseClasses,
          hasError && "border-danger focus:border-danger focus:ring-danger/30",
          inputClassName,
          className,
        )}
        {...rest}
      />
      {hasError ? (
        <p id={errorId} className="text-small text-danger">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-small text-foreground-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
