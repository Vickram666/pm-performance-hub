import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Property } from '@/types/property';
import { PayoutBand, getPayoutBand } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface SimulatorIssue {
  id: string;
  propertyName: string;
  issue: string;
  recoveryPoints: number;
  category: string;
}

interface ScoreSimulatorProps {
  properties: Property[];
  currentScore: number;
  currentPayoutBand: PayoutBand;
}

function getPayoutLabel(band: PayoutBand) {
  if (band === '100%') return { label: '100% Payout', className: 'bg-success/15 text-success border-success/30' };
  if (band === '75%') return { label: '75% Payout', className: 'bg-warning/15 text-warning border-warning/30' };
  if (band === '50%') return { label: '50% Payout', className: 'bg-warning/15 text-warning border-warning/30' };
  return { label: 'No Incentive', className: 'bg-destructive/15 text-destructive border-destructive/30' };
}

export function ScoreSimulator({ properties, currentScore, currentPayoutBand }: ScoreSimulatorProps) {
  const issues = useMemo(() => {
    const result: SimulatorIssue[] = [];
    properties.forEach(p => {
      p.issues.forEach(issue => {
        if (issue.recoveryPoints > 0) {
          result.push({
            id: `${p.basic.propertyId}-${issue.id}`,
            propertyName: p.basic.propertyName,
            issue: issue.issue,
            recoveryPoints: Math.round((issue.recoveryPoints / properties.length) * 100) / 100,
            category: issue.category,
          });
        }
      });
    });
    return result.sort((a, b) => b.recoveryPoints - a.recoveryPoints).slice(0, 12);
  }, [properties]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const projectedGain = useMemo(() => {
    return issues
      .filter(i => selectedIds.has(i.id))
      .reduce((sum, i) => sum + i.recoveryPoints, 0);
  }, [selectedIds, issues]);

  const projectedScore = Math.min(100, Math.round((currentScore + projectedGain) * 10) / 10);
  const projectedBand = getPayoutBand(projectedScore);
  const currentPayout = getPayoutLabel(currentPayoutBand);
  const projectedPayoutInfo = getPayoutLabel(projectedBand);
  const bandImproved = projectedBand !== currentPayoutBand && projectedGain > 0;

  const reset = () => setSelectedIds(new Set());

  if (issues.length === 0) return null;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <span>Score Simulator — "What If?"</span>
          </div>
          {selectedIds.size > 0 && (
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={reset}>
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Score Preview */}
        <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-muted/50">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Current</div>
            <div className="text-2xl font-bold">{currentScore}</div>
            <Badge variant="outline" className={cn('text-xs mt-1', currentPayout.className)}>
              {currentPayout.label}
            </Badge>
          </div>
          {projectedGain > 0 && (
            <>
              <TrendingUp className="h-5 w-5 text-success shrink-0" />
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Projected</div>
                <div className="text-2xl font-bold text-success">{projectedScore}</div>
                <Badge variant="outline" className={cn('text-xs mt-1', projectedPayoutInfo.className)}>
                  {projectedPayoutInfo.label}
                </Badge>
              </div>
              <div className="ml-auto text-right">
                <div className="text-sm font-semibold text-success">+{projectedGain.toFixed(1)} pts</div>
                {bandImproved && (
                  <div className="text-xs text-success font-medium mt-0.5">🎉 Payout upgrade!</div>
                )}
              </div>
            </>
          )}
          {projectedGain === 0 && (
            <div className="flex-1 text-sm text-muted-foreground">
              Select issues below to see projected score improvement
            </div>
          )}
        </div>

        {/* Issue List */}
        <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
          {issues.map(issue => (
            <label
              key={issue.id}
              className={cn(
                'flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all',
                selectedIds.has(issue.id)
                  ? 'bg-success/5 border-success/30'
                  : 'bg-card border-transparent hover:bg-muted/50'
              )}
            >
              <Checkbox
                checked={selectedIds.has(issue.id)}
                onCheckedChange={() => toggle(issue.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{issue.issue}</p>
                <p className="text-xs text-muted-foreground truncate">{issue.propertyName}</p>
              </div>
              <Badge variant="outline" className="text-xs text-success border-success/30 shrink-0">
                +{issue.recoveryPoints.toFixed(1)}
              </Badge>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
