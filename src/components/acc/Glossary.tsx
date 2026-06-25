import { Info } from 'lucide-react';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Canonical operational definitions used across ACC.
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
  escalation: {
    term: 'Escalation',
    short: 'A property where multiple risk signals overlap and need TL/leadership attention.',
    how: 'Auto-raised when ANY of: rent >7d late, owner rating <3.5, SLA <70%, or risk=high. Severity scales with aging.',
  },
  churn: {
    term: 'Churn',
    short: 'A property leaving the managed portfolio.',
    how: 'Calculated as failed renewals + lost vacant inventory, divided by active portfolio for the period.',
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
};

export function GlossaryHint({ id, className }: { id: keyof typeof GLOSSARY; className?: string }) {
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
