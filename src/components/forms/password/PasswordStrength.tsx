import { useTranslation } from "react-i18next";
import { cn } from "@/components/ui";
import { evaluatePassword, type PasswordStrengthKey } from "@/utils/password";

type Props = { password: string; className?: string };

const STRENGTH_COLORS: Record<PasswordStrengthKey, { bar: string; text: string }> = {
  veryWeak: { bar: "bg-danger", text: "text-danger" },
  weak: { bar: "bg-danger", text: "text-danger" },
  regular: { bar: "bg-warning", text: "text-warning" },
  good: { bar: "bg-accent", text: "text-accent" },
  strong: { bar: "bg-success", text: "text-success" },
};

export default function PasswordStrength({ password, className }: Props) {
  const { t } = useTranslation();
  const { score, strength } = evaluatePassword(password);
  const filled = password.length === 0 ? 0 : score;
  const total = 5;
  const palette = STRENGTH_COLORS[strength];
  const percent = Math.round((filled / total) * 100);
  const strengthLabel = t(`validation:password.strength.${strength}`);
  const emptyLabel = t("validation:password.empty");

  return (
    <div className={cn("flex flex-col gap-xs", className)} aria-live="polite">
      <div className="flex items-center justify-between gap-sm">
        <span className="text-small font-medium text-foreground">
          {t("validation:password.strengthLabel")}
        </span>
        <span className="flex items-center gap-sm">
          <span className="text-caption font-medium tabular-nums text-foreground-muted">
            {filled === 0 ? "0%" : `${percent}%`}
          </span>
          <span
            className={cn(
              "text-small font-semibold transition-colors duration-slow ease-standard",
              filled === 0 ? "text-foreground-muted" : palette.text,
            )}
          >
            {filled === 0 ? "—" : strengthLabel}
          </span>
        </span>
      </div>
      <div
        className="flex items-center gap-1.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={filled}
        aria-label={t("validation:password.strengthAria", {
          state: filled === 0 ? emptyLabel : strengthLabel,
        })}
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-slow ease-standard",
              i < filled ? palette.bar : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
