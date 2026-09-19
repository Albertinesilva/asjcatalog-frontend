import { useCallback, useEffect, useRef, useState } from "react";
import { usePagination } from "./usePagination";
import type { SpringPage } from "@/types";
import { getUiErrorMessage } from "@/utils/ui-error";

type Fetcher<T, F> = (args: { page: number; size: number; filters: F }) => Promise<SpringPage<T>>;

type Options<F> = {
  initialSize?: number;
  filters: F;
};

/**
 * Orquestra a paginação (via usePagination) + o fetch de uma SpringPage<T>.
 * - `usePagination` continua sendo a única fonte de estado da página/size.
 * - Este hook adiciona: dados, loading, error, reset ao trocar filtros e refetch.
 * - Só a resposta da requisição mais recente altera dados/erro/loading.
 * - Se a página atual ficou além do fim (ex.: exclusão do último item da última
 *   página), volta para a última página existente (ou a primeira, se não sobrou nada).
 */
export function usePagedQuery<T, F extends object>(
  fetcher: Fetcher<T, F>,
  { initialSize = 12, filters }: Options<F>,
) {
  const pagination = usePagination(initialSize);
  const { page, size, goToPage, setMeta } = pagination;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestRequest = useRef(0);

  const filtersKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher({ page, size, filters });
      if (requestId !== latestRequest.current) return;
      if (result.content.length === 0 && page > 0 && page >= result.totalPages) {
        // Mantém o loading: a página corrigida (`page` muda) dispara nova requisição.
        setMeta({ totalPages: result.totalPages, totalElements: result.totalElements });
        goToPage(Math.max(0, result.totalPages - 1));
        return;
      }
      setData(result.content);
      setMeta({ totalPages: result.totalPages, totalElements: result.totalElements });
      setIsLoading(false);
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setError(getUiErrorMessage(err));
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, page, size, filtersKey, setMeta, goToPage]);

  // Reset para a página 0 sempre que os filtros mudarem.
  useEffect(() => {
    goToPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    isLoading,
    error,
    pagination,
    refetch: load,
  };
}
