import { useEffect, useId, useRef, type ReactNode } from "react";
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
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Diálogo de confirmação genérico.
 * - ESC fecha
 * - Bloqueia scroll do body enquanto aberto
 * - Foco inicial no botão Cancelar (menos destrutivo)
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
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmingLabel = "Processando...",
  variant = "danger",
  isConfirming = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);

    const t = setTimeout(() => cancelRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className="fixed inset-0 z-modal flex items-center justify-center p-md bg-overlay/50"
      onClick={onCancel}
    >
      <Card
        padding="none"
        elevated
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden"
      >
        <div className="px-lg py-md border-b border-border">
          <h5 id={titleId} className="font-heading text-title text-foreground m-0">
            {title}
          </h5>
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
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variantToButton[variant]}
            onClick={onConfirm}
            loading={isConfirming}
            disabled={isConfirming}
          >
            {isConfirming ? confirmingLabel : confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
