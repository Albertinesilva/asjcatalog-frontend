import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";
import { inputBaseClasses } from "@/components/ui/Input";

/**
 * Select — ASJ Design System (Fase 2-F.6)
 *
 * Primitivo de seleção nativo alinhado visualmente ao <Input>:
 * mesmos tokens de background, borda, foco, erro e disabled.
 * Não implementa combobox/multiselect customizado — apenas o <select>
 * nativo, preservando `multiple`, `size`, `ref` e React Hook Form.
 */
type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
  selectClassName?: string;
};

export const selectBaseClasses = inputBaseClasses;

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  {
    label,
    helperText,
    error,
    required,
    multiple,
    wrapperClassName,
    selectClassName,
    className,
    id,
    children,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-small font-medium text-foreground">
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger ml-0.5">
              *
            </span>
          )}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        required={required}
        multiple={multiple}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
        className={cn(
          selectBaseClasses,
          multiple && "h-auto py-2",
          hasError && "border-danger focus:border-danger focus:ring-danger/30",
          selectClassName,
          className,
        )}
        {...rest}
      >
        {children}
      </select>
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

export default Select;
