import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  counter?: number;
  children?: ReactNode;
  className?: string;
};

/**
 * Cabeçalho reutilizável para listagens administrativas.
 * Slot `children` recebe as ações (botões, links, filtros).
 */
export default function TableToolbar({ title, subtitle, counter, children, className = "" }: Props) {
  return (
    <div
      className={`d-flex flex-column flex-md-row gap-3 align-items-stretch align-items-md-center justify-content-between mb-4 ${className}`}
    >
      <div>
        <h4 className="m-0 fw-bold" style={{ color: "#263238" }}>
          {title}
          {typeof counter === "number" && (
            <span className="badge bg-secondary ms-2" style={{ fontSize: "0.7em" }}>
              {counter}
            </span>
          )}
        </h4>
        {subtitle && <small className="text-muted">{subtitle}</small>}
      </div>
      {children && <div className="d-flex gap-2 flex-wrap">{children}</div>}
    </div>
  );
}