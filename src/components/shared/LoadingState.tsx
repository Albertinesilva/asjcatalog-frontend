import { cn } from "@/components/ui";

type Props = { message?: string; className?: string };

/**
 * Estado de carregamento. Fase 10.2: spinner próprio em Tailwind,
 * sem dependência do `spinner-border` do Bootstrap.
 */
export default function LoadingState({ message = "Carregando...", className = "" }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-xl text-foreground-muted",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <svg
        className="animate-spin mb-sm text-primary"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
        <path
          d="M22 12a10 10 0 0 1-10 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="text-body">{message}</span>
    </div>
  );
}
