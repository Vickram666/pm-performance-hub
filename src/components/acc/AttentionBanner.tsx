import { AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Single-line attention banner shown at the top of every scoped view.
 * Purpose: focus user on the ONE most urgent thing right now.
 */
interface Props {
  headline: string;
  detail?: string;
  cta?: { label: string; onClick: () => void };
  tone?: 'critical' | 'high' | 'ok';
  className?: string;
}

export function AttentionBanner({ headline, detail, cta, tone = 'high', className }: Props) {
  const toneCls = tone === 'critical'
    ? 'bg-urgency-critical-soft border-urgency-critical/30 text-urgency-critical'
    : tone === 'ok'
    ? 'bg-success/10 border-success/30 text-success'
    : 'bg-urgency-high-soft border-urgency-high/30 text-urgency-high';

  return (
    <div className={cn('flex items-center gap-2 border rounded px-3 py-2 text-[12px]', toneCls, className)}>
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span className="font-medium">{headline}</span>
      {detail && <span className="text-foreground/70 truncate">{detail}</span>}
      {cta && (
        <button
          type="button"
          onClick={cta.onClick}
          className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium underline-offset-2 hover:underline"
        >
          {cta.label} <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
