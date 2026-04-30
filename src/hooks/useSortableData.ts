import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<K extends string = string> {
  key: K;
  direction: SortDirection;
}

/**
 * Generic sortable data hook.
 * Pass an `accessors` map: { columnKey: (row) => primitive } so sorting
 * works against derived values (e.g. nested fields, counts, dates).
 */
export function useSortableData<T, K extends string>(
  items: T[],
  accessors: Record<K, (row: T) => string | number | null | undefined>,
  initial?: SortConfig<K> | null,
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<K> | null>(initial ?? null);

  const sorted = useMemo(() => {
    if (!sortConfig) return items;
    const accessor = accessors[sortConfig.key];
    if (!accessor) return items;
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [items, sortConfig, accessors]);

  const requestSort = (key: K) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) return { key, direction: 'desc' };
      if (prev.direction === 'desc') return { key, direction: 'asc' };
      return null; // third click clears
    });
  };

  return { sortedItems: sorted, sortConfig, requestSort };
}
