import { TrendingDown, RefreshCw, Home } from 'lucide-react';
import { OperationalCard } from '@/components/acc/primitives/OperationalCard';
import { Explain, GlossaryHint } from '@/components/acc/Glossary';
import { cn } from '@/lib/utils';
import type { ChurnIntelligence } from '@/data/accAggregators';

interface Props {
  churn: ChurnIntelligence;
  portfolio: number;
  onCityClick?: (city: string) => void;
}

/**
 * Leadership-only three-part churn view:
 *   1. Renewal churn (lease-end losses)
 *   2. Re-renting churn (post-move-out losses)
 *   3. Total portfolio churn (blended)
 * City rows are clickable — drill straight into that city's view.
 */
export function ThreePartChurn({ churn, portfolio, onCityClick }: Props) {
  const renewalCount = churn.renewalChurn.total;
  const reRentCount = churn.reRentChurn.total;
  const totalCount = renewalCount + reRentCount;
  const totalPct = portfolio > 0 ? Math.round((totalCount / portfolio) * 100) : 0;
  const renewalPct = portfolio > 0 ? Math.round((renewalCount / portfolio) * 100) : 0;
  const reRentPct = portfolio > 0 ? Math.round((reRentCount / portfolio) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-3 gap-3">
        <ChurnCard
          title="Renewal churn"
          glossary="renewalChurn"
          icon={<RefreshCw className="h-3.5 w-3.5" />}
          count={renewalCount}
          pct={renewalPct}
          caption="Leases lost at renewal"
          tone="urgency-critical"
          causes={churn.renewalChurn.causes}
        />
        <ChurnCard
          title="Re-renting churn"
          glossary="reRentChurn"
          icon={<Home className="h-3.5 w-3.5" />}
          count={reRentCount}
          pct={reRentPct}
          caption="Lost after move-out"
          tone="urgency-high"
          causes={churn.reRentChurn.causes}
        />
        <ChurnCard
          title="Total portfolio churn"
          glossary="totalChurn"
          icon={<TrendingDown className="h-3.5 w-3.5" />}
          count={totalCount}
          pct={totalPct}
          caption="Blended — renewal + re-rent"
          tone="foreground"
          highlight
        />
      </div>

      <OperationalCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
            City churn leaderboard <GlossaryHint id="churn" />
          </p>
          <span className="text-[10px] text-muted-foreground">Click a city to drill in</span>
        </div>
        <ul className="space-y-1.5">
          {churn.cityChurn.map(c => (
            <li key={c.city}>
              <button
                type="button"
                onClick={() => onCityClick?.(c.city)}
                className="w-full flex items-center gap-2 text-sm py-1 px-1.5 rounded hover:bg-muted/50 transition-colors text-left"
              >
                <span className="flex-1 text-foreground/80">{c.city}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full', c.rate > 10 ? 'bg-urgency-critical' : c.rate > 6 ? 'bg-urgency-high' : 'bg-urgency-medium')}
                    style={{ width: `${Math.min(100, c.rate * 6)}%` }}
                  />
                </div>
                <span className="tabular-nums w-10 text-right text-muted-foreground">{c.rate}%</span>
              </button>
            </li>
          ))}
        </ul>
      </OperationalCard>
    </div>
  );
}

function ChurnCard({
  title, glossary, icon, count, pct, caption, tone, causes, highlight,
}: {
  title: string;
  glossary: 'renewalChurn' | 'reRentChurn' | 'totalChurn';
  icon: React.ReactNode;
  count: number;
  pct: number;
  caption: string;
  tone: string;
  causes?: { label: string; count: number }[];
  highlight?: boolean;
}) {
  return (
    <OperationalCard className={cn('p-4', highlight && 'border-foreground/30')}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
          {icon}
          <Explain id={glossary}>{title}</Explain>
        </p>
      </div>
      <div className="flex items-baseline gap-2">
        <p className={cn('text-3xl font-semibold tabular-nums', `text-${tone}`)}>{count}</p>
        <p className="text-sm text-muted-foreground">/ {pct}%</p>
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5">{caption}</p>

      {causes && causes.length > 0 && (
        <ul className="mt-3 space-y-1">
          {causes.map(c => (
            <li key={c.label} className="flex items-center gap-2 text-[12px]">
              <span className="flex-1 text-foreground/80 truncate">{c.label}</span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div className={cn('h-full', `bg-${tone}`)} style={{ width: `${(c.count / Math.max(count, 1)) * 100}%` }} />
              </div>
              <span className="tabular-nums w-6 text-right text-muted-foreground">{c.count}</span>
            </li>
          ))}
        </ul>
      )}
    </OperationalCard>
  );
}
