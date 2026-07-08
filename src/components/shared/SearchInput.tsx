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
  placeholder = "Pesquisar",
  ariaLabel = "Pesquisar",
  clearLabel = "Limpar filtro",
  className = "",
}: Props) {
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
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      />
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={handleClear}
        className="md:min-w-[150px]"
      >
        {clearLabel}
      </Button>
    </Card>
  );
}
