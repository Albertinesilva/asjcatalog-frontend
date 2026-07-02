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
 */
export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Pesquisar",
  ariaLabel = "Pesquisar",
  clearLabel = "LIMPAR FILTRO",
  className = "",
}: Props) {
  const handleClear = () => {
    if (onClear) onClear();
    else onChange("");
  };

  return (
    <div className={`card-base border-radius-10 d-flex flex-column flex-md-row gap-2 flex-grow-1 p-2 ${className}`}>
      <input
        type="search"
        className="form-control border-0 flex-grow-1"
        style={{ height: 46 }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        style={{ height: 46, borderRadius: 10, minWidth: 150 }}
        onClick={handleClear}
      >
        {clearLabel}
      </button>
    </div>
  );
}