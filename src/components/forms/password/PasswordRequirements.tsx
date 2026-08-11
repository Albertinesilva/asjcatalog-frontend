import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/components/ui";
import {
  evaluatePassword,
  PASSWORD_CRITERIA,
  type PasswordCriterion,
  type PersonalDataContext,
} from "@/utils/password";
import PasswordStrength from "./PasswordStrength";

type Props = {
  password: string;
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showStrength?: boolean;
  className?: string;
  id?: string;
  context?: PersonalDataContext;
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
    {open ? <path d="M7 11V7a5 5 0 0 1 9.9-1" /> : <path d="M7 11V7a5 5 0 0 1 10 0v4" />}
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
  criteria,
}: {
  password: string;
  evaluation: ReturnType<typeof evaluatePassword>;
  showStrength: boolean;
  descriptionId?: string;
  criteria: typeof PASSWORD_CRITERIA;
}) {
  const { t } = useTranslation();
  return (
    <div id={descriptionId} className="flex flex-col gap-sm">
      {showStrength && <PasswordStrength password={password} />}
      <div className="flex items-center justify-between gap-sm">
        <p className="m-0 text-small font-medium text-foreground">
          {t("validation:password.criteria.title")}
        </p>
        <span className="text-caption font-medium text-foreground-muted tabular-nums">
          {criteria.filter((c) => evaluation[c.key as PasswordCriterion]).length}/{criteria.length}
        </span>
      </div>
      <ul className="m-0 p-0 list-none flex flex-col gap-xs" role="list">
        {criteria.map(({ key, labelKey }) => {
          const ok = evaluation[key as PasswordCriterion];
          return (
            <li
              key={key}
              className={cn(
                "flex items-center gap-xs text-small leading-tight transition-colors duration-slow ease-standard",
                ok ? "text-success" : "text-danger",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex shrink-0 transition-transform duration-slow ease-standard",
                  ok && "scale-105",
                )}
              >
                <LockIcon open={ok} />
              </span>
              <span className="flex-1 min-w-0">
                <span className={cn(ok ? "text-success" : "text-foreground-muted")}>
                  {t(labelKey)}
                </span>
              </span>
              <span className="sr-only">
                {ok
                  ? t("validation:password.criteria.met")
                  : t("validation:password.criteria.pending")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function PasswordRequirements({
  password,
  collapsible = false,
  open,
  onOpenChange,
  showStrength = true,
  className,
  id,
  context,
}: Props) {
  const { t } = useTranslation();
  const autoId = useId();
  const panelId = id ?? `${autoId}-panel`;
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? Boolean(open) : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const evaluation = evaluatePassword(password, context);
  const criteria = context
    ? PASSWORD_CRITERIA
    : PASSWORD_CRITERIA.filter((c) => c.key !== "noPersonalData");
  const total = criteria.length;
  const metCount = criteria.filter((c) => evaluation[c.key as PasswordCriterion]).length;
  const body: ReactNode = (
    <RequirementsList
      password={password}
      evaluation={evaluation}
      showStrength={showStrength}
      descriptionId={panelId}
      criteria={criteria}
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
            className={cn(metCount === total ? "text-success" : "text-foreground-muted")}
          >
            <LockIcon open={metCount === total} />
          </span>
          {isOpen ? t("validation:password.criteria.hide") : t("validation:password.criteria.show")}
          <span className="text-foreground-muted font-normal tabular-nums">
            ({metCount}/{total})
          </span>
        </span>
        <ChevronIcon open={isOpen} />
      </button>
      {isOpen && <div className="px-md pb-md pt-0 animate-fade-in">{body}</div>}
    </div>
  );
}
