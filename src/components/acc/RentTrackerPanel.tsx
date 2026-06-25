import { useMemo, useState } from 'react';
import { IndianRupee, AlertTriangle } from 'lucide-react';
import { OperationalCard, SectionHeader } from '@/components/acc/primitives/OperationalCard';
import { AgingBadge, UrgencyDot } from '@/components/acc/primitives/AgingBadge';
import { ScoreImpactBadge } from './ScoreImpactBadge';
import { GlossaryHint } from './Glossary';
import { TakeActionMenu } from './TakeActionMenu';
import { AuditTimeline } from './AuditTimeline';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getRentLedger, RENT_STATUS_LABEL, type RentStatus } from '@/data/accOperationsData';
import { cn } from '@/lib/utils';

interface Props {
  onOpenProperty: (propertyId: string) => void;
}

const TONE: Record<RentStatus, 'critical' | 'high' | 'medium' | 'low'> = {
  paid: 'low', due: 'medium', overdue: 'high', critically_overdue: 'critical', defaulter: 'critical',
};
const STATUS_TONE: Record<RentStatus, string> = {
  paid: 'bg-urgency-low-soft text-urgency-low',
  due: 'bg-urgency-medium-soft text-urgency-medium',
  overdue: 'bg-urgency-high-soft text-urgency-high',
  critically_overdue: 'bg-urgency-critical-soft text-urgency-critical',
  defaulter: 'bg-urgency-critical-soft text-urgency-critical',
};

const TABS: ('all' | RentStatus)[] = ['all', 'due', 'overdue', 'critically_overdue', 'defaulter', 'paid'];

export function RentTrackerPanel({ onOpenProperty }: Props) {
  const all = useMemo(() => getRentLedger(), []);
  const [tab, setTab] = useState<'all' | RentStatus>('overdue');
  const [audit, setAudit] = useState<{ id: string; title: string; prop: string } | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    (['paid', 'due', 'overdue', 'critically_overdue', 'defaulter'] as RentStatus[]).forEach(s => {
      c[s] = all.filter(r => r.status === s).length;
    });
    return c;
  }, [all]);

  const filtered = useMemo(() => tab === 'all' ? all : all.filter(r => r.status === tab), [all, tab]);
  const totalAtRisk = filtered.filter(r => r.status !== 'paid').reduce((s, r) => s + r.rentAmount, 0);

  return (
    <section>
      <SectionHeader
        title={<span className="inline-flex items-center gap-1.5">Rent ledger <GlossaryHint id="defaulter" /></span>}
        subtitle={`₹${(totalAtRisk / 1000).toFixed(0)}K at risk · chronic defaulters tracked separately`}
        count={filtered.filter(r => r.status !== 'paid').length}
        right={
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="h-8 flex-wrap">
              {TABS.map(t => (
                <TabsTrigger key={t} value={t} className="text-xs">
                  {t === 'all' ? `All (${counts.all})` : `${RENT_STATUS_LABEL[t as RentStatus]} (${counts[t] ?? 0})`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />

      <div className="space-y-2">
        {filtered.slice(0, 25).map(r => {
          const urg = TONE[r.status];
          const isChronic = r.monthsLatePast12 >= 3;
          const title = `${RENT_STATUS_LABEL[r.status]} — ₹${r.rentAmount.toLocaleString('en-IN')} (${r.daysLate}d late)`;
          return (
            <OperationalCard key={r.id} urgency={urg} className="p-3" onClick={() => onOpenProperty(r.propertyId)}>
              <div className="pl-2">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <UrgencyDot urgency={urg} />
                  <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-sm truncate">{r.propertyName} — ₹{r.rentAmount.toLocaleString('en-IN')}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium', STATUS_TONE[r.status])}>
                    {RENT_STATUS_LABEL[r.status]}
                  </span>
                  {r.daysLate > 0 && <AgingBadge days={r.daysLate} />}
                  {isChronic && (
                    <Badge variant="destructive" className="text-[10px] gap-1">
                      <AlertTriangle className="h-3 w-3" /> Chronic · {r.monthsLatePast12}/12 mo
                    </Badge>
                  )}
                  {r.status !== 'paid' && <ScoreImpactBadge category="rent" aging={r.daysLate} />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.city} · Tenant {r.tenantName} · Owner {r.ownerName} · Due {r.dueDate} · Last paid {r.lastPaidOn}
                </p>
                <div className="flex items-center justify-between mt-1.5 gap-2">
                  <p className="text-[11px] text-foreground/70">
                    <span className="font-medium">Next:</span> {r.nextAction}
                  </p>
                  <TakeActionMenu kind="rent" taskTitle={title} propertyName={r.propertyName} propertyId={r.propertyId}
                    onOpenProperty={onOpenProperty}
                    onOpenAudit={() => setAudit({ id: r.id, title, prop: r.propertyName })} />
                </div>
              </div>
            </OperationalCard>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No records in this view.</p>
        )}
      </div>

      <AuditTimeline open={!!audit} onClose={() => setAudit(null)} taskId={audit?.id ?? null} taskTitle={audit?.title} propertyName={audit?.prop} />
    </section>
  );
}
