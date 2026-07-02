import type { User } from "@/types";

type Props = {
  user: User | null;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function UserDeleteDialog({ user, isDeleting, onCancel, onConfirm }: Props) {
  if (!user) return null;
  return (
    <div
      className="modal d-block"
      role="dialog"
      aria-modal="true"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-radius-10">
          <div className="modal-header">
            <h5 className="modal-title">Excluir usuário</h5>
          </div>
          <div className="modal-body">
            <p className="mb-0">
              Tem certeza que deseja excluir{" "}
              <strong>
                {user.firstName} {user.lastName}
              </strong>
              ? Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}