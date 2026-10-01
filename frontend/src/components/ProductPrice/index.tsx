import type { ProductPriceProps } from "@/types";
import { cn } from "@/components/ui/cn";

/**
 * ProductPrice — Fase 10.4.
 * Formatação BRL com hierarquia visual, migrado para Tailwind + tokens.
 * Implementação única de preço de produto (catálogo e dashboard).
 */
type Props = ProductPriceProps & {
  /** `md`: card e detalhe do catálogo. `sm`: linha compacta de listagem. */
  size?: "md" | "sm";
  className?: string;
};

function formatPrice(raw: string | number) {
  const n = Number(raw);
  if (Number.isNaN(n)) return { integer: String(raw), decimals: "00" };
  const [integer, decimals = "00"] = n.toFixed(2).replace(".", ",").split(",");
  const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return { integer: withThousands, decimals };
}

export default function ProductPrice({ price, size = "md", className }: Props) {
  const { integer, decimals } = formatPrice(price);
  return (
    <div className={cn("flex items-baseline gap-1", className)}>
      <span className="text-small font-semibold text-foreground-muted">R$</span>
      <span
        className={cn(
          "font-heading font-bold text-primary leading-none",
          size === "sm" ? "text-title" : "text-h3",
        )}
      >
        {integer}
      </span>
      <span className="text-small font-semibold text-primary">,{decimals}</span>
    </div>
  );
}
