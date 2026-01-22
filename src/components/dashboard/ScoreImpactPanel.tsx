import { CoachingSuggestion, PropertyScore, PayoutBand } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertCircle, 
  Target, 
  Zap,
  Home,
  Calendar,
  FileWarning,
  ArrowRight
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ScoreImpact {
  category: string;
  description: string;
  impact: number;
  propertyCount?: number;
  icon: React.ReactNode;
}

interface QuickWin {
  action: string;
  potentialGain: number;
  effort: 'low' | 'medium' | 'high';
}

interface ScoreImpactPanelProps {
  currentScore: number;
  previousScore: number;
  payoutBand: PayoutBand;
  scoreImpacts: ScoreImpact[];
  quickWins: QuickWin[];
}

// Generate score impacts from property score data
export function generateScoreImpacts(propertyScore: PropertyScore): ScoreImpact[] {
  const impacts: ScoreImpact[] = [];
  
  // Financial penalties
  if (propertyScore.financial.latePenalty < 0) {
    impacts.push({
      category: 'Late Rent',
      description: 'Properties with late rent payments',
      impact: propertyScore.financial.latePenalty,
      propertyCount: Math.abs(propertyScore.financial.latePenalty) === 10 ? 3 : 
                     Math.abs(propertyScore.financial.latePenalty) === 5 ? 2 : 1,
      icon: <Home className="h-4 w-4" />,
    });
  }
  
  // Renewal issues
  const renewalMaxScore = 25;
  const renewalActual = propertyScore.renewal.timelyRenewalInitiation + 
                        propertyScore.renewal.renewalRAUploadTimely +
                        propertyScore.renewal.renewalPercentScore +
                        propertyScore.renewal.homeInsurance;
  const renewalGap = renewalMaxScore - renewalActual;
  
  if (renewalGap > 3) {
    impacts.push({
      category: 'Renewal Delays',
      description: 'Renewals initiated after SLA deadline',
      impact: -(renewalGap * 0.4),
      propertyCount: Math.ceil(renewalGap / 3),
      icon: <Calendar className="h-4 w-4" />,
    });
  }
  
  // Operations issues - SRs
  const srMaxScore = 10;
  const srGap = srMaxScore - propertyScore.operations.serviceRequestsSLAScore;
  if (srGap > 2) {
    impacts.push({
      category: 'Unresolved SRs',
      description: 'Service requests pending beyond SLA',
      impact: -(srGap * 0.3),
      propertyCount: Math.ceil(srGap / 2),
      icon: <FileWarning className="h-4 w-4" />,
    });
  }
  
  // Customer experience gaps
  const customerMaxScore = 20;
  const customerActual = propertyScore.customer.tenantAppReviewScore +
                         propertyScore.customer.ownerAppReviewScore +
                         propertyScore.customer.ownerAppDownload +
                         propertyScore.customer.tenantAppDownload;
  const customerGap = customerMaxScore - customerActual;
  
  if (customerGap > 4) {
    impacts.push({
      category: 'Low App Ratings',
      description: 'Below-target app reviews and downloads',
      impact: -(customerGap * 0.25),
      icon: <AlertCircle className="h-4 w-4" />,
    });
  }
  
  return impacts.sort((a, b) => a.impact - b.impact);
}

// Generate quick wins from impacts
export function generateQuickWins(impacts: ScoreImpact[]): QuickWin[] {
  const wins: QuickWin[] = [];
  
  impacts.forEach(impact => {
    if (impact.category === 'Late Rent' && impact.propertyCount) {
      wins.push({
        action: `Follow up on rent in ${Math.max(1, impact.propertyCount - 1)} properties`,
        potentialGain: Math.abs(impact.impact) * 0.7,
        effort: 'low',
      });
    }
    
    if (impact.category === 'Renewal Delays' && impact.propertyCount) {
      wins.push({
        action: `Lock ${Math.min(impact.propertyCount, 2)} pending renewals`,
        potentialGain: Math.abs(impact.impact) * 0.8,
        effort: 'medium',
      });
    }
    
    if (impact.category === 'Unresolved SRs') {
      wins.push({
        action: 'Close overdue service requests',
        potentialGain: Math.abs(impact.impact) * 0.6,
        effort: 'low',
      });
    }
  });
  
  return wins.sort((a, b) => b.potentialGain - a.potentialGain).slice(0, 3);
}

export function ScoreImpactPanel({ 
  currentScore, 
  previousScore, 
  payoutBand,
  scoreImpacts,
  quickWins 
}: ScoreImpactPanelProps) {
  const scoreChange = currentScore - previousScore;
  const isImproving = scoreChange > 0;
  
  // Calculate points needed for next band
  const getNextBandInfo = () => {
    if (payoutBand === '100%') return null;
    if (payoutBand === '75%') return { target: 80, needed: 80 - currentScore, band: '100%' };
    if (payoutBand === '50%') return { target: 70, needed: 70 - currentScore, band: '75%' };
    return { target: 60, needed: 60 - currentScore, band: '50%' };
  };
  
  const nextBandInfo = getNextBandInfo();
  
  return (
    <section className="score-card animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">Why Your Score Is What It Is</h2>
          <p className="text-sm text-muted-foreground">Score breakdown and actionable improvements</p>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-primary">{currentScore.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Current Score</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
            isImproving ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {isImproving ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            {scoreChange > 0 ? '+' : ''}{scoreChange.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">vs Last Month</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <Badge 
            variant="outline" 
            className={`text-lg px-3 py-1 ${
              payoutBand === '100%' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
              payoutBand === '75%' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              payoutBand === '50%' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              'bg-red-500/20 text-red-400 border-red-500/30'
            }`}
          >
            {payoutBand === 'nil' ? 'No Incentive' : `${payoutBand} Payout`}
          </Badge>
          <div className="text-sm text-muted-foreground mt-1">Incentive Eligibility</div>
        </div>
      </div>

      {/* Next Band Progress */}
      {nextBandInfo && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-6 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-foreground">
                Reach {nextBandInfo.band} payout
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                (need {nextBandInfo.needed.toFixed(1)} more points)
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(100, (currentScore / nextBandInfo.target) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Negative Impacts */}
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-400">
              <TrendingDown className="h-4 w-4" />
              Negative Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scoreImpacts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No significant negative impacts! 🎉
              </p>
            ) : (
              scoreImpacts.map((impact, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-red-400">{impact.icon}</div>
                    <div>
                      <div className="text-sm font-medium">
                        {impact.propertyCount && `${impact.propertyCount} properties with `}
                        {impact.category.toLowerCase()}
                      </div>
                      <div className="text-xs text-muted-foreground">{impact.description}</div>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                        {impact.impact.toFixed(1)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is reducing your score by {Math.abs(impact.impact).toFixed(1)} points</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Wins */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-400">
              <Zap className="h-4 w-4" />
              Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickWins.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Great work! Keep maintaining your performance.
              </p>
            ) : (
              quickWins.map((win, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      win.effort === 'low' ? 'bg-emerald-400' :
                      win.effort === 'medium' ? 'bg-amber-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <div className="text-sm font-medium">{win.action}</div>
                      <div className="text-xs text-muted-foreground">
                        {win.effort === 'low' ? 'Quick fix' : 
                         win.effort === 'medium' ? 'Moderate effort' : 'Requires focus'}
                      </div>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        +{win.potentialGain.toFixed(1)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Potential score improvement: +{win.potentialGain.toFixed(1)} points</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
