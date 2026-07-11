import { cn } from "@/components/ui";
import { evaluatePassword, type PasswordStrength as StrengthLabel } from "@/utils/password";

/**
 * PasswordStrength — 5-segment meter with a live label
 * ("Muito fraca" → "Forte"). Colors come from semantic tokens only.
 */
type Props = {
  password: string;
  className?: string;
};

const STRENGTH_COLORS: Record<StrengthLabel, { bar: string; text: string }> = {
  "Muito fraca": { bar: "bg-danger", text: "text-danger" },
  Fraca: { bar: "bg-danger", text: "text-danger" },
  Regular: { bar: "bg-warning", text: "text-warning" },
  Boa: { bar: "bg-accent", text: "text-accent" },
  Forte: { bar: "bg-success", text: "text-success" },
};

export default function PasswordStrength({ password, className }: Props) {
  const { score, strength } = evaluatePassword(password);
  const filled = password.length === 0 ? 0 : score;
  const total = 5;
  const palette = STRENGTH_COLORS[strength];

  return (
    <div className={cn("flex flex-col gap-xs", className)} aria-live="polite">
      <div className="flex items-center justify-between gap-sm">
        <span className="text-small font-medium text-foreground">Força da senha</span>
        <span className={cn("text-small font-semibold", filled === 0 ? "text-foreground-muted" : palette.text)}>
          {filled === 0 ? "—" : strength}
        </span>
      </div>
      <div
        className="flex items-center gap-1.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={filled}
        aria-label={`Força da senha: ${filled === 0 ? "vazia" : strength}`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-DEFAULT ease-standard",
              i < filled ? palette.bar : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}