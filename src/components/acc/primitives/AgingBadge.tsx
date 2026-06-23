import { cn } from '@/lib/utils';

export function AgingBadge({ days, className }: { days: number; className?: string }) {
  const tone =
    days >= 7 ? 'bg-urgency-critical-soft text-urgency-critical'
    : days >= 3 ? 'bg-urgency-high-soft text-urgency-high'
    : days >= 1 ? 'bg-urgency-medium-soft text-urgency-medium'
    : 'bg-muted text-muted-foreground';
  const label = days <= 0 ? 'today' : `${days}d aging`;
  return (
    <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium', tone, className)}>
      {label}
    </span>
  );
}

export function UrgencyDot({ urgency }: { urgency: 'critical' | 'high' | 'medium' | 'low' }) {
  const color = {
    critical: 'bg-urgency-critical',
    high: 'bg-urgency-high',
    medium: 'bg-urgency-medium',
    low: 'bg-urgency-low',
  }[urgency];
  return <span className={cn('inline-block h-2 w-2 rounded-full', color)} />;
}

export function SlaTimer({ hoursLeft }: { hoursLeft: number }) {
  const overdue = hoursLeft < 0;
  const tone = overdue
    ? 'text-urgency-critical'
    : hoursLeft < 4 ? 'text-urgency-high'
    : hoursLeft < 24 ? 'text-urgency-medium'
    : 'text-muted-foreground';
  const text = overdue
    ? `${Math.abs(Math.round(hoursLeft))}h overdue`
    : hoursLeft < 24
      ? `${Math.round(hoursLeft)}h left`
      : `${Math.round(hoursLeft / 24)}d left`;
  return <span className={cn('text-[11px] font-medium tabular-nums', tone)}>{text}</span>;
}
