import { TrendingDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getScoreImpact, type ImpactCategory } from '@/data/accOperationsData';
import { cn } from '@/lib/utils';

interface Props {
  category: ImpactCategory;
  aging?: number;
  className?: string;
}

export function ScoreImpactBadge({ category, aging = 0, className }: Props) {
  const impact = getScoreImpact(category, aging);
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
              'bg-urgency-high-soft text-urgency-high cursor-help',
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <TrendingDown className="h-3 w-3" />
            -{impact.pointsAtRisk}pt · {impact.pillar.split(' ')[0]}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs space-y-1">
          <p className="text-xs font-semibold">Impact on your score</p>
          <p className="text-[11px]">
            <span className="text-muted-foreground">Metric:</span> {impact.metric}
          </p>
          <p className="text-[11px]">
            <span className="text-muted-foreground">Pillar:</span> {impact.pillar} (max {impact.pillarMax} pts)
          </p>
          <p className="text-[11px]">
            <span className="text-muted-foreground">At risk:</span> up to -{impact.pointsAtRisk} pts ({impact.percentImpact}% of total score)
          </p>
          <p className="text-[11px] text-muted-foreground border-t pt-1 mt-1">
            <span className="font-medium text-foreground">Incentive:</span> {impact.incentive}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
