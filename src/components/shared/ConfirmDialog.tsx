import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, type ButtonVariant } from "@/components/ui";

type Variant = "danger" | "primary" | "warning";

type Props = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmingLabel?: string;
  variant?: Variant;
  isConfirming?: boolean;
  disableClose?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Diálogo de confirmação genérico.
 * - ESC fecha
 * - Enter/Espaço usam a ativação nativa do botão focado (não há handler global
 *   de Enter: com o foco em Cancelar, Enter cancela)
 * - Bloqueia scroll do body enquanto aberto
 * - Foco inicial no botão Cancelar (menos destrutivo), com focus trap enquanto
 *   aberto e retorno do foco ao elemento que abriu o diálogo
 * - aria-labelledby / aria-describedby ligados ao título/descrição
 *
 * Fase 10.2: migrado para Tailwind + Card/Button do Design System.
 * Nenhuma dependência do modal Bootstrap.
 */
const variantToButton: Record<Variant, ButtonVariant> = {
  danger: "danger",
  primary: "primary",
  warning: "primary",
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmingLabel,
  variant = "danger",
  isConfirming = false,
  disableClose = false,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const resolvedConfirmLabel = confirmLabel ?? t("common:actions.confirm");
  const resolvedCancelLabel = cancelLabel ?? t("common:actions.cancel");
  const resolvedConfirmingLabel = confirmingLabel ?? t("common:confirm.confirming");
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  // Os callbacks costumam ser recriados a cada render do consumidor; lê-los por
  // ref mantém o efeito de foco dependente só de `open` (sem roubar o foco de
  // volta a cada re-render).
  const latest = useRef({ onCancel, isConfirming, disableClose });
  useEffect(() => {
    latest.current = { onCancel, isConfirming, disableClose };
  });

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    (cancelRef.current ?? dialog)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const { onCancel: cancel, isConfirming: confirming, disableClose: locked } = latest.current;
        if (confirming || locked) return;
        cancel();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!dialog.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (trigger && trigger !== document.body && trigger.isConnected) trigger.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      tabIndex={-1}
      className="fixed inset-0 z-modal flex items-center justify-center p-md bg-overlay/50 focus:outline-none"
      onClick={() => {
        if (isConfirming || disableClose) return;
        onCancel();
      }}
    >
      <Card
        padding="none"
        elevated
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden"
      >
        <div className="px-lg py-md border-b border-border">
          <h2 id={titleId} className="font-heading text-title text-foreground m-0">
            {title}
          </h2>
        </div>
        {description && (
          <div id={descId} className="px-lg py-md text-body text-foreground">
            {typeof description === "string" ? <p className="m-0">{description}</p> : description}
          </div>
        )}
        <div className="px-lg py-md border-t border-border flex justify-end gap-sm">
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {resolvedCancelLabel}
          </Button>
          <Button
            type="button"
            variant={variantToButton[variant]}
            onClick={onConfirm}
            loading={isConfirming}
            disabled={isConfirming}
          >
            {isConfirming ? resolvedConfirmingLabel : resolvedConfirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
