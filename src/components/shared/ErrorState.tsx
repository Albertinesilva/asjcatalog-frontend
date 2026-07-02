type Props = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

export default function ErrorState({ message, onRetry, className = "" }: Props) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center py-5 text-center ${className}`}
      role="alert"
    >
      <p className="text-danger fw-semibold mb-2">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline-primary" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}