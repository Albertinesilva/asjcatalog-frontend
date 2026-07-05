import type { ProductPriceProps } from "@/types";

/**
 * ProductPrice — Fase 10.4.
 * Formatação BRL com hierarquia visual, migrado para Tailwind + tokens.
 */
function formatPrice(raw: string | number) {
  const n = Number(raw);
  if (Number.isNaN(n)) return { integer: String(raw), decimals: "00" };
  const [integer, decimals = "00"] = n.toFixed(2).replace(".", ",").split(",");
  const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return { integer: withThousands, decimals };
}

export default function ProductPrice({ price }: ProductPriceProps) {
  const { integer, decimals } = formatPrice(price);
  return (
    <div className="flex items-baseline gap-1 mt-md">
      <span className="text-small font-semibold text-foreground-muted">R$</span>
      <span className="font-heading text-h3 font-bold text-primary leading-none">{integer}</span>
      <span className="text-small font-semibold text-primary">,{decimals}</span>
    </div>
  );
}
