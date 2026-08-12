import { cn } from "../cn";

type Props = React.HTMLAttributes<HTMLDivElement>;

/**
 * Skeleton base do Design System.
 * Elemento puramente decorativo: escondido de tecnologias assistivas.
 * A animação é desativada automaticamente com `prefers-reduced-motion`.
 */
export default function Skeleton({ className, ...props }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse motion-reduce:animate-none rounded-md bg-surface-hover",
        className,
      )}
      {...props}
    />
  );
}
