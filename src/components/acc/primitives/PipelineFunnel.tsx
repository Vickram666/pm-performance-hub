import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  tone?: 'open' | 'active' | 'aligned' | 'risk' | 'closed';
  to?: string;
}

const toneBg: Record<NonNullable<FunnelStage['tone']>, string> = {
  open: 'bg-info/10 border-info/30 text-info',
  active: 'bg-pillar-financial/10 border-pillar-financial/30 text-pillar-financial',
  aligned: 'bg-success/10 border-success/30 text-success',
  risk: 'bg-urgency-critical-soft border-urgency-critical/30 text-urgency-critical',
  closed: 'bg-muted border-border text-muted-foreground',
};

export function PipelineFunnel({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(1, ...stages.map(s => s.count));
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
      {stages.map((s) => {
        const tone = s.tone ?? 'open';
        const width = 40 + (s.count / max) * 60;
        const card = (
          <div
            className={cn(
              'relative rounded-md border p-2.5 h-full transition-all hover:-translate-y-0.5 hover:shadow-sm',
              toneBg[tone],
            )}
          >
            <p className="text-[10px] font-medium uppercase tracking-wider opacity-80 truncate">{s.label}</p>
            <p className="text-xl font-semibold tabular-nums mt-0.5">{s.count}</p>
            <div className="mt-1.5 h-1 rounded-full bg-current/10 overflow-hidden">
              <div className="h-full bg-current/60" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
        return s.to
          ? <Link key={s.key} to={s.to} className="contents">{card}</Link>
          : <div key={s.key}>{card}</div>;
      })}
    </div>
  );
}
