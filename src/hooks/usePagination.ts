import { useCallback, useState } from "react";

export type PaginationState = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
};

export function usePagination(initialSize = 12) {
  const [state, setState] = useState<PaginationState>({
    page: 0,
    size: initialSize,
    totalPages: 0,
    totalElements: 0,
  });

  const goToPage = useCallback((page: number) => {
    setState((s) => ({ ...s, page }));
  }, []);

  const setSize = useCallback((size: number) => {
    setState((s) => ({ ...s, size, page: 0 }));
  }, []);

  const setMeta = useCallback(
    (meta: { totalPages: number; totalElements: number }) => {
      setState((s) => ({ ...s, ...meta }));
    },
    [],
  );

  return { ...state, goToPage, setSize, setMeta };
}