import { useMemo, useState } from 'react';
import {
  ListChecks, AlertTriangle, RefreshCw, Home, Timer, ShieldAlert,
  ArrowRight, Briefcase, Flag, Wrench, IndianRupee, ClipboardCheck, MessageCircle, Building2,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { KpiPill, KpiBar } from '@/components/acc/primitives/KpiPill';
import { WorkbenchTable, WBHead, WBBody, WBEmpty, WBSection } from '@/components/acc/primitives/WorkbenchTable';
import { InlineQuickActions } from '@/components/acc/primitives/InlineQuickActions';
import { AgingBadge, SlaTimer, UrgencyDot } from '@/components/acc/primitives/AgingBadge';
import { ScoreImpactBadge } from '@/components/acc/ScoreImpactBadge';
import { TaskFilters, EMPTY_TASK_FILTERS, type TaskFilterState } from '@/components/acc/TaskFilters';
import { PeriodControls } from '@/components/acc/PeriodControls';
import { PeriodKpiStrip } from '@/components/acc/PeriodKpiStrip';
import { GlossaryHint } from '@/components/acc/Glossary';
import { TakeActionMenu } from '@/components/acc/TakeActionMenu';
import { ServiceRequestsPanel } from '@/components/acc/ServiceRequestsPanel';
import { RentTrackerPanel } from '@/components/acc/RentTrackerPanel';
import { InspectionsPanel } from '@/components/acc/InspectionsPanel';
import {
  getCriticalActions, getEscalations, getFollowUps,
  getOperationalSummary, getPipelineCounts, getReRentingQueue,
  AccPeriod, RERENT_STAGE_LABEL,
} from '@/data/accAggregators';
import { allProperties } from '@/data/propertyData';
import { mockPMData } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { Property } from '@/types/property';
import { PropertyDetailModal } from '@/components/property/PropertyDetailModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const KIND_CHIP = (active: boolean, tone: 'all' | 'flagged' | 'expected') =>
  cn(
    'inline-flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-medium transition-colors',
    active
      ? tone === 'flagged'
        ? 'bg-urgency-high-soft text-urgency-high border-urgency-high/30'
        : tone === 'expected'
          ? 'bg-primary/10 text-primary border-primary/30'
          : 'bg-foreground text-background border-foreground'
      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-border',
  );

const RERENT_TONE: Record<string, string> = {
  move_out: 'bg-muted text-foreground',
  vacant: 'bg-urgency-medium-soft text-urgency-medium',
  broker_assigned: 'bg-primary/10 text-primary',
  owner_self_rent: 'bg-urgency-high-soft text-urgency-high',
  lost: 'bg-urgency-critical-soft text-urgency-critical',
};

export default function PMCommand() {
  const [period, setPeriod] = useState<AccPeriod>('today');
  const [kindFilter, setKindFilter] = useState<'all' | 'expected' | 'flagged'>('all');
  const [filters, setFilters] = useState<TaskFilterState>(EMPTY_TASK_FILTERS);
  const [activeTab, setActiveTab] = useState('actions');
  const [openProperty, setOpenProperty] = useState<Property | null>(null);

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
  const reRent = useMemo(() => getReRentingQueue(), []);
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

  const renewalStages = [
    { key: 'upcoming', label: 'Upcoming', count: pipeline.renewal.upcoming },
    { key: 'negotiation', label: 'Discussion', count: pipeline.renewal.negotiation },
    { key: 'ownerAligned', label: 'Owner aligned', count: pipeline.renewal.ownerAligned },
    { key: 'tenantAligned', label: 'Tenant aligned', count: pipeline.renewal.tenantAligned },
    { key: 'highRisk', label: 'High risk', count: pipeline.renewal.highRisk, tone: 'urgency-high' as const },
    { key: 'churnRisk', label: 'Churn risk', count: pipeline.renewal.churnRisk, tone: 'urgency-critical' as const },
    { key: 'closed', label: 'Closed', count: pipeline.renewal.closed },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-16">
        {/* Sticky compact operational header */}
        <header className="sticky top-14 z-40 border-b bg-card">
          <div className="container py-2.5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Property Manager</p>
                <h1 className="text-[15px] font-semibold tracking-tight truncate">
                  {mockPMData.profile.name} · Daily Operations Inbox
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <PeriodControls
                period={period} onPeriodChange={setPeriod}
                dateRange={filters.dateRange} onDateRangeChange={(r) => setFilters(f => ({ ...f, dateRange: r }))}
              />
              <Link to="/" className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 border rounded px-2 py-1">
                My Score view <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <KpiBar>
            <KpiPill label="Tasks" value={summary.tasks} tone={summary.tasks > 6 ? 'high' : 'neutral'} icon={<ListChecks className="h-4 w-4" />} />
            <KpiPill label="Escalations" value={summary.escalations} tone={summary.escalations > 3 ? 'critical' : 'neutral'} icon={<AlertTriangle className="h-4 w-4" />} />
            <KpiPill label="Renewals" value={summary.renewalsPending} tone="info" to="/renewals" icon={<RefreshCw className="h-4 w-4" />} />
            <KpiPill label="Re-renting" value={summary.reRentingPending} tone="medium" icon={<Home className="h-4 w-4" />} />
            <KpiPill label="SLA breaches" value={summary.slaBreaches} tone={summary.slaBreaches > 5 ? 'high' : 'neutral'} icon={<Timer className="h-4 w-4" />} />
            <KpiPill label="Follow-ups" value={summary.followUps} icon={<MessageCircle className="h-4 w-4" />} />
            <KpiPill label="High risk" value={summary.highRisk} tone={summary.highRisk > 0 ? 'critical' : 'success'} to="/properties" icon={<ShieldAlert className="h-4 w-4" />} />
          </KpiBar>
        </header>

        <main className="container py-4 space-y-4">
          <PeriodKpiStrip />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9">
              <TabsTrigger value="actions" className="gap-1.5 text-xs"><ListChecks className="h-3.5 w-3.5" /> Action queue</TabsTrigger>
              <TabsTrigger value="rerent" className="gap-1.5 text-xs"><Building2 className="h-3.5 w-3.5" /> Re-renting</TabsTrigger>
              <TabsTrigger value="sr" className="gap-1.5 text-xs"><Wrench className="h-3.5 w-3.5" /> Service requests</TabsTrigger>
              <TabsTrigger value="rent" className="gap-1.5 text-xs"><IndianRupee className="h-3.5 w-3.5" /> Rent</TabsTrigger>
              <TabsTrigger value="inspections" className="gap-1.5 text-xs"><ClipboardCheck className="h-3.5 w-3.5" /> Inspections</TabsTrigger>
              <TabsTrigger value="pipelines" className="gap-1.5 text-xs"><RefreshCw className="h-3.5 w-3.5" /> Renewal pipeline</TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-5 mt-3">
              {/* Section A — dominant Critical Action Queue */}
              <WBSection
                title={<span className="inline-flex items-center gap-1.5">Today's critical action queue <GlossaryHint id="flagged" /></span>}
                subtitle="Flagged = system-detected risk · Expected = your routine job"
                count={actions.length}
                right={
                  <>
                    <button className={KIND_CHIP(kindFilter === 'all', 'all')} onClick={() => setKindFilter('all')}>
                      All ({allActions.length})
                    </button>
                    <button className={KIND_CHIP(kindFilter === 'flagged', 'flagged')} onClick={() => setKindFilter('flagged')}>
                      <Flag className="h-3 w-3" /> Flagged ({flaggedCount})
                    </button>
                    <button className={KIND_CHIP(kindFilter === 'expected', 'expected')} onClick={() => setKindFilter('expected')}>
                      <Briefcase className="h-3 w-3" /> Expected ({expectedCount})
                    </button>
                    <TaskFilters value={filters} onChange={setFilters} />
                  </>
                }
              >
                <WorkbenchTable minWidth={1100}>
                  <WBHead>
                    <th className="w-6"></th>
                    <th>Property · Owner</th>
                    <th>Task</th>
                    <th>Category</th>
                    <th className="text-right">Aging</th>
                    <th className="text-right">SLA</th>
                    <th>Impact</th>
                    <th>Next action</th>
                    <th className="w-40 text-right">Actions</th>
                  </WBHead>
                  <WBBody>
                    {actions.slice(0, 40).map(a => {
                      const clickable = !!a.propertyId && propertyById.has(a.propertyId);
                      return (
                        <tr
                          key={a.id}
                          className={cn(clickable && 'cursor-pointer')}
                          onClick={clickable ? () => openByPropertyId(a.propertyId) : undefined}
                        >
                          <td><UrgencyDot urgency={a.urgency} /></td>
                          <td className="max-w-[260px]">
                            <div className="font-medium truncate">{a.title.replace(/^.* — /, '')}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{a.subtitle}</div>
                          </td>
                          <td>
                            <span className="text-[13px]">{a.title.split(' — ')[0]}</span>
                          </td>
                          <td>
                            <span className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium',
                              a.kind === 'flagged' ? 'bg-urgency-high-soft text-urgency-high' : 'bg-muted text-muted-foreground',
                            )}>
                              {a.category}
                            </span>
                          </td>
                          <td className="text-right"><AgingBadge days={a.agingDays} /></td>
                          <td className="text-right"><SlaTimer hoursLeft={a.hoursLeft} /></td>
                          <td><ScoreImpactBadge category={a.category} aging={a.agingDays} /></td>
                          <td className="text-[12px] text-foreground/80 max-w-[220px] truncate">{a.nextStep}</td>
                          <td className="text-right">
                            <div className="inline-flex items-center gap-1">
                              <InlineQuickActions contact={a.contact} onOpen={() => openByPropertyId(a.propertyId)} />
                              <TakeActionMenu
                                kind={a.category === 'sr' ? 'sr' : a.category === 'rent' ? 'rent' : a.category === 'inspection' ? 'inspection' : a.category === 'renewal' ? 'renewal' : 'followup'}
                                taskTitle={a.title}
                                propertyId={a.propertyId}
                                onOpenProperty={openByPropertyId}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {actions.length === 0 && <WBEmpty colSpan={9} />}
                  </WBBody>
                </WorkbenchTable>
              </WBSection>

              {/* Section B — Escalation & Risk (dense) */}
              <WBSection
                title={<span className="inline-flex items-center gap-1.5">Escalation & risk panel <GlossaryHint id="escalation" /></span>}
                subtitle="Repeat complaints · delayed inspections · payment disputes · churn risk"
                count={escalations.length}
              >
                <WorkbenchTable minWidth={900}>
                  <WBHead>
                    <th className="w-6"></th>
                    <th>Property · Owner</th>
                    <th>Reason</th>
                    <th>Root cause</th>
                    <th className="text-right">Aging</th>
                    <th className="w-40 text-right">Actions</th>
                  </WBHead>
                  <WBBody>
                    {escalations.slice(0, 12).map(e => (
                      <tr
                        key={e.id}
                        className={e.propertyId ? 'cursor-pointer' : ''}
                        onClick={e.propertyId ? () => openByPropertyId(e.propertyId) : undefined}
                      >
                        <td><UrgencyDot urgency={e.severity} /></td>
                        <td className="max-w-[260px]">
                          <div className="font-medium truncate">{e.property}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{e.city} · {e.owner}</div>
                        </td>
                        <td className="text-[12px] max-w-[240px] truncate">{e.reason}</td>
                        <td className="text-[12px] text-muted-foreground">{e.rootCause}</td>
                        <td className="text-right"><AgingBadge days={e.agingDays} /></td>
                        <td className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <InlineQuickActions contact={e.owner} onOpen={() => openByPropertyId(e.propertyId)} />
                            <TakeActionMenu kind="escalation" taskTitle={`Escalation — ${e.reason}`} propertyName={e.property} propertyId={e.propertyId} onOpenProperty={openByPropertyId} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {escalations.length === 0 && <WBEmpty colSpan={6} message="No open escalations." />}
                  </WBBody>
                </WorkbenchTable>
              </WBSection>

              {/* Section C — Renewal Pipeline strip */}
              <WBSection
                title="Renewal pipeline"
                subtitle="Click a stage to open the renewal tracker"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1.5">
                  {renewalStages.map(s => (
                    <Link
                      key={s.key}
                      to="/renewals"
                      className={cn(
                        'border rounded px-2 py-2 bg-card hover:bg-muted/40 transition-colors',
                        s.tone === 'urgency-high' && 'border-urgency-high/40',
                        s.tone === 'urgency-critical' && 'border-urgency-critical/40',
                      )}
                    >
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                      <div className={cn(
                        'text-lg font-semibold tabular-nums',
                        s.tone === 'urgency-high' && 'text-urgency-high',
                        s.tone === 'urgency-critical' && 'text-urgency-critical',
                      )}>
                        {s.count}
                      </div>
                    </Link>
                  ))}
                </div>
              </WBSection>

              {/* Section E — Follow-up center */}
              <WBSection
                title="Daily follow-up center"
                subtitle="Pending callbacks and confirmations"
                count={followUps.length}
              >
                <WorkbenchTable minWidth={800}>
                  <WBHead>
                    <th>Contact</th>
                    <th>Topic</th>
                    <th>Channel</th>
                    <th className="text-right">Due</th>
                    <th className="text-right">Aging</th>
                    <th className="w-40 text-right">Actions</th>
                  </WBHead>
                  <WBBody>
                    {followUps.map(f => (
                      <tr
                        key={f.id}
                        className={f.propertyId ? 'cursor-pointer' : ''}
                        onClick={f.propertyId ? () => openByPropertyId(f.propertyId) : undefined}
                      >
                        <td className="font-medium">{f.with}</td>
                        <td className="text-[12px] text-foreground/80 max-w-[280px] truncate">{f.topic}</td>
                        <td className="text-[11px] uppercase tracking-wider text-muted-foreground">{f.channel}</td>
                        <td className="text-right text-[12px]">{f.due}</td>
                        <td className="text-right"><AgingBadge days={f.agingDays} /></td>
                        <td className="text-right">
                          <InlineQuickActions contact={f.with} onOpen={() => openByPropertyId(f.propertyId)} />
                        </td>
                      </tr>
                    ))}
                    {followUps.length === 0 && <WBEmpty colSpan={6} message="All follow-ups closed." />}
                  </WBBody>
                </WorkbenchTable>
              </WBSection>
            </TabsContent>

            {/* Section D — Re-Renting Queue (own tab, dominant) */}
            <TabsContent value="rerent" className="mt-3">
              <WBSection
                title="Re-renting queue"
                subtitle="Sorted by days vacant — vacancy leakage is a top-priority KPI"
                count={reRent.length}
              >
                <WorkbenchTable minWidth={1000}>
                  <WBHead>
                    <th>Property · Owner</th>
                    <th>City</th>
                    <th>Move-out</th>
                    <th className="text-right">Days vacant</th>
                    <th>Stage</th>
                    <th>Broker</th>
                    <th>Next action</th>
                    <th className="w-40 text-right">Actions</th>
                  </WBHead>
                  <WBBody>
                    {reRent.map(r => (
                      <tr
                        key={r.id}
                        className="cursor-pointer"
                        onClick={() => openByPropertyId(r.propertyId)}
                      >
                        <td className="max-w-[260px]">
                          <div className="font-medium truncate">{r.propertyName}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{r.ownerName}</div>
                        </td>
                        <td className="text-[12px]">{r.city}</td>
                        <td className="text-[12px]">{r.moveOutDate}</td>
                        <td className="text-right">
                          <span className={cn(
                            'text-[12px] font-semibold tabular-nums',
                            r.daysVacant > 30 ? 'text-urgency-critical'
                            : r.daysVacant > 14 ? 'text-urgency-high'
                            : 'text-foreground',
                          )}>{r.daysVacant}d</span>
                        </td>
                        <td>
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium', RERENT_TONE[r.stage])}>
                            {RERENT_STAGE_LABEL[r.stage]}
                          </span>
                        </td>
                        <td className="text-[12px]">{r.broker}</td>
                        <td className="text-[12px] text-foreground/80 max-w-[220px] truncate">{r.nextAction}</td>
                        <td className="text-right">
                          <InlineQuickActions contact={r.ownerName} onOpen={() => openByPropertyId(r.propertyId)} />
                        </td>
                      </tr>
                    ))}
                    {reRent.length === 0 && <WBEmpty colSpan={8} message="No vacant inventory." />}
                  </WBBody>
                </WorkbenchTable>
              </WBSection>
            </TabsContent>

            <TabsContent value="sr" className="mt-3">
              <ServiceRequestsPanel onOpenProperty={openByPropertyId} />
            </TabsContent>
            <TabsContent value="rent" className="mt-3">
              <RentTrackerPanel onOpenProperty={openByPropertyId} />
            </TabsContent>
            <TabsContent value="inspections" className="mt-3">
              <InspectionsPanel onOpenProperty={openByPropertyId} />
            </TabsContent>

            <TabsContent value="pipelines" className="space-y-4 mt-3">
              <WBSection title="Re-renting pipeline" subtitle="Vacancy stages">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
                  {(['move_out', 'vacant', 'broker_assigned', 'owner_self_rent', 'lost'] as const).map(k => {
                    const val = pipeline.reRenting[k === 'move_out' ? 'moveOut' : k === 'broker_assigned' ? 'brokerAssigned' : k === 'owner_self_rent' ? 'ownerSelfRent' : k];
                    return (
                      <div key={k} className="border rounded px-2 py-2 bg-card">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{RERENT_STAGE_LABEL[k]}</div>
                        <div className="text-lg font-semibold tabular-nums">{val}</div>
                      </div>
                    );
                  })}
                </div>
              </WBSection>
            </TabsContent>
          </Tabs>
        </main>

        <PropertyDetailModal
          property={openProperty}
          open={!!openProperty}
          onClose={() => setOpenProperty(null)}
        />
      </div>
    </PageTransition>
  );
}
