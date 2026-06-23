import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type Tone = 'neutral' | 'critical' | 'high' | 'medium' | 'success' | 'info';

const toneStyles: Record<Tone, { bar: string; value: string }> = {
  neutral: { bar: 'bg-muted-foreground/40', value: 'text-foreground' },
  critical: { bar: 'bg-urgency-critical', value: 'text-urgency-critical' },
  high: { bar: 'bg-urgency-high', value: 'text-urgency-high' },
  medium: { bar: 'bg-urgency-medium', value: 'text-urgency-medium' },
  success: { bar: 'bg-success', value: 'text-success' },
  info: { bar: 'bg-info', value: 'text-info' },
};

interface Props {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: Tone;
  to?: string;
  icon?: ReactNode;
}

export function KpiPill({ label, value, hint, tone = 'neutral', to, icon }: Props) {
  const t = toneStyles[tone];
  const inner = (
    <div className="relative flex-1 min-w-[140px] flex items-center gap-3 px-3 py-2.5 rounded-md bg-card border border-border/70 hover:border-border transition-colors">
      <span className={cn('absolute left-0 top-2 bottom-2 w-[3px] rounded-r', t.bar)} />
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className={cn('text-lg font-semibold leading-none', t.value)}>{value}</span>
          {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to} className="contents">{inner}</Link> : inner;
}

export function KpiBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-14 z-40 -mx-4 px-4 py-2 bg-background/95 backdrop-blur border-b border-border/60">
      <div className="container px-0 flex gap-2 overflow-x-auto scrollbar-none">
        {children}
      </div>
    </div>
  );
}
