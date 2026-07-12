import { useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "@/components/ui";
import {
  evaluatePassword,
  PASSWORD_CRITERIA,
  type PasswordCriterion,
} from "@/utils/password";
import PasswordStrength from "./PasswordStrength";

/**
 * PasswordRequirements — checklist that reacts in real time as the
 * user types. Each rule is rendered with a locked/unlocked padlock
 * icon and semantic color tokens (danger → success).
 *
 * `collapsible` (default false) renders the block inside a Card that
 * can expand/collapse. When controlled via `open`, the parent owns
 * the toggle state (e.g. auto-expand on focus).
 */
type Props = {
  password: string;
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showStrength?: boolean;
  className?: string;
  id?: string;
  /**
   * Mensagem de validação adicional retornada pelo backend
   * (ex.: "padrão muito comum"). Não substitui os requisitos —
   * é anexada abaixo da lista, dentro do mesmo Card.
   */
  issue?: ReactNode;
};

const LockIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    {open ? (
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    ) : (
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    )}
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={cn("transition-transform duration-DEFAULT ease-standard", open && "rotate-180")}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function RequirementsList({
  password,
  evaluation,
  showStrength,
  descriptionId,
  issue,
}: {
  password: string;
  evaluation: ReturnType<typeof evaluatePassword>;
  showStrength: boolean;
  descriptionId?: string;
  issue?: ReactNode;
}) {
  return (
    <div id={descriptionId} className="flex flex-col gap-sm">
      {showStrength && <PasswordStrength password={password} />}
      <div className="flex items-center justify-between gap-sm">
        <p className="m-0 text-small font-medium text-foreground">Sua senha deve conter</p>
        <span className="text-caption font-medium text-foreground-muted tabular-nums">
          {evaluation.score}/{PASSWORD_CRITERIA.length}
        </span>
      </div>
      <ul className="m-0 p-0 list-none flex flex-col gap-xs" role="list">
        {PASSWORD_CRITERIA.map(({ key, label }) => {
          const ok = evaluation[key as PasswordCriterion];
          return (
            <li
              key={key}
              className={cn(
                "flex items-center gap-sm text-small transition-colors duration-slow ease-standard",
                ok ? "text-success" : "text-danger",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex transition-transform duration-slow ease-standard",
                  ok && "scale-105",
                )}
              >
                <LockIcon open={ok} />
              </span>
              <span className="text-foreground-muted-none text-foreground">
                <span className={cn(ok ? "text-success" : "text-foreground-muted")}>{label}</span>
              </span>
              <span className="sr-only">{ok ? "requisito atendido" : "requisito pendente"}</span>
            </li>
          );
        })}
      </ul>
      {issue && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "mt-xs flex items-start gap-sm rounded-md border border-warning/40 bg-warning/10",
            "px-sm py-sm text-small text-foreground animate-fade-in",
          )}
        >
          <span aria-hidden="true" className="mt-0.5 inline-flex text-warning">
            <WarningIcon />
          </span>
          <span className="leading-snug">{issue}</span>
        </div>
      )}
    </div>
  );
}

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function PasswordRequirements({
  password,
  collapsible = false,
  open,
  onOpenChange,
  showStrength = true,
  className,
  id,
  issue,
}: Props) {
  const autoId = useId();
  const panelId = id ?? `${autoId}-panel`;
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? Boolean(open) : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const evaluation = evaluatePassword(password);

  // Quando o backend reporta um problema adicional, mantém o painel
  // aberto para que a mensagem fique visível junto aos requisitos.
  useEffect(() => {
    if (issue && collapsible && !isControlled && !internalOpen) {
      setInternalOpen(true);
    }
  }, [issue, collapsible, isControlled, internalOpen]);

  const body: ReactNode = (
    <RequirementsList
      password={password}
      evaluation={evaluation}
      showStrength={showStrength}
      descriptionId={panelId}
      issue={issue}
    />
  );

  if (!collapsible) {
    return (
      <div
        className={cn(
          "rounded-md border border-border bg-surface-hover p-md transition-colors duration-slow ease-standard",
          className,
        )}
      >
        {body}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface-hover overflow-hidden transition-colors duration-slow ease-standard",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn(
          "w-full flex items-center justify-between gap-sm px-md py-sm",
          "text-small font-medium text-foreground bg-transparent border-0 cursor-pointer",
          "transition-colors duration-DEFAULT ease-standard hover:bg-surface-hover",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <span className="flex items-center gap-sm">
          <span
            aria-hidden="true"
            className={cn(evaluation.score === 5 ? "text-success" : "text-foreground-muted")}
          >
            <LockIcon open={evaluation.score === 5} />
          </span>
          {isOpen ? "Ocultar requisitos" : "Mostrar requisitos"}
          <span className="text-foreground-muted font-normal tabular-nums">
            ({evaluation.score}/{PASSWORD_CRITERIA.length})
          </span>
        </span>
        <ChevronIcon open={isOpen} />
      </button>
      {isOpen && <div className="px-md pb-md pt-0 animate-fade-in">{body}</div>}
    </div>
  );
}