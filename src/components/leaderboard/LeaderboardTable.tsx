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
import { PMLeaderboardEntry, ScoreType } from '@/types/leaderboard';
import { cn } from '@/lib/utils';

interface LeaderboardTableProps {
  entries: PMLeaderboardEntry[];
  scoreType: ScoreType;
  cityFilter: string | null;
  zoneFilter: string | null;
}

export function LeaderboardTable({ entries, scoreType, cityFilter, zoneFilter }: LeaderboardTableProps) {
  const navigate = useNavigate();

  const getPercentileStyle = (percentile: number | undefined) => {
    if (!percentile) return 'text-muted-foreground';
    if (percentile >= 80) return 'text-success bg-success/10';
    if (percentile >= 20) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  const getPercentileIcon = (percentile: number | undefined) => {
    if (!percentile) return <Minus className="h-4 w-4" />;
    if (percentile >= 80) return <TrendingUp className="h-4 w-4" />;
    if (percentile >= 20) return <Minus className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getIncentiveVariant = (status: string) => {
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

  const handleRowClick = (pm: PMLeaderboardEntry) => {
    const params = new URLSearchParams();
    params.set('pmId', pm.id);
    if (cityFilter) params.set('city', cityFilter);
    if (zoneFilter) params.set('zone', zoneFilter);
    navigate(`/pm/${pm.id}?${params.toString()}`);
  };

  const getSortedScore = (pm: PMLeaderboardEntry) => {
    switch (scoreType) {
      case 'property':
        return pm.propertyScore;
      case 'revenue':
        return pm.revenueScore;
      default:
        return pm.totalScore;
    }
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
            <TableHead className="text-right">Property</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className={cn("text-right font-bold", scoreType === 'total' && "bg-primary/5")}>
              Total
            </TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Portfolio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((pm, index) => (
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
              <TableCell className={cn(
                "text-right tabular-nums",
                scoreType === 'property' && "font-bold bg-primary/5"
              )}>
                {pm.propertyScore}
              </TableCell>
              <TableCell className={cn(
                "text-right tabular-nums",
                scoreType === 'revenue' && "font-bold bg-primary/5"
              )}>
                {pm.revenueScore}
              </TableCell>
              <TableCell className={cn(
                "text-right tabular-nums font-semibold",
                scoreType === 'total' && "bg-primary/5"
              )}>
                {pm.totalScore}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getIncentiveVariant(pm.incentiveStatus)}>
                  {pm.incentiveStatus === 'eligible' ? 'Eligible' : 
                   pm.incentiveStatus === 'partial' ? 'Partial' : 'Blocked'}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {pm.portfolioSize}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
