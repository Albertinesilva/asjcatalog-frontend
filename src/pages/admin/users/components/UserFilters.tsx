type Props = {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
};

export default function UserFilters({ value, onChange, onClear }: Props) {
  return (
    <div className="card-base border-radius-10 d-flex flex-column flex-md-row gap-2 flex-grow-1 p-2">
      <input
        className="form-control border-0 flex-grow-1"
        style={{ height: 46 }}
        placeholder="Pesquisar por nome"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Pesquisar por nome"
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        style={{ height: 46, borderRadius: 10, minWidth: 150 }}
        onClick={onClear}
      >
        LIMPAR FILTRO
      </button>
    </div>
  );
}