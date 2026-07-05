type Props = { value: number };

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function ProductPrice({ value }: Props) {
  return <span className="fw-bold" style={{ color: "#2e7d32" }}>{formatter.format(value)}</span>;
}