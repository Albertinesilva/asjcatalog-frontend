import { Badge } from "@/components/ui";

type Props = { name: string };

/**
 * ProductCategoryBadge — Fase 10.4.
 * Migrado para o Badge do Design System.
 */
export default function ProductCategoryBadge({ name }: Props) {
  return (
    <Badge variant="outline" className="uppercase tracking-wider">
      {name}
    </Badge>
  );
}