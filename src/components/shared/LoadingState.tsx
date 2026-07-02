type Props = { message?: string; className?: string };

export default function LoadingState({ message = "Carregando...", className = "" }: Props) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center py-5 text-muted ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="spinner-border text-primary mb-2" aria-hidden />
      <span>{message}</span>
    </div>
  );
}