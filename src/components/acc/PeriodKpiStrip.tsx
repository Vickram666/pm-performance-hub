import { useMemo } from 'react';
import { OperationalCard } from './primitives/OperationalCard';
import { GlossaryHint } from './Glossary';
import { Timer, Flame, AlertOctagon, AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { getServiceRequests, getRentLedger, getInspectionRecords, getScoreImpact } from '@/data/accOperationsData';
import { cn } from '@/lib/utils';

interface Props {
  scope?: { city?: string };
}

export function PeriodKpiStrip({ scope }: Props) {
  const data = useMemo(() => {
    const inCity = (c: string) => !scope?.city || c === scope.city;
    const srs = getServiceRequests().filter(s => inCity(s.city));
    const rent = getRentLedger().filter(r => inCity(r.city));
    const insp = getInspectionRecords().filter(i => inCity(i.city));

    const srActive = srs.filter(s => s.stage !== 'closed');
    const tatOk = srActive.filter(s => s.withinTat).length;
    const tatPct = srActive.length ? Math.round((tatOk / srActive.length) * 100) : 100;

    const allTasks = [
      ...srActive.map(s => ({ urg: !s.withinTat ? 'critical' : s.stage === 'open' ? 'high' : 'medium', cat: 'sr', age: s.raisedDaysAgo })),
      ...rent.filter(r => r.status !== 'paid').map(r => ({
        urg: r.status === 'defaulter' || r.status === 'critically_overdue' ? 'critical' : r.status === 'overdue' ? 'high' : 'medium',
        cat: 'rent', age: r.daysLate,
      })),
      ...insp.filter(i => i.status !== 'completed').map(i => ({
        urg: i.daysOverdue > 14 ? 'critical' : i.daysOverdue > 7 ? 'high' : 'medium',
        cat: i.type === 'periodic' ? 'inspection' : i.type, age: i.daysOverdue,
      })),
    ];

    const byUrg = { critical: 0, high: 0, medium: 0 } as Record<string, number>;
    const byCat: Record<string, number> = {};
    let totalPts = 0;
    allTasks.forEach(t => {
      byUrg[t.urg] = (byUrg[t.urg] ?? 0) + 1;
      byCat[t.cat] = (byCat[t.cat] ?? 0) + 1;
      const impact = getScoreImpact(t.cat as Parameters<typeof getScoreImpact>[0], t.age);
      totalPts += impact?.pointsAtRisk ?? 0;
    });

    return { tatPct, total: allTasks.length, byUrg, byCat, totalPts };
  }, [scope]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <KpiCell
        icon={<Timer className="h-3.5 w-3.5" />}
        label={<>TAT compliance <GlossaryHint id="tat" /></>}
        value={`${data.tatPct}%`}
        tone={data.tatPct >= 85 ? 'good' : data.tatPct >= 70 ? 'warn' : 'bad'}
        hint="Open SRs within TAT window"
      />
      <KpiCell
        icon={<Activity className="h-3.5 w-3.5" />}
        label={<>Open by urgency <GlossaryHint id="flagged" /></>}
        value={
          <span className="flex items-baseline gap-1.5">
            <span className="text-urgency-critical font-semibold tabular-nums">{data.byUrg.critical}</span>
            <span className="text-muted-foreground text-[10px]">crit</span>
            <span className="text-urgency-high font-semibold tabular-nums">{data.byUrg.high}</span>
            <span className="text-muted-foreground text-[10px]">high</span>
            <span className="text-urgency-medium font-semibold tabular-nums">{data.byUrg.medium}</span>
            <span className="text-muted-foreground text-[10px]">med</span>
          </span>
        }
        tone={data.byUrg.critical > 0 ? 'bad' : data.byUrg.high > 5 ? 'warn' : 'good'}
        hint={`${data.total} tasks in period`}
      />
      <KpiCell
        icon={<Flame className="h-3.5 w-3.5" />}
        label="Top category"
        value={
          <span className="flex items-baseline gap-2 flex-wrap">
            {Object.entries(data.byCat).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-xs">
                <span className="font-semibold tabular-nums">{v}</span>{' '}
                <span className="text-muted-foreground capitalize">{k.replace('_', ' ')}</span>
              </span>
            ))}
            {Object.keys(data.byCat).length === 0 && <span className="text-muted-foreground text-xs">none</span>}
          </span>
        }
        tone="neutral"
        hint="By task category"
      />
      <KpiCell
        icon={<TrendingDown className="h-3.5 w-3.5" />}
        label={<>Score at risk <GlossaryHint id="scoreImpact" /></>}
        value={<span><span className="text-urgency-critical">−{data.totalPts}</span><span className="text-xs text-muted-foreground"> pts</span></span>}
        tone={data.totalPts > 30 ? 'bad' : data.totalPts > 10 ? 'warn' : 'good'}
        hint="Cumulative impact on portfolio"
      />
    </div>
  );
}

function KpiCell({ icon, label, value, tone, hint }: {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: React.ReactNode;
  tone: 'good' | 'warn' | 'bad' | 'neutral';
  hint?: string;
}) {
  const ring = tone === 'good' ? 'border-l-urgency-low' : tone === 'warn' ? 'border-l-urgency-medium' : tone === 'bad' ? 'border-l-urgency-critical' : 'border-l-border';
  return (
    <OperationalCard className={cn('p-3 border-l-4', ring)}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      <div className="mt-1 text-xl font-semibold leading-tight">{value}</div>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </OperationalCard>
  );
}
