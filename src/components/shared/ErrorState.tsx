import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button, cn } from "@/components/ui";
import {
  stateActionClasses,
  stateContainerClasses,
  stateDescriptionClasses,
  stateTitleClasses,
} from "./state-layout";

type Props = {
  /** Mensagem principal do erro (título). */
  message?: string;
  /** Alias semântico de `message`. */
  title?: string;
  /** Texto auxiliar opcional. */
  description?: string;
  /** Ação customizada; substitui o botão padrão de "tentar novamente". */
  action?: ReactNode;
  onRetry?: () => void;
  className?: string;
};

/**
 * Estado de erro recuperável. Compartilha a linguagem visual do EmptyState.
 */
export default function ErrorState({
  message,
  title,
  description,
  action,
  onRetry,
  className = "",
}: Props) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? message ?? t("common:states.error");
  const resolvedAction =
    action ??
    (onRetry ? (
      <Button type="button" variant="outline" onClick={onRetry}>
        {t("common:actions.retry")}
      </Button>
    ) : null);

  return (
    <div className={cn(stateContainerClasses, className)} role="alert">
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-danger mb-xs"
        aria-hidden="true"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </svg>
      <h2 className={stateTitleClasses}>{resolvedTitle}</h2>
      {description && <p className={stateDescriptionClasses}>{description}</p>}
      {resolvedAction && <div className={stateActionClasses}>{resolvedAction}</div>}
    </div>
  );
}
