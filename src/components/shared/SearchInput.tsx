import { useTranslation } from "react-i18next";
import { Button, Card, cn, inputBaseClasses } from "@/components/ui";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  clearLabel?: string;
  className?: string;
};

/**
 * Input de busca controlado + botão limpar.
 * Não faz debounce — use `useDebouncedValue` no consumidor.
 *
 * Fase 10.2: migrado para Tailwind + Design System (Card / Input / Button).
 */
export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder,
  ariaLabel,
  clearLabel,
  className = "",
}: Props) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("common:actions.search");
  const resolvedAria = ariaLabel ?? t("common:actions.search");
  const resolvedClear = clearLabel ?? t("common:actions.clear");
  const handleClear = () => {
    if (onClear) onClear();
    else onChange("");
  };

  return (
    <Card
      padding="sm"
      bordered
      elevated={false}
      className={cn("flex flex-col md:flex-row gap-sm flex-grow", className)}
    >
      <input
        type="search"
        className={cn(inputBaseClasses, "flex-grow border-transparent bg-transparent shadow-none")}
        placeholder={resolvedPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={resolvedAria}
      />
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={handleClear}
        className="md:min-w-[150px]"
      >
        {resolvedClear}
      </Button>
    </Card>
  );
}
