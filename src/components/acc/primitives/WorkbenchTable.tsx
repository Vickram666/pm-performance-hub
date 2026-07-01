import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Dense, enterprise-style table primitive for the operational workbench.
 * Fixed compact row height, zebra striping, sticky header, muted borders.
 * Use plain <thead>/<tbody> children so callers stay in control.
 */
export function WorkbenchTable({
  children,
  className,
  minWidth = 900,
}: {
  children: ReactNode;
  className?: string;
  minWidth?: number;
}) {
  return (
    <div className={cn('border border-border rounded-md bg-card overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table
          className="w-full text-[13px] border-collapse"
          style={{ minWidth }}
        >
          {children}
        </table>
      </div>
    </div>
  );
}

export function WBHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-muted/60 sticky top-0 z-10">
      <tr className="[&>th]:h-9 [&>th]:px-2.5 [&>th]:text-left [&>th]:font-medium [&>th]:text-[11px] [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-muted-foreground [&>th]:border-b [&>th]:border-border">
        {children}
      </tr>
    </thead>
  );
}

export function WBBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="[&>tr]:border-b [&>tr]:border-border/60 [&>tr:last-child]:border-b-0 [&>tr:nth-child(even)]:bg-muted/20 [&>tr:hover]:bg-primary/5 [&>tr>td]:h-9 [&>tr>td]:px-2.5 [&>tr>td]:align-middle">
      {children}
    </tbody>
  );
}

export function WBEmpty({ colSpan, message = 'No records match the current filters.' }: { colSpan: number; message?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center text-xs text-muted-foreground !py-8">
        {message}
      </td>
    </tr>
  );
}

/** Compact section header (36px) for workbench sections — no card wrapper. */
export function WBSection({
  title,
  subtitle,
  count,
  right,
  children,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  count?: number;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3 min-h-[32px]">
        <div className="flex items-baseline gap-2 min-w-0">
          <h2 className="text-[13px] font-semibold tracking-tight uppercase text-foreground/90">{title}</h2>
          {typeof count === 'number' && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground tabular-nums">
              {count}
            </span>
          )}
          {subtitle && <span className="text-[11px] text-muted-foreground truncate">— {subtitle}</span>}
        </div>
        {right && <div className="flex items-center gap-1.5 flex-wrap">{right}</div>}
      </div>
      {children}
    </section>
  );
}
