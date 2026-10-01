import { useCallback, useEffect, useState } from "react";
import { getUiErrorMessage, isNotFoundError } from "@/utils/ui-error";

export type ResourceState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "notFound" }
  | { status: "error"; message: string };

type Entry<T> = { source: unknown; attempt: number; state: ResourceState<T> };

/**
 * Carrega um recurso único (detalhe/edição) distinguindo os quatro estados:
 * carregando, encontrado, inexistente (HTTP 404) e falha de comunicação/API.
 *
 * - `fetcher` deve ser estável (`useCallback`); trocá-lo (ex.: outro `id`) inicia
 *   nova carga e o estado anterior nunca é exibido para o novo recurso.
 * - `null` desativa a carga (`idle`), útil para modo "create".
 * - Só a resposta da requisição mais recente pode alterar o estado.
 * - `reload` repete a mesma operação (retry).
 */
export function useResource<T>(fetcher: (() => Promise<T>) | null) {
  const [entry, setEntry] = useState<Entry<T> | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!fetcher) return;
    // A limpeza invalida esta requisição quando o fetcher/tentativa muda ou o
    // componente desmonta: só a mais recente pode alterar o estado.
    let active = true;
    const settle = (state: ResourceState<T>) => {
      if (active) setEntry({ source: fetcher, attempt, state });
    };
    fetcher().then(
      (data) => settle({ status: "success", data }),
      (err: unknown) =>
        settle(
          isNotFoundError(err)
            ? { status: "notFound" }
            : { status: "error", message: getUiErrorMessage(err) },
        ),
    );
    return () => {
      active = false;
    };
  }, [fetcher, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const state: ResourceState<T> = !fetcher
    ? { status: "idle" }
    : entry && entry.source === fetcher && entry.attempt === attempt
      ? entry.state
      : { status: "loading" };

  return { state, reload };
}
