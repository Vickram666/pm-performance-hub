import { useMemo, useState } from 'react';
import { Home, TrendingDown, RefreshCw, Smile, ShieldAlert, Trophy } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { KpiPill, KpiBar } from '@/components/acc/primitives/KpiPill';
import { OperationalCard, SectionHeader } from '@/components/acc/primitives/OperationalCard';
import { PeriodControls } from '@/components/acc/PeriodControls';
import { PeriodKpiStrip } from '@/components/acc/PeriodKpiStrip';
import { GlossaryHint } from '@/components/acc/Glossary';
import { getCityHealth, getChurnIntelligence, getCityRanking, type AccPeriod } from '@/data/accAggregators';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

type RankKey = 'avgScore' | 'retention' | 'sla' | 'renewals' | 'cx' | 'escalationRate' | 'churn';

const COLUMNS: { key: RankKey; label: string; suffix?: string; invert?: boolean; glossary?: 'sla' | 'churn' | 'escalation' }[] = [
  { key: 'avgScore', label: 'Avg Score' },
  { key: 'retention', label: 'Retention', suffix: '%' },
  { key: 'sla', label: 'SLA', suffix: '%', glossary: 'sla' },
  { key: 'renewals', label: 'Renewals', suffix: '%' },
  { key: 'cx', label: 'CX', suffix: '' },
  { key: 'escalationRate', label: 'Esc.', suffix: '%', invert: true, glossary: 'escalation' },
  { key: 'churn', label: 'Churn', suffix: '%', invert: true, glossary: 'churn' },
];

export default function LeadershipSnapshot() {
  const cities = useMemo(() => getCityHealth(), []);
  const ranking = useMemo(() => getCityRanking(), []);
  const churn = useMemo(() => getChurnIntelligence(), []);
  const [sortBy, setSortBy] = useState<RankKey>('avgScore');
  const [period, setPeriod] = useState<AccPeriod>('quarter');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const sorted = useMemo(() => {
    const col = COLUMNS.find(c => c.key === sortBy)!;
    return [...ranking].sort((a, b) => col.invert ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]);
  }, [ranking, sortBy]);

  const totals = cities.reduce(
    (a, c) => ({
      portfolio: a.portfolio + c.portfolio,
      occupancy: a.occupancy + c.occupancy,
      churn: a.churn + c.churn,
      renewals: a.renewals + c.renewalsPending,
      escalations: a.escalations + c.escalations,
      csat: a.csat + c.csat,
    }),
    { portfolio: 0, occupancy: 0, churn: 0, renewals: 0, escalations: 0, csat: 0 },
  );
  const n = cities.length || 1;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-16">
        <header className="border-b bg-card">
          <div className="container py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Leadership</p>
              <h1 className="text-xl font-semibold tracking-tight">Executive Snapshot</h1>
              <p className="text-xs text-muted-foreground">Biggest operational risks across the organization</p>
            </div>
            <PeriodControls period={period} onPeriodChange={setPeriod} dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
        </header>

        <div className="container py-4">
          <PeriodKpiStrip />
        </div>

        <KpiBar>
          <KpiPill label="Total portfolio" value={totals.portfolio} icon={<Home className="h-4 w-4" />} />
          <KpiPill label="Occupancy" value={`${Math.round(totals.occupancy / n)}%`} tone="success" />
          <KpiPill label="Renewal health" value={`${Math.round(((sorted[0]?.renewals ?? 0) + (sorted[sorted.length - 1]?.renewals ?? 0)) / 2)}%`} tone="info" icon={<RefreshCw className="h-4 w-4" />} />
          <KpiPill label="Churn" value={`${Math.round(totals.churn / n)}%`} tone={totals.churn / n > 8 ? 'critical' : 'neutral'} icon={<TrendingDown className="h-4 w-4" />} />
          <KpiPill label="Escalations" value={totals.escalations} tone={totals.escalations > 25 ? 'high' : 'neutral'} icon={<ShieldAlert className="h-4 w-4" />} />
          <KpiPill label="CSAT" value={(totals.csat / n).toFixed(1)} tone="success" icon={<Smile className="h-4 w-4" />} />
          <KpiPill label="Top city" value={sorted[0]?.city ?? '—'} tone="success" icon={<Trophy className="h-4 w-4" />} />
        </KpiBar>

        <main className="container py-6 space-y-8">
          <section>
            <SectionHeader title="City ranking" subtitle="Sortable by any operational dimension" />
            <OperationalCard className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left p-3 w-12">#</th>
                    <th className="text-left p-3">City</th>
                    {COLUMNS.map(c => (
                      <th key={c.key} className="text-right p-3">
                        <span className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setSortBy(c.key)}
                            className={cn(
                              'hover:text-foreground transition-colors',
                              sortBy === c.key && 'text-foreground font-semibold',
                            )}
                          >
                            {c.label}
                          </button>
                          {c.glossary && <GlossaryHint id={c.glossary} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, i) => (
                    <tr key={r.city} className="border-t hover:bg-muted/30">
                      <td className="p-3 text-muted-foreground tabular-nums">{i + 1}</td>
                      <td className="p-3 font-medium">{r.city}</td>
                      {COLUMNS.map(c => (
                        <td key={c.key} className={cn('p-3 text-right tabular-nums', sortBy === c.key && 'text-foreground font-medium')}>
                          {r[c.key]}{c.suffix ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </OperationalCard>
          </section>

          <section>
            <SectionHeader
              title={<span className="inline-flex items-center gap-1.5">Churn intelligence engine <GlossaryHint id="churn" /></span>}
              subtitle="Root causes and city distribution"
            />
            <div className="grid md:grid-cols-3 gap-3">
              <OperationalCard className="p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Renewal churn causes</p>
                <ul className="space-y-1.5">
                  {churn.renewalChurn.causes.map(c => (
                    <li key={c.label} className="flex items-center justify-between text-sm">
                      <span className="text-foreground/80 truncate">{c.label}</span>
                      <span className="tabular-nums text-muted-foreground">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </OperationalCard>
              <OperationalCard className="p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Re-rent churn causes</p>
                <ul className="space-y-1.5">
                  {churn.reRentChurn.causes.map(c => (
                    <li key={c.label} className="flex items-center justify-between text-sm">
                      <span className="text-foreground/80 truncate">{c.label}</span>
                      <span className="tabular-nums text-muted-foreground">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </OperationalCard>
              <OperationalCard className="p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">City churn rate</p>
                <ul className="space-y-1.5">
                  {churn.cityChurn.map(c => (
                    <li key={c.city} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-foreground/80">{c.city}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn('h-full', c.rate > 10 ? 'bg-urgency-critical' : c.rate > 6 ? 'bg-urgency-high' : 'bg-urgency-medium')}
                          style={{ width: `${Math.min(100, c.rate * 6)}%` }} />
                      </div>
                      <span className="tabular-nums w-10 text-right text-muted-foreground">{c.rate}%</span>
                    </li>
                  ))}
                </ul>
              </OperationalCard>
            </div>
          </section>

          <section>
            <SectionHeader title="Leadership review center" subtitle="Standing review queues" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { cadence: 'Weekly', title: 'Escalation review', count: totals.escalations, tone: 'critical' as const },
                { cadence: 'Weekly', title: 'Renewal review', count: totals.renewals, tone: 'high' as const },
                { cadence: 'Weekly', title: 'City review', count: cities.length, tone: 'medium' as const },
                { cadence: 'Monthly', title: 'Quality & PM review', count: '—', tone: 'low' as const },
              ].map(r => (
                <OperationalCard key={r.title} urgency={r.tone} className="p-4">
                  <div className="pl-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.cadence}</p>
                    <p className="font-medium text-sm mt-0.5">{r.title}</p>
                    <p className="text-2xl font-semibold tabular-nums mt-1">{r.count}</p>
                  </div>
                </OperationalCard>
              ))}
            </div>
          </section>
        </main>
      </div>
    </PageTransition>
  );
}
