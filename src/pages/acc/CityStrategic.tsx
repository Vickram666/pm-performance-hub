import { useMemo, useState } from 'react';
import { Home, TrendingDown, RefreshCw, AlertTriangle, Smile, Users, BarChart3, ArrowRight } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { KpiPill, KpiBar } from '@/components/acc/primitives/KpiPill';
import { OperationalCard, SectionHeader } from '@/components/acc/primitives/OperationalCard';
import { PeriodControls } from '@/components/acc/PeriodControls';
import { PeriodKpiStrip } from '@/components/acc/PeriodKpiStrip';
import { GlossaryHint, Explain } from '@/components/acc/Glossary';
import { ScopeBreadcrumb } from '@/components/acc/ScopeBreadcrumb';
import { AttentionBanner } from '@/components/acc/AttentionBanner';
import { useScope } from '@/context/ScopeContext';
import { ACC_CITIES, getCityHealth, getChurnIntelligence, type AccPeriod } from '@/data/accAggregators';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const { scope, drillCity, drillTL } = useScope();
  const allCities = useMemo(() => getCityHealth(), []);
  const churn = useMemo(() => getChurnIntelligence(), []);
  const [period, setPeriod] = useState<AccPeriod>('month');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  // Focus on scoped city if set, else show org-wide summary.
  const focused = scope.city ? allCities.filter(c => c.city === scope.city) : allCities;
  const cities = focused.length ? focused : allCities;
  const focusedChurn = scope.city
    ? {
        ...churn,
        renewalChurn: { ...churn.renewalChurn, total: Math.round(churn.renewalChurn.total / Math.max(allCities.length, 1)) },
        reRentChurn: { ...churn.reRentChurn, total: Math.round(churn.reRentChurn.total / Math.max(allCities.length, 1)) },
      }
    : churn;

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
            <div className="min-w-0">
              <ScopeBreadcrumb className="mb-1" />
              <h1 className="text-xl font-semibold tracking-tight">
                {scope.city ? `${scope.city} — City Strategic View` : 'Strategic Overview'}
              </h1>
              <p className="text-xs text-muted-foreground">Where are we winning, and where are we losing customers?</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={scope.city || '__all__'} onValueChange={(v) => v === '__all__' ? drillCity('') : drillCity(v)}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="All cities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All cities</SelectItem>
                  {ACC_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <PeriodControls period={period} onPeriodChange={setPeriod} dateRange={dateRange} onDateRangeChange={setDateRange} />
            </div>
          </div>
        </header>

        <div className="container py-4 space-y-3">
          {scope.city && (
            <AttentionBanner
              tone="high"
              headline={`Open ${scope.city} War Room to act on PM-level issues`}
              detail={`${totals.escalations} escalations · ${totals.renewals} pending renewals · ${totals.pms} PMs`}
              cta={{ label: 'Open TL War Room', onClick: () => drillTL({ city: scope.city!, tl: scope.city! }) }}
            />
          )}
          <PeriodKpiStrip scope={{ city: scope.city }} />
        </div>

        <KpiBar>
          <KpiPill label="Portfolio" value={totals.portfolio} icon={<Home className="h-4 w-4" />} />
          <KpiPill label="Occupancy" value={`${Math.round(totals.occupancy / n)}%`} tone="success" />
          <KpiPill label="Churn" value={`${Math.round(totals.churn / n)}%`} tone={totals.churn / n > 8 ? 'critical' : 'neutral'} icon={<TrendingDown className="h-4 w-4" />} />
          <KpiPill label="Renewals pending" value={totals.renewals} icon={<RefreshCw className="h-4 w-4" />} />
          <KpiPill label="Escalations" value={totals.escalations} tone={totals.escalations > 20 ? 'high' : 'neutral'} icon={<AlertTriangle className="h-4 w-4" />} />
          <KpiPill label="CSAT" value={(totals.csat / n).toFixed(1)} tone="success" icon={<Smile className="h-4 w-4" />} />
          <KpiPill label="PMs" value={totals.pms} icon={<Users className="h-4 w-4" />} />
        </KpiBar>



        <main className="container py-6 space-y-8">
          <section>
            <SectionHeader
              title={<Explain id="churn">Churn intelligence</Explain>}
              subtitle="Renewal vs re-renting leakage"
            />
            <div className="grid md:grid-cols-2 gap-3">
              <OperationalCard className="p-4">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                      <Explain id="renewalChurn">Renewal churn</Explain>
                    </p>
                    <p className="text-2xl font-semibold">{focusedChurn.renewalChurn.total}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">root causes</span>
                </div>
                <ul className="space-y-1.5">
                  {focusedChurn.renewalChurn.causes.map(c => (
                    <li key={c.label} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-foreground/80">{c.label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-urgency-critical" style={{ width: `${(c.count / Math.max(focusedChurn.renewalChurn.total, 1)) * 100}%` }} />
                      </div>
                      <span className="tabular-nums w-8 text-right text-muted-foreground">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </OperationalCard>

              <OperationalCard className="p-4">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                      <Explain id="reRentChurn">Re-renting churn</Explain>
                    </p>
                    <p className="text-2xl font-semibold">{focusedChurn.reRentChurn.total}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">leakage breakdown</span>
                </div>
                <ul className="space-y-1.5">
                  {focusedChurn.reRentChurn.causes.map(c => (
                    <li key={c.label} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-foreground/80">{c.label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-urgency-high" style={{ width: `${(c.count / Math.max(focusedChurn.reRentChurn.total, 1)) * 100}%` }} />
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
              subtitle="Cities × operational dimensions · click a city to open its War Room"
              right={<span className="text-xs text-muted-foreground"><BarChart3 className="h-3 w-3 inline mr-1" />green = strong · red = weak</span>}
            />
            <OperationalCard className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left p-3">City</th>
                    <th className="p-2"><Explain id="occupancy">Occupancy</Explain></th>
                    <th className="p-2"><Explain id="sla">SLA</Explain></th>
                    <th className="p-2"><Explain id="csat">CSAT</Explain></th>
                    <th className="p-2"><Explain id="retention">Retention</Explain></th>
                    <th className="p-2"><Explain id="escalationRate">Esc. rate</Explain></th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {allCities.map(c => {
                    const retention = 100 - c.churn;
                    const escRate = Math.round((c.escalations / Math.max(c.portfolio, 1)) * 100);
                    const cellCls = 'p-2 text-center';
                    return (
                      <tr
                        key={c.city}
                        className="border-t hover:bg-muted/30 cursor-pointer"
                        onClick={() => drillTL({ city: c.city, tl: c.city })}
                      >
                        <td className="p-3 font-medium">{c.city}</td>
                        <td className={cellCls}><span className={cn('inline-block w-full py-1.5 rounded text-xs font-medium', heatTone(c.occupancy))}>{c.occupancy}%</span></td>
                        <td className={cellCls}><span className={cn('inline-block w-full py-1.5 rounded text-xs font-medium', heatTone(c.slaPercent))}>{c.slaPercent}%</span></td>
                        <td className={cellCls}><span className={cn('inline-block w-full py-1.5 rounded text-xs font-medium', heatTone(c.csat * 20))}>{c.csat.toFixed(1)}</span></td>
                        <td className={cellCls}><span className={cn('inline-block w-full py-1.5 rounded text-xs font-medium', heatTone(retention))}>{retention}%</span></td>
                        <td className={cellCls}><span className={cn('inline-block w-full py-1.5 rounded text-xs font-medium', heatTone(escRate, true))}>{escRate}%</span></td>
                        <td className="p-2 text-right"><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
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
