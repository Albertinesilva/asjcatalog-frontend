import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import EmptyState from "./EmptyState";

type Props = {
  /** Rota de retorno (lista/catálogo de origem). */
  backTo: string;
  backLabel?: string;
  title?: string;
  description?: string;
};

/**
 * Recurso inexistente (HTTP 404) em páginas de detalhe/edição.
 * Distinto de `ErrorState` (falha de rede/API, recuperável com retry) e da
 * `NotFoundPage` global (rota inexistente).
 */
export default function NotFoundState({ backTo, backLabel, title, description }: Props) {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={title ?? t("common:states.notFound")}
      description={description ?? t("common:states.notFoundDescription")}
      action={
        <Link to={backTo}>
          <Button variant="primary">{backLabel ?? t("common:actions.back")}</Button>
        </Link>
      }
    />
  );
}
