import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn, inputBaseClasses } from "@/components/ui";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
};

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {off ? (<>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.81 21.81 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.7 21.7 0 0 1-3.17 4.19" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </>) : (<>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>)}
  </svg>
);

const PasswordField = forwardRef<HTMLInputElement, Props>(function PasswordField(
  { id, label, helperText, error, required, wrapperClassName, className,
    "aria-describedby": ariaDescribedByProp, ...rest },
  ref,
) {
  const { t } = useTranslation();
  const autoId = useId();
  const inputId = id ?? autoId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);
  const [visible, setVisible] = useState(false);

  const describedBy =
    [ariaDescribedByProp, hasError ? errorId : undefined, helperText ? helperId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-small font-medium text-foreground">
          {label}
          {required && (<span aria-hidden="true" className="text-danger ml-0.5">*</span>)}
        </label>
      )}
      <div className="relative block w-full">
        <input {...rest} ref={ref} id={inputId} required={required}
          type={visible ? "text" : "password"}
          aria-invalid={hasError || undefined} aria-describedby={describedBy}
          className={cn(inputBaseClasses,
            hasError && "border-danger focus:border-danger focus:ring-danger/30",
            "!pr-12", className)} />
        <button type="button" onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("validation:password.hide") : t("validation:password.show")}
          aria-pressed={visible} tabIndex={-1}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center",
            "h-9 w-9 rounded-md bg-transparent border-0 text-foreground-muted cursor-pointer",
            "transition-colors duration-slow ease-standard",
            "hover:text-accent hover:bg-accent/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}>
          <EyeIcon off={visible} />
        </button>
      </div>
      {hasError ? (
        <p id={errorId} className="text-small text-danger">{error}</p>
      ) : helperText ? (
        <p id={helperId} className="text-small text-foreground-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

export default PasswordField;
