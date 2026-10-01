import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";
import { inputBaseClasses } from "@/components/ui/Input";

/**
 * Textarea — ASJ Design System
 *
 * Mesma anatomia do <Input>: label opcional, texto de ajuda e mensagem de
 * erro, com `aria-invalid` e `aria-describedby` ligando o campo à mensagem.
 * Consome apenas tokens semânticos.
 */
type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
  textareaClassName?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  {
    label,
    helperText,
    error,
    required,
    rows = 4,
    wrapperClassName,
    textareaClassName,
    className,
    id,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const helperId = `${textareaId}-helper`;
  const errorId = `${textareaId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label htmlFor={textareaId} className="text-small font-medium text-foreground">
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger ml-0.5">
              *
            </span>
          )}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
        className={cn(
          inputBaseClasses,
          "h-auto py-2 resize-y",
          hasError && "border-danger focus:border-danger focus:ring-danger/30",
          textareaClassName,
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

export default Textarea;
