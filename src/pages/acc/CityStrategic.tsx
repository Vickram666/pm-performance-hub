import { useMemo, useState } from 'react';
import { Home, TrendingDown, RefreshCw, AlertTriangle, Smile, Users, BarChart3 } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { KpiPill, KpiBar } from '@/components/acc/primitives/KpiPill';
import { OperationalCard, SectionHeader } from '@/components/acc/primitives/OperationalCard';
import { PeriodControls } from '@/components/acc/PeriodControls';
import { PeriodKpiStrip } from '@/components/acc/PeriodKpiStrip';
import { GlossaryHint } from '@/components/acc/Glossary';
import { getCityHealth, getChurnIntelligence, type AccPeriod } from '@/data/accAggregators';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

function heatTone(value: number, invert = false) {
  const v = invert ? 100 - value : value;
  if (v >= 80) return 'bg-success/20 text-success';
  if (v >= 60) return 'bg-info/15 text-info';
  if (v >= 40) return 'bg-urgency-medium-soft text-urgency-medium';
  return 'bg-urgency-critical-soft text-urgency-critical';
}

export default function CityStrategic() {
  const cities = useMemo(() => getCityHealth(), []);
  const churn = useMemo(() => getChurnIntelligence(), []);
  const [period, setPeriod] = useState<AccPeriod>('month');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const totals = cities.reduce(
    (a, c) => ({
      portfolio: a.portfolio + c.portfolio,
      occupancy: a.occupancy + c.occupancy,
      churn: a.churn + c.churn,
      renewals: a.renewals + c.renewalsPending,
      escalations: a.escalations + c.escalations,
      csat: a.csat + c.csat,
      pms: a.pms + c.pmCount,
    }),
    { portfolio: 0, occupancy: 0, churn: 0, renewals: 0, escalations: 0, csat: 0, pms: 0 },
  );
  const n = cities.length || 1;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-16">
        <header className="border-b bg-card">
          <div className="container py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">City Lead</p>
              <h1 className="text-xl font-semibold tracking-tight">Strategic Overview</h1>
              <p className="text-xs text-muted-foreground">Where are we winning, and where are we losing customers?</p>
            </div>
            <PeriodControls period={period} onPeriodChange={setPeriod} dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
        </header>

        <div className="container py-4">
          <PeriodKpiStrip />
        </div>

        <KpiBar>
          <KpiPill label="Portfolio" value={totals.portfolio} icon={<Home className="h-4 w-4" />} />
          <KpiPill label="Avg occupancy" value={`${Math.round(totals.occupancy / n)}%`} tone="success" />
          <KpiPill label="Avg churn" value={`${Math.round(totals.churn / n)}%`} tone={totals.churn / n > 8 ? 'critical' : 'neutral'} icon={<TrendingDown className="h-4 w-4" />} />
          <KpiPill label="Renewals pending" value={totals.renewals} icon={<RefreshCw className="h-4 w-4" />} />
          <KpiPill label="Escalations" value={totals.escalations} tone={totals.escalations > 20 ? 'high' : 'neutral'} icon={<AlertTriangle className="h-4 w-4" />} />
          <KpiPill label="CSAT" value={(totals.csat / n).toFixed(1)} tone="success" icon={<Smile className="h-4 w-4" />} />
          <KpiPill label="PMs" value={totals.pms} icon={<Users className="h-4 w-4" />} />
        </KpiBar>

        <main className="container py-6 space-y-8">
          <section>
            <SectionHeader
              title={<span className="inline-flex items-center gap-1.5">Churn intelligence <GlossaryHint id="churn" /></span>}
              subtitle="Renewal vs re-renting leakage"
            />
            <div className="grid md:grid-cols-2 gap-3">
              <OperationalCard className="p-4">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Renewal churn</p>
                    <p className="text-2xl font-semibold">{churn.renewalChurn.total}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">root causes</span>
                </div>
                <ul className="space-y-1.5">
                  {churn.renewalChurn.causes.map(c => (
                    <li key={c.label} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-foreground/80">{c.label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-urgency-critical" style={{ width: `${(c.count / Math.max(churn.renewalChurn.total, 1)) * 100}%` }} />
                      </div>
                      <span className="tabular-nums w-8 text-right text-muted-foreground">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </OperationalCard>

              <OperationalCard className="p-4">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Re-renting churn</p>
                    <p className="text-2xl font-semibold">{churn.reRentChurn.total}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">leakage breakdown</span>
                </div>
                <ul className="space-y-1.5">
                  {churn.reRentChurn.causes.map(c => (
                    <li key={c.label} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-foreground/80">{c.label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-urgency-high" style={{ width: `${(c.count / Math.max(churn.reRentChurn.total, 1)) * 100}%` }} />
                      </div>
                      <span className="tabular-nums w-8 text-right text-muted-foreground">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </OperationalCard>
            </div>
          </section>

          <section>
            <SectionHeader
              title="Operational heatmap"
              subtitle="Cities × operational dimensions"
              right={<span className="text-xs text-muted-foreground"><BarChart3 className="h-3 w-3 inline mr-1" />green = strong · red = weak</span>}
            />
            <OperationalCard className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left p-3">City</th>
                    <th className="p-2">Occupancy</th>
                    <th className="p-2"><span className="inline-flex items-center gap-1">SLA <GlossaryHint id="sla" /></span></th>
                    <th className="p-2">CSAT</th>
                    <th className="p-2">Retention</th>
                    <th className="p-2"><span className="inline-flex items-center gap-1">Esc. rate <GlossaryHint id="escalation" /></span></th>
                  </tr>
                </thead>
                <tbody>
                  {cities.map(c => {
                    const retention = 100 - c.churn;
                    const escRate = Math.round((c.escalations / Math.max(c.portfolio, 1)) * 100);
                    const cellCls = 'p-2 text-center';
                    return (
                      <tr key={c.city} className="border-t">
                        <td className="p-3 font-medium">{c.city}</td>
                        <td className={cellCls}><span className={cn('inline-block w-full py-1.5 rounded text-xs font-medium', heatTone(c.occupancy))}>{c.occupancy}%</span></td>
                        <td className={cellCls}><span className={cn('inline-block w-full py-1.5 rounded text-xs font-medium', heatTone(c.slaPercent))}>{c.slaPercent}%</span></td>
                        <td className={cellCls}><span className={cn('inline-block w-full py-1.5 rounded text-xs font-medium', heatTone(c.csat * 20))}>{c.csat.toFixed(1)}</span></td>
                        <td className={cellCls}><span className={cn('inline-block w-full py-1.5 rounded text-xs font-medium', heatTone(retention))}>{retention}%</span></td>
                        <td className={cellCls}><span className={cn('inline-block w-full py-1.5 rounded text-xs font-medium', heatTone(escRate, true))}>{escRate}%</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </OperationalCard>
          </section>

          <section>
            <SectionHeader title="Team coaching & review" subtitle="Recurring failure patterns" />
            <div className="grid md:grid-cols-3 gap-2">
              {[
                { title: 'Follow-up quality gaps', detail: '23 PMs missing >3 follow-ups/week', tone: 'medium' as const },
                { title: 'Renewal negotiation training', detail: '11 PMs with <50% closure rate', tone: 'high' as const },
                { title: 'Owner communication SOP', detail: '8 PMs with CSAT <4.0', tone: 'critical' as const },
              ].map(c => (
                <OperationalCard key={c.title} urgency={c.tone} className="p-3">
                  <div className="pl-2">
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.detail}</p>
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
