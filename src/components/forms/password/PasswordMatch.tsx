import { useTranslation } from "react-i18next";
import { cn } from "@/components/ui";

type Props = { password: string; confirm: string; className?: string };

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CrossIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function PasswordMatch({ password, confirm, className }: Props) {
  const { t } = useTranslation();
  if (!confirm) return null;
  const match = password === confirm;
  return (
    <p
      className={cn(
        "m-0 flex items-center gap-xs text-small animate-fade-in transition-colors duration-slow ease-standard",
        match ? "text-success" : "text-danger",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {match ? <CheckIcon /> : <CrossIcon />}
      <span>{match ? t("validation:password.match.ok") : t("validation:password.match.no")}</span>
    </p>
  );
}
