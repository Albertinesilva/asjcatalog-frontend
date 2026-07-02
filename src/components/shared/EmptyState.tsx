import type { ReactNode } from "react";

type Props = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  title = "Nenhum resultado encontrado",
  description,
  action,
  className = "",
}: Props) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center py-5 text-center ${className}`}
    >
      <h5 className="mb-1">{title}</h5>
      {description && <p className="text-muted mb-3">{description}</p>}
      {action}
    </div>
  );
}