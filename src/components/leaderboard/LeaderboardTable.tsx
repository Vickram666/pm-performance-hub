import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PMLeaderboardEntry } from '@/types/leaderboard';
import { cn } from '@/lib/utils';

type PillarBreakdown = {
  operations: number;
  financial: number;
  customer: number;
  renewal: number;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

function hashSeed(input: string): number {
  // Simple deterministic hash for stable mock breakdowns
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function jitterFromSeed(seed: number, index: number) {
  // returns [-0.5, +0.5]
  const x = Math.sin(seed * 0.0001 + index * 1.7) * 10000;
  return (x - Math.floor(x)) - 0.5;
}

function derivePillarBreakdown(score: number, seedKey: string): PillarBreakdown {
  const s = Math.max(0, Math.min(100, score));
  const seed = hashSeed(seedKey);

  // Allocate score into the 4 pillars (40/15/20/25) with small deterministic variation.
  // Ensures: sum(earned) === score (to 1 decimal) and each pillar stays within its max.
  const caps = [40, 15, 20, 25] as const;
  const baseWeights = [40, 15, 20, 25].map((w) => w / 100);
  const raw = baseWeights.map((w, i) => s * w + jitterFromSeed(seed, i) * 2.0); // +/-2 pts variation

  // Clamp and compute remaining to distribute
  const clamped = raw.map((v, i) => Math.max(0, Math.min(caps[i], v)));
  const target = s;
  let current = clamped.reduce((sum, v) => sum + v, 0);

  // Distribute difference across pillars while respecting caps
  let delta = target - current;
  const order = [0, 3, 2, 1]; // ops, renewal, customer, financial
  for (let pass = 0; pass < 4 && Math.abs(delta) > 0.0001; pass++) {
    for (const idx of order) {
      if (Math.abs(delta) <= 0.0001) break;
      const cap = caps[idx];
      const availableUp = cap - clamped[idx];
      const availableDown = clamped[idx];
      const step = Math.sign(delta) * Math.min(Math.abs(delta), 1.25);
      if (step > 0 && availableUp > 0) {
        const applied = Math.min(step, availableUp);
        clamped[idx] += applied;
        delta -= applied;
      } else if (step < 0 && availableDown > 0) {
        const applied = Math.min(-step, availableDown);
        clamped[idx] -= applied;
        delta += applied;
      }
    }
  }

  // Final rounding to 1 decimal and enforce exact sum by adjusting operations.
  const rounded = clamped.map(round1);
  const roundedSum = round1(rounded.reduce((sum, v) => sum + v, 0));
  const diff = round1(s - roundedSum);
  rounded[0] = round1(Math.max(0, Math.min(caps[0], rounded[0] + diff)));

  return {
    operations: rounded[0],
    financial: rounded[1],
    customer: rounded[2],
    renewal: rounded[3],
  };
}

function formatPillar(earned: number, max: number) {
  const pct = Math.round((earned / max) * 100);
  return `${earned.toFixed(1)} / ${max} (${pct}%)`;
}

interface LeaderboardTableProps {
  entries: PMLeaderboardEntry[];
  cityFilter: string | null;
  zoneFilter: string | null;
}

export function LeaderboardTable({ entries, cityFilter, zoneFilter }: LeaderboardTableProps) {
  const navigate = useNavigate();

  const getPercentileStyle = (percentile: number | undefined) => {
    if (!percentile) return 'text-muted-foreground';
    if (percentile >= 80) return 'text-success bg-success/10';
    if (percentile >= 20) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  const getPayoutBadgeVariant = (status: string, payoutBand: string) => {
    switch (status) {
      case 'eligible':
        return 'default';
      case 'partial':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPayoutLabel = (status: string, payoutBand: string) => {
    if (status === 'eligible') return '100%';
    if (status === 'partial') return payoutBand;
    return 'Nil';
  };

  const handleRowClick = (pm: PMLeaderboardEntry) => {
    const params = new URLSearchParams();
    params.set('pmId', pm.id);
    if (cityFilter) params.set('city', cityFilter);
    if (zoneFilter) params.set('zone', zoneFilter);
    navigate(`/pm/${pm.id}?${params.toString()}`);
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Trophy className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No PMs found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[60px] text-center">Rank</TableHead>
            <TableHead>PM Name</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead className="text-right font-bold bg-primary/5">
              Monthly Score
            </TableHead>

            {/* New: transparent score composition */}
            <TableHead className="text-right">Operations &amp; Execution</TableHead>
            <TableHead className="text-right">Financial Discipline</TableHead>
            <TableHead className="text-right">Customer Experience</TableHead>
            <TableHead className="text-right">Renewal Performance</TableHead>

            <TableHead className="text-center">Payout</TableHead>
            <TableHead className="text-right">Portfolio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((pm, index) => (
            (() => {
              const breakdown = derivePillarBreakdown(pm.propertyScore, pm.id);
              return (
            <TableRow 
              key={pm.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleRowClick(pm)}
            >
              <TableCell className="text-center">
                <div className={cn(
                  "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                  getPercentileStyle(pm.percentile)
                )}>
                  {pm.rank || index + 1}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {pm.rank && pm.rank <= 3 && (
                    <Trophy className={cn(
                      "h-4 w-4",
                      pm.rank === 1 && "text-yellow-500",
                      pm.rank === 2 && "text-gray-400",
                      pm.rank === 3 && "text-amber-600"
                    )} />
                  )}
                  {pm.name}
                </div>
              </TableCell>
              <TableCell>{pm.city}</TableCell>
              <TableCell>{pm.zone}</TableCell>
              <TableCell className="text-right tabular-nums font-bold bg-primary/5">
                {pm.propertyScore}
              </TableCell>

              <TableCell className="text-right tabular-nums text-sm">
                {formatPillar(breakdown.operations, 40)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm">
                {formatPillar(breakdown.financial, 15)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm">
                {formatPillar(breakdown.customer, 20)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm">
                {formatPillar(breakdown.renewal, 25)}
              </TableCell>

              <TableCell className="text-center">
                <Badge variant={getPayoutBadgeVariant(pm.incentiveStatus, pm.payoutBand)}>
                  {getPayoutLabel(pm.incentiveStatus, pm.payoutBand)}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {pm.portfolioSize}
              </TableCell>
            </TableRow>
              );
            })()
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
