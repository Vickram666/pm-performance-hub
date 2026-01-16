import { Building2, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CityStats, ZoneStats } from '@/types/leaderboard';
import { cn } from '@/lib/utils';

interface CityStatsCardProps {
  stats: CityStats;
  onZoneClick?: (zone: string) => void;
  selectedZone?: string | null;
}

export function CityStatsCard({ stats, onZoneClick, selectedZone }: CityStatsCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building2 className="h-5 w-5 text-primary" />
          {stats.city}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <p className="text-2xl font-bold text-primary">{stats.avgPropertyScore}</p>
            <p className="text-xs text-muted-foreground">Avg Property</p>
          </div>
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <p className="text-2xl font-bold text-accent-foreground">{stats.avgRevenueScore}</p>
            <p className="text-xs text-muted-foreground">Avg Revenue</p>
          </div>
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <p className="text-2xl font-bold">{stats.avgTotalScore}</p>
            <p className="text-xs text-muted-foreground">Avg Total</p>
          </div>
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <p className="text-2xl font-bold text-success">{stats.eligiblePercent}%</p>
            </div>
            <p className="text-xs text-muted-foreground">Eligible</p>
          </div>
        </div>

        {/* Zone Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Zone Performance ({stats.pmCount} PMs)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stats.zones.map((zone) => (
              <ZoneMiniCard
                key={zone.zone}
                zone={zone}
                isSelected={selectedZone === zone.zone}
                onClick={() => onZoneClick?.(zone.zone)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ZoneMiniCard({ 
  zone, 
  isSelected, 
  onClick 
}: { 
  zone: ZoneStats; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const scoreColor = zone.avgTotalScore >= 140 
    ? 'text-success' 
    : zone.avgTotalScore >= 100 
      ? 'text-warning' 
      : 'text-destructive';

  return (
    <div 
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
        isSelected 
          ? "bg-primary/10 border-primary" 
          : "bg-background/80 hover:bg-background"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{zone.zone}</span>
        <span className={cn("text-sm font-bold tabular-nums", scoreColor)}>
          {zone.avgTotalScore}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{zone.pmCount} PMs</span>
        <span>•</span>
        <span className="text-success">{zone.eligiblePercent}% eligible</span>
      </div>
      <Progress 
        value={zone.eligiblePercent} 
        className="h-1.5 mt-2" 
      />
    </div>
  );
}
