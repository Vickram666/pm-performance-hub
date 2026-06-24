import { useMemo, useState } from 'react';
import { Wrench, ArrowRight, MessageCircle } from 'lucide-react';
import { OperationalCard, SectionHeader } from '@/components/acc/primitives/OperationalCard';
import { AgingBadge, UrgencyDot } from '@/components/acc/primitives/AgingBadge';
import { ScoreImpactBadge } from './ScoreImpactBadge';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getServiceRequests, SR_STAGES, SR_STAGE_LABEL, SR_NEXT_ACTION, type ServiceRequest, type SrStage } from '@/data/accOperationsData';
import { cn } from '@/lib/utils';
import type { CommunicateContext } from './CommunicateModal';

interface Props {
  onOpenProperty: (propertyId: string) => void;
  onCommunicate: (ctx: CommunicateContext) => void;
}

const STAGE_TONE: Record<SrStage, string> = {
  open: 'bg-urgency-critical-soft text-urgency-critical',
  assigned: 'bg-urgency-high-soft text-urgency-high',
  in_progress: 'bg-urgency-medium-soft text-urgency-medium',
  on_hold: 'bg-urgency-high-soft text-urgency-high',
  resolved: 'bg-urgency-low-soft text-urgency-low',
  closed: 'bg-muted text-muted-foreground',
};

export function ServiceRequestsPanel({ onOpenProperty, onCommunicate }: Props) {
  const all = useMemo(() => getServiceRequests(), []);
  const [stage, setStage] = useState<'all' | SrStage>('all');

  const filtered = useMemo(() => stage === 'all' ? all : all.filter(s => s.stage === stage), [all, stage]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    SR_STAGES.forEach(s => { c[s] = all.filter(x => x.stage === s).length; });
    return c;
  }, [all]);

  const breached = filtered.filter(s => !s.withinTat && s.stage !== 'closed').length;
  const openOnly = filtered.filter(s => s.stage !== 'closed' && s.stage !== 'resolved');

  return (
    <section>
      <SectionHeader
        title="Service requests"
        subtitle={`${all.length} total · ${breached} breached TAT · live end-to-end tracking`}
        count={openOnly.length}
        right={
          <Tabs value={stage} onValueChange={(v) => setStage(v as typeof stage)}>
            <TabsList className="h-8 flex-wrap">
              <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
              {SR_STAGES.map(s => (
                <TabsTrigger key={s} value={s} className="text-xs">
                  {SR_STAGE_LABEL[s]} ({counts[s] ?? 0})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />

      <div className="space-y-2">
        {filtered.slice(0, 25).map(sr => (
          <SRCard key={sr.id} sr={sr} onOpenProperty={onOpenProperty} onCommunicate={onCommunicate} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No service requests in this view.</p>
        )}
      </div>
    </section>
  );
}

function SRCard({ sr, onOpenProperty, onCommunicate }: { sr: ServiceRequest } & Props) {
  const urgency = !sr.withinTat && sr.stage !== 'closed' ? 'critical' : sr.stage === 'open' ? 'high' : 'medium';
  const progress = ((SR_STAGES.indexOf(sr.stage) + 1) / SR_STAGES.length) * 100;
  return (
    <OperationalCard urgency={urgency as 'critical' | 'high' | 'medium'} className="p-3" onClick={() => onOpenProperty(sr.propertyId)}>
      <div className="pl-2">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <UrgencyDot urgency={urgency as 'critical' | 'high' | 'medium'} />
          <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-sm truncate">{sr.title}</span>
          <Badge variant="outline" className="text-[10px] font-normal">{sr.category}</Badge>
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium', STAGE_TONE[sr.stage])}>
            {SR_STAGE_LABEL[sr.stage]}
          </span>
          <AgingBadge days={sr.raisedDaysAgo} />
          {!sr.withinTat && sr.stage !== 'closed' && (
            <span className="text-[10px] font-semibold text-urgency-critical">
              TAT breached ({sr.elapsedHours}h / {sr.tatHours}h)
            </span>
          )}
          <ScoreImpactBadge category="sr" aging={sr.raisedDaysAgo} />
        </div>
        <p className="text-xs text-muted-foreground">
          {sr.propertyName} · {sr.city} · Owner {sr.ownerName} · Vendor {sr.vendor}
        </p>

        {/* Stage progress bar */}
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div className={cn('h-full transition-all', sr.withinTat ? 'bg-urgency-low' : 'bg-urgency-critical')} style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1.5 gap-2">
          <p className="text-[11px] text-foreground/70">
            <span className="font-medium">Next:</span> {SR_NEXT_ACTION[sr.stage]}
          </p>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1"
              onClick={() => onCommunicate({
                taskTitle: sr.title,
                nextStep: SR_NEXT_ACTION[sr.stage],
                contactName: sr.ownerName,
                contactPhone: sr.tenantContact,
                propertyName: sr.propertyName,
                propertyId: sr.propertyId,
                category: 'Service request',
              })}>
              <MessageCircle className="h-3 w-3" /> Communicate
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onOpenProperty(sr.propertyId)}>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </OperationalCard>
  );
}
