import { Building2, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CityStats } from '@/types/leaderboard';
import { cn } from '@/lib/utils';

interface CityStatsCardProps {
  stats: CityStats;
  onClick?: () => void;
}

export function CityStatsCard({ stats, onClick }: CityStatsCardProps) {
  const scoreColor = stats.avgPropertyScore >= 80 
    ? 'text-success' 
    : stats.avgPropertyScore >= 70 
      ? 'text-warning' 
      : stats.avgPropertyScore >= 60
        ? 'text-warning'
        : 'text-destructive';

  return (
    <Card 
      className={cn(
        "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20",
        onClick && "cursor-pointer hover:shadow-md transition-all"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building2 className="h-5 w-5 text-primary" />
          {stats.city}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <p className={cn("text-2xl font-bold tabular-nums", scoreColor)}>{stats.avgPropertyScore}</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <p className="text-2xl font-bold text-success">{stats.eligiblePercent}%</p>
            </div>
            <p className="text-xs text-muted-foreground">100% Payout</p>
          </div>
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{stats.pmCount}</p>
            </div>
            <p className="text-xs text-muted-foreground">PMs</p>
          </div>
        </div>
        <Progress value={stats.eligiblePercent} className="h-1.5" />
      </CardContent>
    </Card>
  );
}
