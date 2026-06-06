import type { ProductPriceProps } from "@/types";
import styles from "./productprice.module.css";

function formatPrice(raw: string | number) {
  const n = Number(raw);
  if (Number.isNaN(n)) return { integer: String(raw), decimals: "00" };
  const [integer, decimals = "00"] = n
    .toFixed(2)
    .replace(".", ",")
    .split(",");
  const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return { integer: withThousands, decimals };
}

export default function ProductPrice({ price }: ProductPriceProps) {
  const { integer, decimals } = formatPrice(price);
  return (
    <div className={styles.productPriceContainer}>
      <span className={styles.currency}>R$</span>
      <h3 className={styles.priceInteger}>{integer}</h3>
      <span className={styles.priceDecimals}>,{decimals}</span>
    </div>
  );
}
