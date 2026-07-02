import { Info } from 'lucide-react';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Canonical operational definitions used across ACC.
// Every column header, KPI label, and stage chip should have a matching entry so
// a new user can hover to understand what the number means and how it moves.
export const GLOSSARY: Record<string, { term: string; short: string; how: string }> = {
  sla: {
    term: 'SLA (Service Level Agreement)',
    short: 'A promised turnaround on a service request before it counts as a breach.',
    how: 'SR SLA % = (SRs resolved within their TAT window ÷ total SRs in the period) × 100. Default TAT: Plumbing/Electrical 24h, others 48h. Below 80% = breach risk.',
  },
  tat: {
    term: 'TAT (Turnaround Time)',
    short: 'Hours allowed from SR raised to resolved.',
    how: 'Measured per category. Elapsed hours > TAT marks the request "breached" and starts deducting Operations pillar points.',
  },
  firstResponseSla: {
    term: 'First-response SLA',
    short: 'Time from SR raised to first vendor / PM acknowledgement.',
    how: 'Default: 2h during business hours. Missing this SLA impacts CX pillar even if the fix later closes on time.',
  },
  escalation: {
    term: 'Escalation',
    short: 'A property where multiple risk signals overlap and needs TL/leadership attention.',
    how: 'Auto-raised when ANY of: rent >7d late, owner rating <3.5, SLA <70%, or risk=high. Severity scales with aging.',
  },
  churn: {
    term: 'Churn',
    short: 'A property leaving the managed portfolio.',
    how: 'Total churn = (Renewal churn + Re-renting churn) ÷ active portfolio × 100 for the period.',
  },
  renewalChurn: {
    term: 'Renewal churn',
    short: 'Leases we lost at renewal time (tenant did not extend, deal fell through).',
    how: 'Renewal churn % = failed renewals ÷ renewal opportunities in the period × 100. Tracked separately from post-move-out losses.',
  },
  reRentChurn: {
    term: 'Re-renting churn',
    short: 'Properties we lost AFTER move-out (owner self-rented, broker rented, or gone).',
    how: 'Re-rent churn % = (owner self-rent + broker rent + inventory lost) ÷ move-outs in the period × 100.',
  },
  totalChurn: {
    term: 'Total portfolio churn',
    short: 'Blended view of every property that left the portfolio.',
    how: 'Total churn % = (renewal churn count + re-rent churn count) ÷ average active portfolio × 100.',
  },
  flagged: {
    term: 'Flagged task',
    short: 'A system-detected risk that requires your action.',
    how: 'Triggered by data thresholds (late rent, SLA breach, red renewal). Different from Expected = your routine PM jobs.',
  },
  expected: {
    term: 'Expected task',
    short: 'Routine PM duty already part of your job.',
    how: 'Periodic inspections, move-in/move-out reports, scheduled follow-ups. Aging windows are based on SOP, not exceptions.',
  },
  scoreImpact: {
    term: 'Score impact',
    short: 'Points at risk on your Property Health Score (0–100).',
    how: 'Each unresolved item maps to a pillar (Ops 40 · Fin 15 · CX 20 · Retention 25). Aging escalates the deduction.',
  },
  defaulter: {
    term: 'Chronic defaulter',
    short: 'Tenant late on rent for 3+ months in last 12.',
    how: 'Auto-flagged. Voids incentive payout for the property until cleared. Triggers legal-track workflow.',
  },
  aging: {
    term: 'Aging',
    short: 'How long a task has been open — the older, the worse the deduction.',
    how: 'Aging = days since the task became actionable (SR raised, rent overdue, inspection due). Deduction escalates every 3 days.',
  },
  csat: {
    term: 'CSAT (Customer Satisfaction)',
    short: 'Owner + tenant rating average (0–5).',
    how: 'CSAT = mean of owner rating (weight 60%) and tenant rating (weight 40%). <4.0 flags CX pillar for review.',
  },
  retention: {
    term: 'Retention %',
    short: 'Share of the portfolio we kept in the period.',
    how: 'Retention = 100 – churn %. Governs a large chunk of quarterly incentive multiplier for TLs and City Leads.',
  },
  occupancy: {
    term: 'Occupancy',
    short: 'Percent of managed properties currently occupied.',
    how: 'Occupancy = occupied ÷ (occupied + vacant) × 100. City target ≥ 92%.',
  },
  daysVacant: {
    term: 'Days vacant',
    short: 'Days a property has been un-rented after move-out.',
    how: 'Counted from move-out date. >30 days is critical inventory leakage — top escalation.',
  },
  renewalPct: {
    term: 'Renewal %',
    short: 'Share of renewal opportunities that closed successfully in the period.',
    how: 'Renewal % = renewed ÷ (renewed + failed) × 100. Feeds Retention pillar (25 pts).',
  },
  incentiveBand: {
    term: 'Incentive band',
    short: 'Your monthly payout slab based on Property Health Score.',
    how: '80+ = 100% payout, 70–79 = 75%, 60–69 = 50%, <60 = 0%. Any chronic defaulter or fraud flag overrides to 0%.',
  },
  slaBreach: {
    term: 'SLA breach',
    short: 'An SR whose elapsed hours exceeded the promised TAT.',
    how: 'Once breached, it stays counted against you until closed. Each breach reduces Ops score by 1–3 pts depending on aging.',
  },
  followUpSla: {
    term: 'Follow-up SLA',
    short: 'Promised response time on a scheduled callback / message.',
    how: 'Default: within the promised day. Two consecutive misses per week auto-flag for TL coaching.',
  },
  systemHygiene: {
    term: 'System hygiene',
    short: 'How well data is kept up to date — notes, statuses, uploads.',
    how: 'Composite of note-freshness, status accuracy, and document completeness. Poor hygiene inflates all other risk metrics.',
  },
  escalationRate: {
    term: 'Escalation rate',
    short: 'Share of a scope\'s properties currently in escalation state.',
    how: 'Escalation rate % = escalated properties ÷ portfolio × 100. >15% signals a system-level problem, not a PM problem.',
  },
  overloaded: {
    term: 'Overloaded PM',
    short: 'A PM whose portfolio load or pending queue is beyond healthy limits.',
    how: 'Overloaded = portfolio > 130 OR pending tasks > 12 OR overdue > 5. Reassign or redistribute before performance drops.',
  },
};

export type GlossaryKey = keyof typeof GLOSSARY;

interface HintProps {
  id: GlossaryKey;
  className?: string;
}

export function GlossaryHint({ id, className }: HintProps) {
  const g = GLOSSARY[id];
  if (!g) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`What is ${g.term}?`}
          className={cn('inline-flex items-center text-muted-foreground hover:text-foreground transition-colors', className)}
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-xs space-y-1.5" side="top" align="start">
        <p className="font-semibold text-sm">{g.term}</p>
        <p className="text-foreground/90">{g.short}</p>
        <p className="text-muted-foreground"><span className="font-medium text-foreground/80">How it's calculated: </span>{g.how}</p>
      </PopoverContent>
    </Popover>
  );
}

/**
 * <Explain id="sla">SLA</Explain> — inline label with a hover icon.
 * Use for any header, chip, or KPI label so anyone can self-serve the definition.
 */
export function Explain({ id, children, className }: HintProps & { children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {children}
      <GlossaryHint id={id} />
    </span>
  );
}

export function GlossaryButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/70"
        >
          <Info className="h-3 w-3" /> Glossary
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[60vh] overflow-y-auto text-xs space-y-3" side="bottom" align="end">
        {Object.entries(GLOSSARY).map(([k, g]) => (
          <div key={k} className="border-b last:border-0 pb-2 last:pb-0">
            <p className="font-semibold text-sm">{g.term}</p>
            <p className="text-foreground/90">{g.short}</p>
            <p className="text-muted-foreground mt-0.5">{g.how}</p>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
