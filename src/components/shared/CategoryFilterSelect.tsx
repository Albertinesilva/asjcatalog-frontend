import type { Category } from "@/types";
import { Select } from "@/components/ui";

type Props = {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
  /** Texto da opção vazia ("todas as categorias"). */
  placeholder: string;
  ariaLabel: string;
};

/**
 * Filtro de categoria embutido na barra de busca (`SearchInput` com `filters`).
 * Fonte única do visual usado no Catálogo e na lista de produtos do Dashboard.
 */
export default function CategoryFilterSelect({
  categories,
  value,
  onChange,
  placeholder,
  ariaLabel,
}: Props) {
  return (
    <Select
      wrapperClassName="flex-1"
      className="border-0 shadow-none bg-transparent md:border-r md:border-border rounded-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
    >
      <option value="">{placeholder}</option>
      {categories.map((c) => (
        <option key={c.id} value={String(c.id)}>
          {c.name}
        </option>
      ))}
    </Select>
  );
}
