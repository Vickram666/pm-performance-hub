import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { WorkbenchTable, WBHead, WBBody, WBEmpty } from '@/components/acc/primitives/WorkbenchTable';
import { UrgencyDot, AgingBadge } from '@/components/acc/primitives/AgingBadge';
import { ScoreImpactBadge } from '@/components/acc/ScoreImpactBadge';
import { InlineQuickActions } from '@/components/acc/primitives/InlineQuickActions';
import type { CriticalAction } from '@/data/accAggregators';
import { cn } from '@/lib/utils';

interface Props {
  actions: CriticalAction[];
  onOpenProperty: (propertyId: string) => void;
}

/**
 * Groups the flat action queue by property so PMs see all tasks
 * for one customer in one place — instead of ping-ponging between rows.
 * Only groups properties that have ≥2 open tasks; single-task rows render inline.
 */
export function PropertyGroupedQueue({ actions, onOpenProperty }: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, { propertyId: string; property: string; subtitle: string; contact: string; items: CriticalAction[] }>();
    const singles: CriticalAction[] = [];
    actions.forEach(a => {
      if (!a.propertyId) { singles.push(a); return; }
      const g = map.get(a.propertyId);
      const property = a.title.split(' — ')[1] || a.title;
      if (g) g.items.push(a);
      else map.set(a.propertyId, {
        propertyId: a.propertyId,
        property,
        subtitle: a.subtitle,
        contact: a.contact,
        items: [a],
      });
    });
    const multi = Array.from(map.values()).filter(g => g.items.length > 1);
    const singleFromMap = Array.from(map.values()).filter(g => g.items.length === 1).flatMap(g => g.items);
    // Sort multi by top urgency then task count
    const urgencyRank = { critical: 0, high: 1, medium: 2 } as const;
    multi.sort((a, b) => {
      const ua = Math.min(...a.items.map(i => urgencyRank[i.urgency]));
      const ub = Math.min(...b.items.map(i => urgencyRank[i.urgency]));
      return ua - ub || b.items.length - a.items.length;
    });
    return { multi, singles: [...singles, ...singleFromMap] };
  }, [actions]);

  return (
    <WorkbenchTable minWidth={1000}>
      <WBHead>
        <th className="w-6"></th>
        <th className="w-6"></th>
        <th>Property · Owner</th>
        <th className="text-right">Open tasks</th>
        <th>Categories</th>
        <th className="text-right">Worst aging</th>
        <th>Combined impact</th>
        <th className="w-40 text-right">Actions</th>
      </WBHead>
      <WBBody>
        {groups.multi.map(g => (
          <PropertyRow key={g.propertyId} group={g} onOpenProperty={onOpenProperty} />
        ))}
        {groups.singles.map(a => (
          <tr
            key={a.id}
            className={a.propertyId ? 'cursor-pointer' : ''}
            onClick={a.propertyId ? () => onOpenProperty(a.propertyId!) : undefined}
          >
            <td></td>
            <td><UrgencyDot urgency={a.urgency} /></td>
            <td className="max-w-[260px]">
              <div className="font-medium truncate">{a.title.replace(/^.* — /, '') || a.title}</div>
              <div className="text-[11px] text-muted-foreground truncate">{a.subtitle}</div>
            </td>
            <td className="text-right text-[12px] text-muted-foreground">1</td>
            <td>
              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium bg-muted text-muted-foreground">
                {a.category}
              </span>
            </td>
            <td className="text-right"><AgingBadge days={a.agingDays} /></td>
            <td><ScoreImpactBadge category={a.category} aging={a.agingDays} /></td>
            <td className="text-right">
              <InlineQuickActions contact={a.contact} onOpen={() => a.propertyId && onOpenProperty(a.propertyId)} />
            </td>
          </tr>
        ))}
        {groups.multi.length === 0 && groups.singles.length === 0 && <WBEmpty colSpan={8} />}
      </WBBody>
    </WorkbenchTable>
  );
}

function PropertyRow({
  group, onOpenProperty,
}: {
  group: { propertyId: string; property: string; subtitle: string; contact: string; items: CriticalAction[] };
  onOpenProperty: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const worstAging = Math.max(...group.items.map(i => i.agingDays));
  const urgencyRank = { critical: 0, high: 1, medium: 2 } as const;
  const topUrgency = group.items.reduce((acc, i) => urgencyRank[i.urgency] < urgencyRank[acc] ? i.urgency : acc, group.items[0].urgency);
  const categories = Array.from(new Set(group.items.map(i => i.category)));
  const totalImpact = group.items.reduce((s, i) => s + Math.min(15, 3 + Math.floor(i.agingDays / 3)), 0);

  return (
    <>
      <tr className="bg-muted/30 font-medium">
        <td>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
            className="p-0.5 hover:bg-muted rounded"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </td>
        <td><UrgencyDot urgency={topUrgency} /></td>
        <td className="max-w-[260px]">
          <div className="truncate">{group.property}</div>
          <div className="text-[11px] text-muted-foreground truncate font-normal">{group.subtitle}</div>
        </td>
        <td className="text-right tabular-nums text-urgency-critical">{group.items.length}</td>
        <td>
          <div className="flex flex-wrap gap-1">
            {categories.map(c => (
              <span key={c} className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider bg-muted text-muted-foreground font-normal">
                {c}
              </span>
            ))}
          </div>
        </td>
        <td className="text-right"><AgingBadge days={worstAging} /></td>
        <td>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-urgency-critical">
            −{totalImpact} pts at risk
          </span>
        </td>
        <td className="text-right">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenProperty(group.propertyId); }}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded border bg-card hover:bg-muted font-medium"
          >
            Open workspace <ExternalLink className="h-3 w-3" />
          </button>
        </td>
      </tr>
      {open && group.items.map(a => (
        <tr
          key={a.id}
          className="cursor-pointer bg-background/60"
          onClick={() => onOpenProperty(group.propertyId)}
        >
          <td></td>
          <td><UrgencyDot urgency={a.urgency} /></td>
          <td className={cn('pl-4 max-w-[260px]')}>
            <div className="text-[12px] truncate">{a.title.split(' — ')[0]}</div>
            <div className="text-[11px] text-muted-foreground truncate">{a.nextStep}</div>
          </td>
          <td></td>
          <td>
            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium bg-muted text-muted-foreground">
              {a.category}
            </span>
          </td>
          <td className="text-right"><AgingBadge days={a.agingDays} /></td>
          <td><ScoreImpactBadge category={a.category} aging={a.agingDays} /></td>
          <td className="text-right">
            <InlineQuickActions contact={a.contact} onOpen={() => onOpenProperty(group.propertyId)} />
          </td>
        </tr>
      ))}
    </>
  );
}
