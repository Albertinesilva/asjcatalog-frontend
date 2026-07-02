import { useEffect, useId, useRef, type ReactNode } from "react";

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
 * Usa apenas Bootstrap — nenhuma dependência extra.
 */
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

    // Foco inicial no Cancelar (opção segura).
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
      className="modal d-block"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-radius-10">
          <div className="modal-header">
            <h5 className="modal-title" id={titleId}>
              {title}
            </h5>
          </div>
          {description && (
            <div className="modal-body" id={descId}>
              {typeof description === "string" ? <p className="mb-0">{description}</p> : description}
            </div>
          )}
          <div className="modal-footer">
            <button
              ref={cancelRef}
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={isConfirming}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn btn-${variant}`}
              onClick={onConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? confirmingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}