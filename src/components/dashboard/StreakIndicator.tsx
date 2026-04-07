import { Flame, TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HistoricalDataPoint, PayoutBand } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface StreakIndicatorProps {
  dataPoints: HistoricalDataPoint[];
  trend: 'improving' | 'declining' | 'stable';
}

function calculateStreak(dataPoints: HistoricalDataPoint[]): { type: 'green' | 'payout' | 'improving'; months: number } | null {
  if (dataPoints.length < 2) return null;

  const recent = [...dataPoints].reverse();

  // Check green (≥80) streak
  let greenStreak = 0;
  for (const dp of recent) {
    if (dp.propertyScore >= 80) greenStreak++;
    else break;
  }
  if (greenStreak >= 2) return { type: 'green', months: greenStreak };

  // Check consecutive improvement
  let improvingStreak = 0;
  for (let i = 0; i < recent.length - 1; i++) {
    if (recent[i].propertyScore > recent[i + 1].propertyScore) improvingStreak++;
    else break;
  }
  if (improvingStreak >= 2) return { type: 'improving', months: improvingStreak };

  // Check payout streak (≥60)
  let payoutStreak = 0;
  for (const dp of recent) {
    if (dp.propertyScore >= 60) payoutStreak++;
    else break;
  }
  if (payoutStreak >= 3) return { type: 'payout', months: payoutStreak };

  return null;
}

export function StreakIndicator({ dataPoints, trend }: StreakIndicatorProps) {
  const streak = calculateStreak(dataPoints);

  const trendConfig = {
    improving: { icon: TrendingUp, label: 'Trending Up', className: 'text-success' },
    declining: { icon: TrendingDown, label: 'Trending Down', className: 'text-destructive' },
    stable: { icon: Minus, label: 'Stable', className: 'text-muted-foreground' },
  };

  const TrendIcon = trendConfig[trend].icon;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Trend badge */}
      <Badge variant="outline" className={cn('gap-1', trendConfig[trend].className)}>
        <TrendIcon className="h-3 w-3" />
        {trendConfig[trend].label}
      </Badge>

      {/* Streak badge */}
      {streak && streak.type === 'green' && (
        <Badge variant="outline" className="gap-1 text-success border-success/30 bg-success/10">
          <Flame className="h-3 w-3" />
          {streak.months}-month green streak 🔥
        </Badge>
      )}
      {streak && streak.type === 'improving' && (
        <Badge variant="outline" className="gap-1 text-primary border-primary/30 bg-primary/10">
          <TrendingUp className="h-3 w-3" />
          {streak.months}-month improvement streak ↗
        </Badge>
      )}
      {streak && streak.type === 'payout' && (
        <Badge variant="outline" className="gap-1 text-warning border-warning/30 bg-warning/10">
          <Award className="h-3 w-3" />
          {streak.months}-month payout streak
        </Badge>
      )}
    </div>
  );
}
