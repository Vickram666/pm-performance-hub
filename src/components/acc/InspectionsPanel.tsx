import { useMemo, useState } from 'react';
import { ClipboardCheck, CheckCircle2, Circle } from 'lucide-react';
import { OperationalCard, SectionHeader } from '@/components/acc/primitives/OperationalCard';
import { AgingBadge, UrgencyDot } from '@/components/acc/primitives/AgingBadge';
import { ScoreImpactBadge } from './ScoreImpactBadge';
import { TakeActionMenu } from './TakeActionMenu';
import { AuditTimeline } from './AuditTimeline';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getInspectionRecords, INSP_LABEL, type InspectionType } from '@/data/accOperationsData';
import { cn } from '@/lib/utils';

interface Props {
  onOpenProperty: (propertyId: string) => void;
}

const TABS: ('all' | InspectionType)[] = ['all', 'periodic', 'move_in', 'move_out'];

export function InspectionsPanel({ onOpenProperty }: Props) {
  const all = useMemo(() => getInspectionRecords(), []);
  const [tab, setTab] = useState<'all' | InspectionType>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [audit, setAudit] = useState<{ id: string; title: string; prop: string } | null>(null);

  const counts = useMemo(() => ({
    all: all.length,
    periodic: all.filter(i => i.type === 'periodic').length,
    move_in: all.filter(i => i.type === 'move_in').length,
    move_out: all.filter(i => i.type === 'move_out').length,
  }), [all]);

  const filtered = useMemo(() => {
    let list = tab === 'all' ? all : all.filter(i => i.type === tab);
    if (!showCompleted) list = list.filter(i => i.status !== 'completed');
    return list.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [all, tab, showCompleted]);

  return (
    <section>
      <SectionHeader
        title="Inspections & move-in/out journey"
        subtitle="Periodic walkthroughs, move-in and move-out reports with end-to-end steps"
        count={filtered.length}
        right={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowCompleted(s => !s)}>
              {showCompleted ? 'Hide completed' : 'Show completed'}
            </Button>
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList className="h-8">
                {TABS.map(t => (
                  <TabsTrigger key={t} value={t} className="text-xs">
                    {t === 'all' ? `All (${counts.all})` : `${INSP_LABEL[t as InspectionType]} (${counts[t as InspectionType]})`}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        }
      />

      <div className="grid md:grid-cols-2 gap-2">
        {filtered.slice(0, 20).map(r => {
          const urg = r.status === 'completed' ? 'low'
            : r.daysOverdue > 14 ? 'critical'
            : r.daysOverdue > 7 ? 'high'
            : 'medium';
          const impactCat = r.type === 'move_in' ? 'move_in' : r.type === 'move_out' ? 'move_out' : 'inspection';
          const title = `${INSP_LABEL[r.type]} — ${r.propertyName}`;
          return (
            <OperationalCard key={r.id} urgency={urg as 'critical' | 'high' | 'medium' | 'low'} className="p-3" onClick={() => onOpenProperty(r.propertyId)}>
              <div className="pl-2">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <UrgencyDot urgency={urg as 'critical' | 'high' | 'medium' | 'low'} />
                  <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-sm truncate">{title}</span>
                  {r.status !== 'completed' && r.daysOverdue > 0 && <AgingBadge days={r.daysOverdue} />}
                  {r.status === 'completed' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-urgency-low-soft text-urgency-low uppercase tracking-wider font-medium">Done</span>
                  )}
                  {r.status !== 'completed' && <ScoreImpactBadge category={impactCat} aging={r.daysOverdue} />}
                </div>
                <p className="text-xs text-muted-foreground">{r.city} · Owner {r.ownerName}</p>

                <ol className="mt-2 space-y-1">
                  {r.journey.map((j, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                      {j.done
                        ? <CheckCircle2 className="h-3 w-3 text-urgency-low shrink-0" />
                        : <Circle className="h-3 w-3 text-muted-foreground shrink-0" />}
                      <span className={cn(j.done ? 'text-foreground/80 line-through decoration-muted-foreground/40' : 'text-foreground')}>
                        {j.step}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="flex items-center justify-between mt-2 gap-2">
                  <p className="text-[11px] text-foreground/70">
                    <span className="font-medium">Next:</span> {r.nextAction}
                  </p>
                  <TakeActionMenu kind="inspection" taskTitle={title} propertyName={r.propertyName} propertyId={r.propertyId}
                    onOpenProperty={onOpenProperty}
                    onOpenAudit={() => setAudit({ id: r.id, title, prop: r.propertyName })} />
                </div>
              </div>
            </OperationalCard>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8 md:col-span-2">No records.</p>
        )}
      </div>

      <AuditTimeline open={!!audit} onClose={() => setAudit(null)} taskId={audit?.id ?? null} taskTitle={audit?.title} propertyName={audit?.prop} />
    </section>
  );
}
