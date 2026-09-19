import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, cn, inputBaseClasses } from "@/components/ui";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  clearLabel?: string;
  /**
   * Filtros adicionais (ex.: categoria) entre o campo e o botão de limpar. Com `filters`
   * a barra vira um bloco único, com divisórias (padrão do Catálogo).
   */
  filters?: ReactNode;
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
  filters,
  className = "",
}: Props) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("common:actions.search");
  const resolvedAria = ariaLabel ?? t("common:actions.search");
  const resolvedClear = clearLabel ?? t("common:actions.clear");
  const joined = Boolean(filters);
  const handleClear = () => {
    if (onClear) onClear();
    else onChange("");
  };

  return (
    <Card
      padding={joined ? "none" : "sm"}
      bordered
      elevated={false}
      className={cn(
        joined
          ? "flex flex-col md:flex-row md:items-stretch overflow-hidden"
          : "flex flex-col md:flex-row gap-sm flex-grow",
        className,
      )}
    >
      <input
        type="search"
        className={cn(
          inputBaseClasses,
          joined
            ? "flex-1 border-0 shadow-none bg-transparent md:border-r md:border-border rounded-none"
            : "flex-grow border-transparent bg-transparent shadow-none",
        )}
        placeholder={resolvedPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={resolvedAria}
      />
      {filters}
      <Button
        type="button"
        variant={joined ? "ghost" : "secondary"}
        size="md"
        onClick={handleClear}
        className={
          joined
            ? "rounded-none md:min-w-[160px] text-foreground-muted hover:text-accent"
            : "md:min-w-[150px]"
        }
      >
        {resolvedClear}
      </Button>
    </Card>
  );
}
