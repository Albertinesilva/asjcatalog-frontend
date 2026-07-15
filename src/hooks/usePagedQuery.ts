import { useCallback, useEffect, useState } from "react";
import { usePagination } from "./usePagination";
import type { SpringPage } from "@/types";
import { getApiErrorMessage } from "@/utils/api-error";

type Fetcher<T, F> = (args: { page: number; size: number; filters: F }) => Promise<SpringPage<T>>;

type Options<F> = {
  initialSize?: number;
  filters: F;
};

/**
 * Orquestra a paginação (via usePagination) + o fetch de uma SpringPage<T>.
 * - `usePagination` continua sendo a única fonte de estado da página/size.
 * - Este hook adiciona: dados, loading, error, reset ao trocar filtros e refetch.
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

  const filtersKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher({ page, size, filters });
      setData(result.content);
      setMeta({ totalPages: result.totalPages, totalElements: result.totalElements });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, page, size, filtersKey, setMeta]);

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
