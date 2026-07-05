import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/components/ui";

/**
 * PasswordInput — Fase 10.2.
 *
 * Contrato público inalterado: aceita todos os atributos nativos de
 * <input> (exceto `type`) e um `wrapperClassName`. Internamente foi
 * migrado para Tailwind + tokens semânticos; o CSS Module legado foi
 * removido.
 */
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  wrapperClassName?: string;
};

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {off ? (
      <>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.81 21.81 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.7 21.7 0 0 1-3.17 4.19" />
        <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const PasswordInput = forwardRef<HTMLInputElement, Props>(
  ({ wrapperClassName, className, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className={cn("relative block w-full", wrapperClassName)}>
        <input
          {...rest}
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(className, "!pr-12 w-full")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          tabIndex={-1}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center",
            "h-9 w-9 rounded-md bg-transparent border-0 text-foreground-muted cursor-pointer",
            "transition-colors duration-DEFAULT ease-standard",
            "hover:text-accent hover:bg-accent/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <EyeIcon off={visible} />
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
