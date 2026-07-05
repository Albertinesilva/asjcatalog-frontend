type Props = { name: string };

export default function ProductCategoryBadge({ name }: Props) {
  return (
    <span
      className="badge rounded-pill text-uppercase"
      style={{
        backgroundColor: "#e6f7f2",
        color: "#1a8a6d",
        fontWeight: 600,
        letterSpacing: "0.03em",
        padding: "6px 12px",
        fontSize: 11,
      }}
    >
      {name}
    </span>
  );
}