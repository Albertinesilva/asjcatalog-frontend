import { Button, cn } from "@/components/ui";

type Props = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

/**
 * Estado de erro. Fase 10.2: migrado para Tailwind + tokens,
 * sem alert Bootstrap.
 */
export default function ErrorState({ message, onRetry, className = "" }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-xl text-center gap-md",
        className,
      )}
      role="alert"
    >
      <p className="text-body font-semibold text-danger m-0">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
