import { useMemo, useState } from 'react';
import {
  ListChecks, AlertTriangle, RefreshCw, Home, Timer, MessageCircle,
  ShieldAlert, ArrowRight, Briefcase, Flag, Wrench, IndianRupee, ClipboardCheck,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { KpiPill, KpiBar } from '@/components/acc/primitives/KpiPill';
import { OperationalCard, SectionHeader } from '@/components/acc/primitives/OperationalCard';
import { AgingBadge, SlaTimer, UrgencyDot } from '@/components/acc/primitives/AgingBadge';
import { PipelineFunnel } from '@/components/acc/primitives/PipelineFunnel';
import { ScoreImpactBadge } from '@/components/acc/ScoreImpactBadge';
import { TaskFilters, DateRangePicker, EMPTY_TASK_FILTERS, type TaskFilterState } from '@/components/acc/TaskFilters';
import { CommunicateModal, type CommunicateContext } from '@/components/acc/CommunicateModal';
import { ServiceRequestsPanel } from '@/components/acc/ServiceRequestsPanel';
import { RentTrackerPanel } from '@/components/acc/RentTrackerPanel';
import { InspectionsPanel } from '@/components/acc/InspectionsPanel';
import {
  getCriticalActions, getEscalations, getFollowUps,
  getOperationalSummary, getPipelineCounts,
  PERIOD_LABEL, AccPeriod, type CriticalAction,
} from '@/data/accAggregators';
import { allProperties } from '@/data/propertyData';
import { mockPMData } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { Property } from '@/types/property';
import { PropertyDetailModal } from '@/components/property/PropertyDetailModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PERIODS: AccPeriod[] = ['today', 'week', 'month', 'quarter'];

export default function PMCommand() {
  const [period, setPeriod] = useState<AccPeriod>('today');
  const [kindFilter, setKindFilter] = useState<'all' | 'expected' | 'flagged'>('all');
  const [filters, setFilters] = useState<TaskFilterState>(EMPTY_TASK_FILTERS);
  const [activeTab, setActiveTab] = useState('actions');
  const [openProperty, setOpenProperty] = useState<Property | null>(null);
  const [commCtx, setCommCtx] = useState<CommunicateContext | null>(null);

  const summary = useMemo(() => getOperationalSummary(), []);
  const allActions = useMemo(() => getCriticalActions(undefined, period), [period]);

  const actions = useMemo(() => {
    let list = kindFilter === 'all' ? allActions : allActions.filter(a => a.kind === kindFilter);
    if (filters.urgency.length) list = list.filter(a => filters.urgency.includes(a.urgency));
    if (filters.category.length) list = list.filter(a => filters.category.includes(a.category));
    if (filters.dueWithinDays !== null) {
      list = list.filter(a => {
        const dueDays = a.hoursLeft / 24;
        return filters.dueWithinDays === 0 ? a.hoursLeft < 0 : dueDays <= filters.dueWithinDays!;
      });
    }
    return list;
  }, [allActions, kindFilter, filters]);

  const expectedCount = allActions.filter(a => a.kind === 'expected').length;
  const flaggedCount = allActions.filter(a => a.kind === 'flagged').length;

  const escalations = useMemo(() => getEscalations(), []);
  const pipeline = useMemo(() => getPipelineCounts(), []);
  const followUps = useMemo(() => getFollowUps(), []);

  const propertyById = useMemo(() => {
    const map = new Map<string, Property>();
    allProperties.forEach(p => map.set(p.basic.propertyId, p));
    return map;
  }, []);

  const openByPropertyId = (id?: string) => {
    if (!id) return;
    const prop = propertyById.get(id);
    if (prop) setOpenProperty(prop);
  };

  const communicateFromAction = (a: CriticalAction) => {
    const prop = a.propertyId ? propertyById.get(a.propertyId) : undefined;
    setCommCtx({
      taskTitle: a.title,
      nextStep: a.nextStep,
      contactName: a.contact || prop?.basic.ownerName || 'Owner',
      propertyName: prop?.basic.propertyName,
      propertyId: a.propertyId,
      category: a.category,
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-16">
        <header className="border-b bg-card">
          <div className="container py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Property Manager</p>
              <h1 className="text-xl font-semibold tracking-tight">
                {mockPMData.profile.name} · Command Center
              </h1>
              <p className="text-xs text-muted-foreground">
                Operational inbox — viewing <span className="text-foreground font-medium">
                  {filters.dateRange ? 'Custom range' : PERIOD_LABEL[period]}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex rounded-md border border-border/70 bg-card p-0.5">
                {PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setFilters(f => ({ ...f, dateRange: null })); }}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-sm transition-colors',
                      period === p && !filters.dateRange ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {PERIOD_LABEL[p]}
                  </button>
                ))}
              </div>
              <DateRangePicker
                value={filters.dateRange}
                onChange={(r) => setFilters(f => ({ ...f, dateRange: r }))}
              />
              <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                My Score view <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </header>

        <KpiBar>
          <KpiPill label="Today's tasks" value={summary.tasks} tone={summary.tasks > 6 ? 'high' : 'neutral'} icon={<ListChecks className="h-4 w-4" />} />
          <KpiPill label="Escalations" value={summary.escalations} tone={summary.escalations > 3 ? 'critical' : 'neutral'} icon={<AlertTriangle className="h-4 w-4" />} />
          <KpiPill label="Renewals pending" value={summary.renewalsPending} tone="info" to="/renewals" icon={<RefreshCw className="h-4 w-4" />} />
          <KpiPill label="Re-renting" value={summary.reRentingPending} tone="medium" icon={<Home className="h-4 w-4" />} />
          <KpiPill label="SLA breaches" value={summary.slaBreaches} tone={summary.slaBreaches > 5 ? 'high' : 'neutral'} icon={<Timer className="h-4 w-4" />} />
          <KpiPill label="Follow-ups" value={summary.followUps} icon={<MessageCircle className="h-4 w-4" />} />
          <KpiPill label="High risk" value={summary.highRisk} tone={summary.highRisk > 0 ? 'critical' : 'success'} to="/properties" icon={<ShieldAlert className="h-4 w-4" />} />
        </KpiBar>

        <main className="container py-6 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-10">
              <TabsTrigger value="actions" className="gap-1.5"><ListChecks className="h-3.5 w-3.5" /> Action queue</TabsTrigger>
              <TabsTrigger value="sr" className="gap-1.5"><Wrench className="h-3.5 w-3.5" /> Service requests</TabsTrigger>
              <TabsTrigger value="rent" className="gap-1.5"><IndianRupee className="h-3.5 w-3.5" /> Rent</TabsTrigger>
              <TabsTrigger value="inspections" className="gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> Inspections</TabsTrigger>
              <TabsTrigger value="pipelines" className="gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Pipelines</TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-6 mt-4">
              <section>
                <SectionHeader
                  title="Action queue"
                  subtitle="Click any row to open property. Flagged = system-detected risk. Expected = your routine PM job."
                  count={actions.length}
                  right={
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tabs value={kindFilter} onValueChange={(v) => setKindFilter(v as typeof kindFilter)}>
                        <TabsList className="h-8">
                          <TabsTrigger value="all" className="text-xs">All ({allActions.length})</TabsTrigger>
                          <TabsTrigger value="flagged" className="text-xs gap-1">
                            <Flag className="h-3 w-3" /> Flagged ({flaggedCount})
                          </TabsTrigger>
                          <TabsTrigger value="expected" className="text-xs gap-1">
                            <Briefcase className="h-3 w-3" /> Expected ({expectedCount})
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <TaskFilters value={filters} onChange={setFilters} />
                    </div>
                  }
                />
                <div className="space-y-2">
                  {actions.slice(0, 25).map(a => {
                    const clickable = !!a.propertyId && propertyById.has(a.propertyId);
                    return (
                      <OperationalCard
                        key={a.id}
                        urgency={a.urgency}
                        className="p-3"
                        onClick={clickable ? () => openByPropertyId(a.propertyId) : undefined}
                      >
                        <div className="flex items-center gap-3 pl-2">
                          <UrgencyDot urgency={a.urgency} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate">{a.title}</span>
                              <span className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium',
                                a.kind === 'flagged' ? 'bg-urgency-high-soft text-urgency-high' : 'bg-muted text-muted-foreground',
                              )}>
                                {a.kind === 'flagged' ? 'Flagged' : 'Expected'}
                              </span>
                              <AgingBadge days={a.agingDays} />
                              <SlaTimer hoursLeft={a.hoursLeft} />
                              <ScoreImpactBadge category={a.category} aging={a.agingDays} />
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{a.subtitle}</p>
                            <p className="text-[11px] text-foreground/70 mt-0.5">
                              <span className="font-medium">Next:</span> {a.nextStep}
                            </p>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1"
                              onClick={() => communicateFromAction(a)}>
                              <MessageCircle className="h-3 w-3" /> Communicate
                            </Button>
                            {clickable ? (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={() => openByPropertyId(a.propertyId)} title="Open property">
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Link to={a.link} className="text-muted-foreground hover:text-foreground p-1">
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </OperationalCard>
                    );
                  })}
                  {actions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nothing matches the current filters.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <SectionHeader title="Escalation risk" subtitle="Aging escalations and customer dissatisfaction" count={escalations.length} />
                <div className="grid md:grid-cols-2 gap-2">
                  {escalations.slice(0, 8).map(e => (
                    <OperationalCard
                      key={e.id}
                      urgency={e.severity}
                      className="p-3"
                      onClick={e.propertyId ? () => openByPropertyId(e.propertyId) : undefined}
                    >
                      <div className="pl-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">{e.property}</p>
                          <AgingBadge days={e.agingDays} />
                        </div>
                        <p className="text-xs text-muted-foreground">{e.city} · {e.owner}</p>
                        <p className="text-xs mt-1">{e.reason}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-[11px] text-muted-foreground">Root cause: <span className="text-foreground/80">{e.rootCause}</span></p>
                          <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={(ev) => {
                            ev.stopPropagation();
                            setCommCtx({
                              taskTitle: `Escalation — ${e.reason}`,
                              nextStep: `Resolve ${e.rootCause.toLowerCase()} and update owner`,
                              contactName: e.owner, propertyName: e.property, propertyId: e.propertyId,
                              category: 'Escalation',
                            });
                          }}>
                            <MessageCircle className="h-3 w-3" /> Reach out
                          </Button>
                        </div>
                      </div>
                    </OperationalCard>
                  ))}
                </div>
              </section>

              <section>
                <SectionHeader title="Daily follow-up center" subtitle="Pending callbacks and confirmations" count={followUps.length} />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {followUps.map(f => (
                    <OperationalCard
                      key={f.id}
                      urgency={f.agingDays >= 3 ? 'high' : f.agingDays >= 1 ? 'medium' : 'low'}
                      className="p-3"
                      onClick={f.propertyId ? () => openByPropertyId(f.propertyId) : undefined}
                    >
                      <div className="pl-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">{f.with}</p>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.channel}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{f.topic}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-foreground/70">Due: {f.due}</span>
                          <AgingBadge days={f.agingDays} />
                        </div>
                      </div>
                    </OperationalCard>
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="sr" className="mt-4">
              <ServiceRequestsPanel
                onOpenProperty={openByPropertyId}
                onCommunicate={setCommCtx}
              />
            </TabsContent>

            <TabsContent value="rent" className="mt-4">
              <RentTrackerPanel
                onOpenProperty={openByPropertyId}
                onCommunicate={setCommCtx}
              />
            </TabsContent>

            <TabsContent value="inspections" className="mt-4">
              <InspectionsPanel
                onOpenProperty={openByPropertyId}
                onCommunicate={setCommCtx}
              />
            </TabsContent>

            <TabsContent value="pipelines" className="space-y-6 mt-4">
              <section>
                <SectionHeader title="Renewal pipeline" subtitle="From upcoming through closure" />
                <PipelineFunnel
                  stages={[
                    { key: 'upc', label: 'Upcoming', count: pipeline.renewal.upcoming, tone: 'open', to: '/renewals' },
                    { key: 'neg', label: 'Negotiation', count: pipeline.renewal.negotiation, tone: 'active', to: '/renewals' },
                    { key: 'own', label: 'Owner aligned', count: pipeline.renewal.ownerAligned, tone: 'active', to: '/renewals' },
                    { key: 'ten', label: 'Tenant aligned', count: pipeline.renewal.tenantAligned, tone: 'aligned', to: '/renewals' },
                    { key: 'hir', label: 'High risk', count: pipeline.renewal.highRisk, tone: 'risk', to: '/renewals' },
                    { key: 'chu', label: 'Churn risk', count: pipeline.renewal.churnRisk, tone: 'risk', to: '/renewals' },
                    { key: 'cls', label: 'Closed', count: pipeline.renewal.closed, tone: 'closed', to: '/renewals' },
                  ]}
                />
              </section>
              <section>
                <SectionHeader title="Re-renting pipeline" subtitle="Vacancy aging and broker assignment" />
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
            </TabsContent>
          </Tabs>
        </main>

        <PropertyDetailModal
          property={openProperty}
          open={!!openProperty}
          onClose={() => setOpenProperty(null)}
        />
        <CommunicateModal
          open={!!commCtx}
          context={commCtx}
          onClose={() => setCommCtx(null)}
        />
      </div>
    </PageTransition>
  );
}
