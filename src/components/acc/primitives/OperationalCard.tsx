import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Urgency = 'critical' | 'high' | 'medium' | 'low' | 'none';

const accent: Record<Urgency, string> = {
  critical: 'before:bg-urgency-critical',
  high: 'before:bg-urgency-high',
  medium: 'before:bg-urgency-medium',
  low: 'before:bg-urgency-low',
  none: 'before:hidden',
};

interface Props {
  children: ReactNode;
  urgency?: Urgency;
  className?: string;
  onClick?: () => void;
}

export function OperationalCard({ children, urgency = 'none', className, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-card rounded-lg border border-border/70 shadow-card transition-all',
        'before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[3px] before:rounded-r',
        accent[urgency],
        onClick && 'cursor-pointer hover:border-border hover:shadow-card-hover',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  count,
  right,
}: {
  title: ReactNode;
  subtitle?: string;
  count?: number;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {typeof count === 'number' && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {count}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
