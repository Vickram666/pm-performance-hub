import { useMemo } from 'react';
import { ListChecks, AlertTriangle, RefreshCw, Home, Timer, MessageCircle, ShieldAlert } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { KpiPill, KpiBar } from '@/components/acc/primitives/KpiPill';
import { OperationalCard, SectionHeader } from '@/components/acc/primitives/OperationalCard';
import { AgingBadge, SlaTimer, UrgencyDot } from '@/components/acc/primitives/AgingBadge';
import { QuickActions } from '@/components/acc/primitives/QuickActions';
import { PipelineFunnel } from '@/components/acc/primitives/PipelineFunnel';
import {
  getCriticalActions, getEscalations, getFollowUps,
  getOperationalSummary, getPipelineCounts,
} from '@/data/accAggregators';
import { mockPMData } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PMCommand() {
  const summary = useMemo(() => getOperationalSummary(), []);
  const actions = useMemo(() => getCriticalActions(), []);
  const escalations = useMemo(() => getEscalations(), []);
  const pipeline = useMemo(() => getPipelineCounts(), []);
  const followUps = useMemo(() => getFollowUps(), []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-16">
        <header className="border-b bg-card">
          <div className="container py-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Property Manager</p>
              <h1 className="text-xl font-semibold tracking-tight">
                {mockPMData.profile.name} · Command Center
              </h1>
              <p className="text-xs text-muted-foreground">Operational inbox — what needs you today</p>
            </div>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              My Score view <ArrowRight className="h-3 w-3" />
            </Link>
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

        <main className="container py-6 space-y-8">
          {/* Critical Actions Queue */}
          <section>
            <SectionHeader
              title="Today's critical actions"
              subtitle="Prioritized inbox — act in order, then close out"
              count={actions.length}
            />
            <div className="space-y-2">
              {actions.slice(0, 12).map(a => (
                <OperationalCard key={a.id} urgency={a.urgency} className="p-3">
                  <div className="flex items-center gap-3 pl-2">
                    <UrgencyDot urgency={a.urgency} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{a.title}</span>
                        <AgingBadge days={a.agingDays} />
                        <SlaTimer hoursLeft={a.hoursLeft} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{a.subtitle}</p>
                      <p className="text-[11px] text-foreground/70 mt-0.5">
                        <span className="font-medium">Next:</span> {a.nextStep}
                      </p>
                    </div>
                    <QuickActions context={a.contact} />
                    <Link to={a.link} className="text-muted-foreground hover:text-foreground">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </OperationalCard>
              ))}
              {actions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">All clear — no critical actions.</p>
              )}
            </div>
          </section>

          {/* Escalation Risk Panel */}
          <section>
            <SectionHeader title="Escalation risk" subtitle="Aging escalations and customer dissatisfaction" count={escalations.length} />
            <div className="grid md:grid-cols-2 gap-2">
              {escalations.slice(0, 8).map(e => (
                <OperationalCard key={e.id} urgency={e.severity} className="p-3">
                  <div className="pl-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{e.property}</p>
                      <AgingBadge days={e.agingDays} />
                    </div>
                    <p className="text-xs text-muted-foreground">{e.city} · {e.owner}</p>
                    <p className="text-xs mt-1">{e.reason}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Root cause: <span className="text-foreground/80">{e.rootCause}</span></p>
                  </div>
                </OperationalCard>
              ))}
            </div>
          </section>

          {/* Renewal Pipeline */}
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

          {/* Re-Renting Pipeline */}
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

          {/* Daily Follow-up Center */}
          <section>
            <SectionHeader title="Daily follow-up center" subtitle="Pending callbacks and confirmations" count={followUps.length} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {followUps.map(f => (
                <OperationalCard key={f.id} urgency={f.agingDays >= 3 ? 'high' : f.agingDays >= 1 ? 'medium' : 'low'} className="p-3">
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
        </main>
      </div>
    </PageTransition>
  );
}
