import { useEffect, useState } from "react";

/**
 * Retorna o `value` após aguardar `delay` ms sem novas alterações.
 * Útil para inputs de busca que disparam requisições ao backend.
 */
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
