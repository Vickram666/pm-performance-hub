import { useMemo, useState } from 'react';
import { Users, AlertTriangle, RefreshCw, Home, Timer, TrendingDown, ShieldAlert, ArrowRight } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { KpiPill, KpiBar } from '@/components/acc/primitives/KpiPill';
import { OperationalCard, SectionHeader } from '@/components/acc/primitives/OperationalCard';
import { AgingBadge, UrgencyDot } from '@/components/acc/primitives/AgingBadge';
import { PipelineFunnel } from '@/components/acc/primitives/PipelineFunnel';
import { PeriodControls } from '@/components/acc/PeriodControls';
import { PeriodKpiStrip } from '@/components/acc/PeriodKpiStrip';
import { GlossaryHint, Explain } from '@/components/acc/Glossary';
import { ScopeBreadcrumb } from '@/components/acc/ScopeBreadcrumb';
import { AttentionBanner } from '@/components/acc/AttentionBanner';
import { TakeActionMenu } from '@/components/acc/TakeActionMenu';
import { useScope } from '@/context/ScopeContext';
import { ACC_CITIES, getCityHealth, getEscalations, getOperationalSummary, getPipelineCounts, getPMMatrix, type AccPeriod } from '@/data/accAggregators';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

export default function TLWarRoom() {
  const { scope, drillCity, drillPM } = useScope();
  const [city, setCity] = useState<string>(scope.city || ACC_CITIES[0]);
  // Keep local city in sync with scope changes (e.g., breadcrumb reset).
  const effectiveCity = scope.city || city;
  const [period, setPeriod] = useState<AccPeriod>('week');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const summary = useMemo(() => getOperationalSummary({ city: effectiveCity }), [effectiveCity]);
  const matrix = useMemo(() => getPMMatrix(effectiveCity), [effectiveCity]);
  const escalations = useMemo(() => getEscalations({ city: effectiveCity }), [effectiveCity]);
  const pipeline = useMemo(() => getPipelineCounts({ city: effectiveCity }), [effectiveCity]);
  const cityHealth = useMemo(() => getCityHealth().find(c => c.city === effectiveCity), [effectiveCity]);

  const worst = useMemo(() => [...matrix].sort((a, b) => (b.escalations + b.overdueActions) - (a.escalations + a.overdueActions))[0], [matrix]);

  const handleCityChange = (v: string) => {
    setCity(v);
    drillCity(v);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-16">
        <header className="border-b bg-card">
          <div className="container py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="min-w-0">
              <ScopeBreadcrumb className="mb-1" />
              <h1 className="text-xl font-semibold tracking-tight">{effectiveCity} War Room</h1>
              <p className="text-xs text-muted-foreground">Where is my city operation failing right now? Click any PM row to drill into their inbox.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={effectiveCity} onValueChange={handleCityChange}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACC_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <PeriodControls period={period} onPeriodChange={setPeriod} dateRange={dateRange} onDateRangeChange={setDateRange} />
            </div>
          </div>
        </header>

        {worst && (
          <div className="container py-4">
            <AttentionBanner
              tone={worst.performance === 'underperforming' ? 'critical' : 'high'}
              headline={`${worst.name} needs coaching now`}
              detail={`${worst.escalations} escalations · ${worst.overdueActions} overdue actions · SLA ${worst.slaPercent}%`}
              cta={{ label: 'Open PM inbox', onClick: () => drillPM({ city: effectiveCity, pm: worst.pmId, pmName: worst.name }) }}
            />
          </div>
        )}


        <div className="container py-4">
          <PeriodKpiStrip scope={{ city: effectiveCity }} />
        </div>


        <KpiBar>
          <KpiPill label="Active portfolio" value={cityHealth?.portfolio ?? 0} icon={<Home className="h-4 w-4" />} />
          <KpiPill label="Escalations" value={summary.escalations} tone={summary.escalations > 5 ? 'critical' : 'neutral'} icon={<AlertTriangle className="h-4 w-4" />} />
          <KpiPill label="SLA %" value={`${cityHealth?.slaPercent ?? 0}%`} tone={(cityHealth?.slaPercent ?? 0) < 80 ? 'high' : 'success'} icon={<Timer className="h-4 w-4" />} />
          <KpiPill label="Renewals pending" value={summary.renewalsPending} tone="info" icon={<RefreshCw className="h-4 w-4" />} />
          <KpiPill label="Vacancy %" value={cityHealth ? `${Math.round((cityHealth.vacantCount / Math.max(cityHealth.portfolio, 1)) * 100)}%` : '0%'} tone="medium" />
          <KpiPill label="Churn" value={`${cityHealth?.churn ?? 0}%`} tone={(cityHealth?.churn ?? 0) > 10 ? 'critical' : 'neutral'} icon={<TrendingDown className="h-4 w-4" />} />
          <KpiPill label="PMs" value={cityHealth?.pmCount ?? 0} icon={<Users className="h-4 w-4" />} />
        </KpiBar>

        <main className="container py-6 space-y-8">
          <section>
            <SectionHeader title="PM performance matrix" subtitle="Workload, throughput, and risk per PM" count={matrix.length} />
            <OperationalCard className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left p-3">PM</th>
                    <th className="text-right p-3">Portfolio</th>
                    <th className="text-right p-3">Tasks</th>
                    <th className="text-right p-3">Escalations</th>
                    <th className="text-right p-3">
                      <span className="inline-flex items-center gap-1">SLA <GlossaryHint id="sla" /></span>
                    </th>
                    <th className="text-right p-3">Renewals</th>
                    <th className="text-right p-3">
                      <span className="inline-flex items-center gap-1">Churn <GlossaryHint id="churn" /></span>
                    </th>
                    <th className="text-right p-3">CSAT</th>
                    <th className="text-right p-3">Overdue</th>
                    <th className="text-right p-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map(row => (
                    <tr
                      key={row.pmId}
                      className="border-t hover:bg-muted/30 cursor-pointer"
                      onClick={() => drillPM({ city: effectiveCity, pm: row.pmId, pmName: row.name })}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <UrgencyDot urgency={row.performance === 'underperforming' ? 'critical' : row.performance === 'top' ? 'low' : 'medium'} />
                          <span className="font-medium">{row.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right tabular-nums">
                        <span className={cn(row.load === 'overloaded' && 'text-urgency-high font-medium')}>{row.portfolio}</span>
                      </td>
                      <td className="p-3 text-right tabular-nums">{row.pendingTasks}</td>
                      <td className={cn('p-3 text-right tabular-nums', row.escalations >= 3 && 'text-urgency-critical font-medium')}>{row.escalations}</td>
                      <td className={cn('p-3 text-right tabular-nums', row.slaPercent < 75 && 'text-urgency-high font-medium')}>{row.slaPercent}%</td>
                      <td className="p-3 text-right tabular-nums">{row.renewalsPending}</td>
                      <td className={cn('p-3 text-right tabular-nums', row.churnRisk >= 2 && 'text-urgency-critical font-medium')}>{row.churnRisk}</td>
                      <td className="p-3 text-right tabular-nums">{row.csat.toFixed(1)}</td>
                      <td className={cn('p-3 text-right tabular-nums', row.overdueActions > 0 && 'text-urgency-high font-medium')}>{row.overdueActions}</td>
                      <td className="p-3 text-right pr-4">
                        <span className={cn(
                          'inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded',
                          row.performance === 'top' && 'bg-success/15 text-success',
                          row.performance === 'mid' && 'bg-muted text-muted-foreground',
                          row.performance === 'underperforming' && 'bg-urgency-critical-soft text-urgency-critical',
                        )}>{row.performance}</span>
                      </td>
                      <td className="p-3 pr-4 text-right"><ArrowRight className="h-3.5 w-3.5 text-muted-foreground inline" /></td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </OperationalCard>
          </section>

          <section>
            <SectionHeader
              title={<span className="inline-flex items-center gap-1.5">Escalation command center <GlossaryHint id="escalation" /></span>}
              subtitle="Aging-sorted, by severity" count={escalations.length}
            />
            <div className="grid md:grid-cols-2 gap-2">
              {escalations.slice(0, 10).map(e => (
                <OperationalCard key={e.id} urgency={e.severity} className="p-3">
                  <div className="pl-2 flex items-start gap-3">
                    <ShieldAlert className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{e.property}</p>
                        <AgingBadge days={e.agingDays} />
                      </div>
                      <p className="text-xs text-muted-foreground">{e.city} · {e.owner}</p>
                      <p className="text-xs mt-1">{e.reason} · <span className="text-muted-foreground">{e.rootCause}</span></p>
                      <div className="mt-2 flex justify-end">
                        <TakeActionMenu kind="escalation" taskTitle={`Escalation — ${e.reason}`} propertyName={e.property} propertyId={e.propertyId} />
                      </div>
                    </div>
                  </div>
                </OperationalCard>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Re-renting control tower" subtitle="Vacant inventory and broker efficiency" />
            <PipelineFunnel
              stages={[
                { key: 'mo', label: 'Move-out', count: pipeline.reRenting.moveOut, tone: 'open' },
                { key: 'vac', label: 'Vacant', count: pipeline.reRenting.vacant, tone: 'active' },
                { key: 'brk', label: 'Broker assigned', count: pipeline.reRenting.brokerAssigned, tone: 'active' },
                { key: 'self', label: 'Owner self-rent', count: pipeline.reRenting.ownerSelfRent, tone: 'risk' },
                { key: 'lost', label: 'Lost inventory', count: pipeline.reRenting.lost, tone: 'risk' },
              ]}
            />
          </section>

          <section>
            <SectionHeader title="Renewal conversion funnel" subtitle="City pipeline at a glance" />
            <PipelineFunnel
              stages={[
                { key: 'open', label: 'Open', count: pipeline.renewal.upcoming, tone: 'open' },
                { key: 'neg', label: 'Negotiation', count: pipeline.renewal.negotiation, tone: 'active' },
                { key: 'al', label: 'Aligned', count: pipeline.renewal.ownerAligned + pipeline.renewal.tenantAligned, tone: 'aligned' },
                { key: 'st', label: 'Stuck', count: pipeline.renewal.highRisk, tone: 'risk' },
                { key: 'ch', label: 'Churn risk', count: pipeline.renewal.churnRisk, tone: 'risk' },
                { key: 'cl', label: 'Closed', count: pipeline.renewal.closed, tone: 'closed' },
              ]}
            />
          </section>
        </main>
      </div>
    </PageTransition>
  );
}
