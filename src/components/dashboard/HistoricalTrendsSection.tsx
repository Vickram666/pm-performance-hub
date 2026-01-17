import { TrendingUp, TrendingDown, Minus, Calendar, DollarSign, Award, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HistoricalTrends } from '@/types/dashboard';
import { ScoreTrendChart } from './charts/ScoreTrendChart';
import { IncentiveHistoryChart } from './charts/IncentiveHistoryChart';
import { PillarBreakdownChart } from './charts/PillarBreakdownChart';

interface HistoricalTrendsSectionProps {
  trends: HistoricalTrends;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const TrendIcon = ({ trend }: { trend: 'improving' | 'declining' | 'stable' }) => {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'declining':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-amber-500" />;
  }
};

const TrendBadge = ({ trend }: { trend: 'improving' | 'declining' | 'stable' }) => {
  const variants = {
    improving: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    declining: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    stable: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  };
  
  const labels = {
    improving: 'Improving',
    declining: 'Declining',
    stable: 'Stable',
  };
  
  return (
    <Badge className={`${variants[trend]} flex items-center gap-1`}>
      <TrendIcon trend={trend} />
      {labels[trend]}
    </Badge>
  );
};

export const HistoricalTrendsSection = ({ trends }: HistoricalTrendsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              12-Month Performance Trends
            </CardTitle>
            <CardDescription className="mt-1">
              Track your performance evolution and identify improvement patterns
            </CardDescription>
          </div>
          <TrendBadge trend={trends.trend} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{trends.averageTotalScore}</p>
            <p className="text-xs text-muted-foreground">Avg Total Score</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{formatCurrency(trends.totalIncentiveEarned)}</p>
            <p className="text-xs text-muted-foreground">Total Earned (12M)</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Award className="h-5 w-5 mx-auto mb-2 text-amber-500" />
            <p className="text-lg font-bold text-green-600">{trends.bestMonth}</p>
            <p className="text-xs text-muted-foreground">Best Month</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-lg font-bold text-red-600">{trends.worstMonth}</p>
            <p className="text-xs text-muted-foreground">Needs Improvement</p>
          </div>
        </div>

        {/* Score Trend Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3">Score Trends</h4>
          <ScoreTrendChart dataPoints={trends.dataPoints} />
        </div>

        {/* Two Column Layout for Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Incentive History */}
          <div>
            <h4 className="text-sm font-medium mb-3">Incentive History</h4>
            <IncentiveHistoryChart dataPoints={trends.dataPoints} />
          </div>

          {/* Pillar Breakdown */}
          <div>
            <h4 className="text-sm font-medium mb-3">Pillar Performance (Latest 6 Months)</h4>
            <PillarBreakdownChart dataPoints={trends.dataPoints.slice(-6)} />
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <TrendIcon trend={trends.trend} />
            Performance Insights
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {trends.trend === 'improving' && (
              <>
                <li>• Your scores have been consistently improving over the past 3 months</li>
                <li>• Property Score average is {trends.averagePropertyScore} - great trajectory!</li>
                <li>• Keep focusing on Financial Discipline to maintain momentum</li>
              </>
            )}
            {trends.trend === 'declining' && (
              <>
                <li>• Recent performance shows some decline - review coaching suggestions</li>
                <li>• Focus on areas with biggest drops to recover quickly</li>
                <li>• Consider reaching out to your Zone Manager for support</li>
              </>
            )}
            {trends.trend === 'stable' && (
              <>
                <li>• Performance has been consistent - aim for the next level</li>
                <li>• Small improvements in each pillar can boost your overall ranking</li>
                <li>• Your average of {trends.averageTotalScore} is solid - push for 160+</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
