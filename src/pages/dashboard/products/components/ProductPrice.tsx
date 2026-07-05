type Props = { value: number };

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function ProductPrice({ value }: Props) {
  return (
    <span className="font-heading font-bold text-title text-success">
      {formatter.format(value)}
    </span>
  );
}