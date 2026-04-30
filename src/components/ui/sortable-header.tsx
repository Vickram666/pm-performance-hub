import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortConfig, SortDirection } from '@/hooks/useSortableData';

interface SortableHeaderProps<K extends string> {
  label: React.ReactNode;
  sortKey: K;
  sortConfig: SortConfig<K> | null;
  onSort: (key: K) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function SortableHeader<K extends string>({
  label, sortKey, sortConfig, onSort, align = 'left', className,
}: SortableHeaderProps<K>) {
  const active = sortConfig?.key === sortKey;
  const dir: SortDirection | null = active ? sortConfig!.direction : null;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 select-none hover:text-foreground transition-colors',
        active ? 'text-foreground font-semibold' : 'text-muted-foreground',
        align === 'center' && 'justify-center w-full',
        align === 'right' && 'justify-end w-full',
        className,
      )}
    >
      <span>{label}</span>
      {dir === 'asc' ? <ArrowUp className="h-3 w-3" /> :
       dir === 'desc' ? <ArrowDown className="h-3 w-3" /> :
       <ArrowUpDown className="h-3 w-3 opacity-40" />}
    </button>
  );
}
